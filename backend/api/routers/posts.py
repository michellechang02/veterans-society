from fastapi import APIRouter, HTTPException, Depends, Query
from api.db_setup import dynamodb
from api.config import login_manager
from api.models.post import Post, UpdatePostModel
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from typing import Set, List
import logging
from api.nlp.trends import get_trending_keywords, get_trending_topics

router = APIRouter(
    prefix="/posts",
    tags=["posts"]
)

# Reference to the posts table
posts_table = dynamodb.Table('posts')
comments_table = dynamodb.Table('comments')

# Used for logging
logger = logging.getLogger(__name__)

# CREATE: Add a new post
@router.post("/", response_model=Post)
async def create_post(post: Post):
    try:
        posts_table.put_item(Item=post.dict())
        logger.info(f"Post created successfully: {post.postId}")
        return post
    except ClientError as e:
        logger.error(f"Failed to save post to DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to create post.")

# READ: Get all posts
@router.get("/", response_model=list[Post])
async def get_all_posts():
    """
    Fetch all posts from the DynamoDB table.
    """
    try:
        response = posts_table.scan()
        posts = response.get("Items", [])

        # Attach comments to each post
        for post in posts:
            post_id = post["postId"]
            comments_response = comments_table.scan(
                FilterExpression=Key("postId").eq(post_id)
            )
            post["comments"] = comments_response.get("Items", [])

        return [Post(**post) for post in posts]
    except ClientError as e:
        logger.error(f"Failed to fetch all posts from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch posts.")



# READ: Get a post by postId
@router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    try:
        response = posts_table.get_item(Key={'postId': post_id})
    except ClientError as e:
        logger.error(f"Failed to query DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="Post not found.")
    
    return response['Item']

# READ: Get trending topics and keywords

@router.get("/trends/trending-topics")
def trending_topics():
    try:
        response = posts_table.scan()
        posts = response.get("Items", [])
        topics = get_trending_topics(posts)
        return {"trending_topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending topics: {e}")

@router.get("/trends/trending-keywords")
def trending_keywords():
    try:
        response = posts_table.scan()
        posts = response.get("Items", [])
        keywords = get_trending_keywords(posts)
        return {"trending_keywords": keywords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending keywords: {e}")


# READ: Get all posts by an author
@router.get("/filter/author/{author}", response_model=list[Post])
async def get_posts_by_author(author: str):
    """
    Fetch all posts by a specific author by manually checking the 'author' key.
    """
    try:
        # Scan the table to fetch all items
        response = posts_table.scan()
        logger.info(f"Raw DynamoDB Response: {response}")

        # Extract items and filter by the author
        items = response.get('Items', [])
        if not items:
            raise HTTPException(status_code=404, detail="No posts found.")

        # Manually filter items where 'author' matches the provided value
        filtered_items = [item for item in items if item.get('author') == author]

        # Check if any filtered items exist
        if not filtered_items:
            raise HTTPException(status_code=404, detail="No posts found for the given author.")

        return filtered_items

    except Exception as e:
        logger.error(f"Error fetching posts by author: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch posts.")


@router.get("/filter/topics", response_model=List[Post])
async def get_posts_by_topics(topics: List[str] = Query(..., description="List of topics to filter by")):
    """
    Fetch posts that match any of the given topics.
    """
    try:
        # Validate input
        if not topics:
            raise HTTPException(status_code=400, detail="At least one topic must be specified.")

        logger.info(f"Topics Query Parameter: {topics}")

        # Fetch all posts (DynamoDB scan)
        response = posts_table.scan()
        logger.info(f"Raw DynamoDB Response: {response}")

        # Extract items
        items = response.get('Items', [])
        if not items:
            raise HTTPException(status_code=404, detail="No posts found.")

        # Manually filter items that match any of the given topics
        filtered_items = [
            item for item in items if "topics" in item and any(topic in item["topics"] for topic in topics)
        ]

        # Check if any filtered items exist
        if not filtered_items:
            raise HTTPException(status_code=404, detail="No posts found for the given topics.")

        return filtered_items

    except Exception as e:
        logger.error(f"Error fetching posts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch posts.")

# UPDATE
@router.put("/{post_id}", response_model=dict)
async def update_post(
    post_id: str,
    update_data: UpdatePostModel
):
    try:
        logger.info(f"Update request received: postId={post_id}, update_data={update_data}")

        # Fetch the post to check its existence
        response = posts_table.get_item(Key={"postId": post_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Post not found.")

        post = response["Item"]
        logger.info(f"Post fetched successfully: {post}")

        # Prepare update expressions
        update_expression = []
        expression_attribute_values = {}

        # Update content if provided
        if update_data.content is not None:
            update_expression.append("content = :content")
            expression_attribute_values[":content"] = update_data.content

        # Update likes if provided
        if update_data.likes is not None:
            update_expression.append("likes = :likes")
            expression_attribute_values[":likes"] = update_data.likes

        # Update topics if provided
        if update_data.topics is not None:
            update_expression.append("topics = :topics")
            expression_attribute_values[":topics"] = update_data.topics

        # Ensure at least one field is updated
        if not update_expression:
            raise HTTPException(status_code=400, detail="No fields to update.")

        # Perform the update
        logger.info(f"Updating post with: {update_expression}, values: {expression_attribute_values}")
        response = posts_table.update_item(
            Key={"postId": post_id},
            UpdateExpression="SET " + ", ".join(update_expression),
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        updated_post = response.get("Attributes", {})
        logger.info(f"Post {post_id} updated successfully: {updated_post}")
        return updated_post

    except Exception as e:
        logger.error(f"Failed to update post {post_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update post.")

# DELETE: Delete a post by postId
@router.delete("/{post_id}", response_model=dict)
async def delete_post(post_id: str, user: dict = Depends(login_manager)):
    try:
        # Fetch the post from the database
        response = posts_table.get_item(Key={"postId": post_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Post not found.")

        post = response['Item']

        # Ensure the user is authorized to delete the post
        if post["author"] != user["username"]:
            raise HTTPException(status_code=403, detail="Access forbidden: You are not the author of this post.")

        # Delete the post
        posts_table.delete_item(Key={"postId": post_id})
        logger.info(f"Post {post_id} deleted successfully.")
        return {"message": f"Post {post_id} deleted successfully."}

    except ClientError as e:
        logger.error(f"Failed to delete post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete post.")