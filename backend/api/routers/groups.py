from api.aws_wrappers.images import upload_image
from fastapi import APIRouter, HTTPException, Query, Form, File, UploadFile
from api.db_setup import dynamodb
from api.models.group import Group
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from typing import List, Optional
import logging
import requests
from dotenv import load_dotenv
from os import getenv
from api.routers.posts import update_post, get_post
from api.models.post import Post, LikeRequest  # Ensure Post model is correctly imported
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

# Reference to the groups table
groups_table = dynamodb.Table("groups")

# Load environment variables from .env file
load_dotenv()

# Logger setup
logger = logging.getLogger("groups")
logger.setLevel(logging.INFO)


# Unsplash API configuration
BASE_URL = "https://api.unsplash.com/search/photos"
UNSPLASH_ACCESS_KEY = getenv("unsplash_access_key")


def fetch_image_url(query: str) -> str:
    """
    Fetch an image URL from Unsplash based on the query.
    """
    params = {
        "query": query,
        "client_id": UNSPLASH_ACCESS_KEY,
        "per_page": 1,
    }
    response = requests.get(BASE_URL, params=params)
    if response.status_code == 200:
        results = response.json().get("results", [])
        if results:
            return results[0]["urls"]["regular"]  # Use the 'regular' size URL
        else:
            raise HTTPException(status_code=404, detail="No images found for the query")
    else:
        raise HTTPException(
            status_code=response.status_code, detail="Failed to fetch image from Unsplash"
        )

