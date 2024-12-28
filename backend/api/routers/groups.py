from fastapi import APIRouter, HTTPException, Query
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
from api.models.post import Post  # Ensure Post model is correctly imported

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


@router.post("/", response_model=Group, status_code=201)
def create_group(group: Group):
    try:
        # Fetch image URL from Unsplash based on the group's name
        image_url = fetch_image_url(group.name)
        group_dict = group.dict()
        group_dict["image"] = image_url  # Set the image URL

        # Store the group in DynamoDB
        groups_table.put_item(Item=group_dict)
        logger.info(f"Group created: {group_dict}")
        return Group(**group_dict)
    except ClientError as e:
        logger.error(e.response["Error"]["Message"])
        raise HTTPException(status_code=500, detail="Failed to create group")


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


