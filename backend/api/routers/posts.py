from fastapi import APIRouter, HTTPException, Depends
from api.db_setup import dynamodb
from api.config import login_manager
from api.models.post import Post
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
import logging

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

# READ: Get all posts by an author
@router.get("/author/{author}", response_model=list[Post])
async def get_posts_by_author(author: str):
    try:
        response = posts_table.query(
            IndexName='AuthorIndex',
            KeyConditionExpression=Key('author').eq(author)
        )
        return response.get('Items', [])
    except ClientError as e:
        logger.error(f"Failed to query DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch posts.")

# UPDATE: Update a post's content or likes
@router.put("/{post_id}", response_model=dict)
async def update_post(
    post_id: str,
    content: str = None,
    likes: int = None,
    user: dict = Depends(login_manager)
):
    update_expression = []
    expression_attribute_values = {}

    try:
        # Fetch the post to check its existence and ownership
        response = posts_table.get_item(Key={"postId": post_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Post not found.")

        post = response["Item"]

        # Ensure only the author can update the content
        if content and post["author"] != user["username"]:
            raise HTTPException(status_code=403, detail="Access forbidden: You are not the author of this post.")
        elif content:
            update_expression.append("content = :content")
            expression_attribute_values[":content"] = content

        # Allow likes update by any authenticated user
        if likes is not None:
            update_expression.append("likes = :likes")
            expression_attribute_values[":likes"] = likes

        if not update_expression:
            raise HTTPException(status_code=400, detail="No fields to update.")

        # Perform the update
        response = posts_table.update_item(
            Key={"postId": post_id},
            UpdateExpression="SET " + ", ".join(update_expression),
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues="ALL_NEW"
        )

        updated_post = response.get("Attributes", {})
        logger.info(f"Post {post_id} updated successfully.")
        return updated_post

    except ClientError as e:
        logger.error(f"Failed to update post {post_id}: {e}")
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