# Post: create a group
@router.post("/", response_model=Group, status_code=201)
async def create_group(
    groupId: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    author: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    try:
        # Construct the group data
        group_data = {
            "groupId": groupId,
            "name": name,
            "description": description,
            "author": author,
            "posts": []
        }
        
        # Fetch image URL from Unsplash based on the group's name
        image_url = ''
        if image is not None:
            image_url = await upload_image("group-pictures", image)
        else:
            image_url = fetch_image_url(name)

        group_data["image"] = image_url  # Set the image URL

        # Store the group in DynamoDB
        groups_table.put_item(Item=group_data)
        logger.info(f"Group created: {group_data}")
        return Group(**group_data)
    except ClientError as e:
        logger.error(e.response["Error"]["Message"])
        raise HTTPException(status_code=500, detail="Failed to create group")

# Post: add post to a group
@router.post("/{group_id}/posts", response_model=Post)
async def add_post_to_group(
    group_id: str,
    author: str = Form(...),
    content: str = Form(...),
    topics: List[str] = Form(default=["general"]),
    images: List[UploadFile] = File(default=[]),
    postId: str = Form(None),
    likes: int = Form(0),
    createdAt: str = Form(None)
):
    try:
        # Upload images to S3
        image_urls = []
        if images:
            for image in images:
                url = await upload_image("post-pictures", image)
                image_urls.append(url)
        
        # Create post object
        post = Post(
            postId=postId or str(uuid.uuid4()),
            author=author,
            content=content,
            topics=set(topics),
            images=set(image_urls) if image_urls else {"none"},
            likes=likes,
            likedBy=[],
            timestamp=createdAt or str(datetime.now())
        )
        
        # Query the group from DynamoDB
        response = groups_table.get_item(Key={"groupId": group_id})
        group = response.get("Item")
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        # Ensure the "posts" key exists
        posts = group.get("posts", [])
        
        # Add the new post
        posts.append(post.dict())
        
        # Update the group in DynamoDB
        groups_table.update_item(
            Key={"groupId": group_id},
            UpdateExpression="SET posts = :posts",
            ExpressionAttributeValues={":posts": posts}
        )

        return post
    except Exception as e:
        logger.error(f"Error adding post to group {group_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add post: {str(e)}")

# Get a group by ID
@router.get("/{group_id}", response_model=Group)
def get_group(group_id: str):
    try:
        response = groups_table.get_item(Key={"groupId": group_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Group not found")
        return Group(**response["Item"])
    except ClientError as e:
        logger.error(e.response["Error"]["Message"])
        raise HTTPException(status_code=500, detail="Failed to get group")


# Get all groups
@router.get("/", response_model=List[Group])
def list_groups():
    try:
        response = groups_table.scan()
        groups = response.get("Items", [])
        return [Group(**group) for group in groups]
    except ClientError as e:
        logger.error(e.response["Error"]["Message"])
        raise HTTPException(status_code=500, detail="Failed to list groups")


# Search for a group
@router.get("/search/", response_model=List[Group])
def search_groups(query: Optional[str] = Query(None, description="Search query for group names or descriptions")):
    try:
        response = groups_table.scan()
        groups = response.get("Items", [])
        if query:
            query_lower = query.lower()
            groups = [
                group for group in groups
                if query_lower in group["name"].lower() or query_lower in group["description"].lower()
            ]
        return [Group(**group) for group in groups]
    except ClientError as e:
        logger.error(e.response["Error"]["Message"])
        raise HTTPException(status_code=500, detail="Failed to search groups")


# Update a group, including updating posts within the group
@router.put("/{group_id}", response_model=Group)
def update_group(group_id: str, group: Group):
    try:
        # Check if the group exists
        existing_group_response = groups_table.get_item(Key={"groupId": group_id})
        if "Item" not in existing_group_response:
            raise HTTPException(status_code=404, detail="Group not found")

        # Handle updating posts
        for post in group.posts:
            post_response = get_post(post.postId)
            if post_response is None:
                new_post = Post(
                    postId=post.postId,
                    author=post.author,
                    content=post.content,
                    topics=post.topics,
                    images=post.images,
                    likes=post.likes,
                )
                update_post(post.postId, new_post)
                logger.info(f"Post created: {new_post}")
            else:
                updated_post = update_post(post.postId, post)
                logger.info(f"Post updated: {updated_post}")

        # Update the group
        group_dict = group.dict()
        groups_table.put_item(Item=group_dict)
        logger.info(f"Group updated: {group_dict}")
        return group
    except ClientError as e:
        logger.error(e.response["Error"]["Message"])
        raise HTTPException(status_code=500, detail="Failed to update group")
    except HTTPException as he:
        logger.error(he.detail)
        raise he

# Update a group's post
@router.put("/{group_id}/posts/{post_id}", response_model=Post)
def update_group_post(group_id: str, post_id: str, post_update: Post):
    try:
        # Check if the group exists
        group = groups_table.get(group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")

        # Check if the post exists in the group
        group_posts = group.get("posts", [])
        existing_post = next((p for p in group_posts if p["postId"] == post_id), None)
        if not existing_post:
            raise HTTPException(status_code=404, detail="Post not found in the group")

        # Update the post fields
        updated_post = {**existing_post, **post_update.dict()}
        updated_post_instance = Post(**updated_post)

        # Update the post in the database
        update_post(post_id, updated_post_instance)

        # Update the group's post list
        updated_group_posts = [
            updated_post_instance.dict() if p["postId"] == post_id else p for p in group_posts
        ]
        groups_table[group_id]["posts"] = updated_group_posts

        logger.info(f"Post updated in group {group_id}: {updated_post_instance.dict()}")
        return updated_post_instance
    except Exception as e:
        logger.error(f"Error updating post in group {group_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update post in group")

@router.put("/{group_id}/update-info")
async def update_group_info(
    group_id: str,
    name: str = Form(...),  # Add Form() for form data handling
    description: str = Form(...),  # Add Form() here too
    image: Optional[UploadFile] = Form(None)
):
    try:
        # Get existing group with proper error handling
        try:
            response = groups_table.get_item(Key={"groupId": group_id})
            existing_group = response.get("Item")
        except ClientError as e:
            logger.error(f"DynamoDB get_item error: {e.response['Error']['Message']}")
            raise HTTPException(status_code=500, detail="Database error retrieving group")

        if not existing_group:
            raise HTTPException(status_code=404, detail="Group not found")

        # Handle image upload with existing image fallback
        image_url = existing_group.get("image", "")
        if image and image.filename:
            try:
                image_url = await upload_image("group-pictures", image)
            except Exception as upload_error:
                logger.error(f"Image upload failed: {str(upload_error)}")
                raise HTTPException(status_code=500, detail="Failed to upload image")

        # Update database with transaction safety
        try:
            update_response = groups_table.update_item(
                Key={"groupId": group_id},
                UpdateExpression="SET #name = :name, #description = :desc, #image = :img",
                ExpressionAttributeNames={
                    "#name": "name",
                    "#description": "description",
                    "#image": "image"
                },
                ExpressionAttributeValues={
                    ":name": name,
                    ":desc": description,
                    ":img": image_url
                },
                ReturnValues="ALL_NEW"
            )
            updated_group = update_response.get("Attributes", {})
        except ClientError as e:
            logger.error(f"DynamoDB update error: {e.response['Error']['Message']}")
            raise HTTPException(status_code=500, detail="Database update failed")

        return {
            "groupId": group_id,
            "name": updated_group.get("name", name),
            "description": updated_group.get("description", description),
            "image": updated_group.get("image", image_url)
        }

    except HTTPException:
        raise  # Re-raise already handled exceptions
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

# Delete a group
@router.delete("/{group_id}", status_code=204)
def delete_group(group_id: str):
    try:
        groups_table.delete_item(Key={"groupId": group_id})
        logger.info(f"Group deleted: {group_id}")
        return {"message": "Group deleted successfully"}
    except ClientError as e:
        logger.error(e.response["Error"]["Message"])
        raise HTTPException(status_code=500, detail="Failed to delete group")

# Add this endpoint to handle likes for posts within groups
@router.post("/{group_id}/posts/{post_id}/like", status_code=200)
def like_group_post(group_id: str, post_id: str, like_request: LikeRequest):
    try:
        # Log incoming request
        logger.info(f"Like request received for post {post_id} in group {group_id} from user {like_request.username}")
        
        # Check if the group exists
        group_response = groups_table.get_item(Key={"groupId": group_id})
        if "Item" not in group_response:
            raise HTTPException(status_code=404, detail="Group not found")
        
        group = group_response["Item"]
        
        # Find the post in the group
        posts = group.get("posts", [])
        post_index = next((i for i, p in enumerate(posts) if p["postId"] == post_id), None)
        
        if post_index is None:
            raise HTTPException(status_code=404, detail="Post not found in group")
        
        # Get the post
        post = posts[post_index]
        username = like_request.username
        
        # Initialize likedBy array if it doesn't exist
        if "likedBy" not in post:
            post["likedBy"] = []
        
        liked_by = post.get("likedBy", [])
        current_likes = post.get("likes", 0)
        
        logger.info(f"Current state - likes: {current_likes}, likedBy: {liked_by}")
        
        # Toggle like status
        if username in liked_by:
            # Unlike the post
            liked_by.remove(username)
            current_likes = max(0, current_likes - 1)  # Ensure likes don't go below 0
            logger.info(f"Removing like from user {username}")
        else:
            # Like the post
            if username not in liked_by:  # Extra check to ensure no duplicate likes
                liked_by.append(username)
                current_likes += 1
                logger.info(f"Adding like from user {username}")
        
        # Update post with new like information
        post["likedBy"] = liked_by
        post["likes"] = current_likes
        
        # Update the post in the group
        posts[post_index] = post
        
        # Update the group in DynamoDB
        try:
            update_response = groups_table.update_item(
                Key={"groupId": group_id},
                UpdateExpression="SET posts = :posts",
                ExpressionAttributeValues={":posts": posts},
                ReturnValues="ALL_NEW"
            )
            logger.info(f"DynamoDB update response: {update_response}")
        except ClientError as e:
            logger.error(f"DynamoDB update_item error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to update like status in database")
        
        result = {
            "success": True,
            "likes": current_likes,
            "isLiked": username in liked_by
        }
        logger.info(f"Returning result: {result}")
        return result
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in like_group_post: {str(e)}", exc_info=True)  # Added exc_info for full traceback
        raise HTTPException(status_code=500, detail=f"Failed to process like: {str(e)}")
