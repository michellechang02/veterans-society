from fastapi import APIRouter, HTTPException
from api.db_setup import dynamodb
from api.models.comment import Comment
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
import logging

router = APIRouter(
    prefix="/comments",
    tags=["comments"]
)

# Reference to the comments table
comments_table = dynamodb.Table('comments')

# Used for logging
logger = logging.getLogger(__name__)

@router.post("/", response_model=Comment)
async def create_comment(comment: Comment):
    """
    Create a new comment on a post.
    """
    logger.info(f"Creating comment for postId: {comment.postId} by author: {comment.author}")

    comment_item = comment.dict()

    try:
        # Save the comment in DynamoDB
        comments_table.put_item(Item=comment_item)
    except ClientError as e:
        logger.error(f"Failed to save comment to DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to save comment data.")

    return comment


@router.get("/{postId}", response_model=list[Comment])
async def get_comments(postId: str):
    """
    Retrieve all comments for a specific post.
    """
    logger.info(f"Fetching comments for postId: {postId}")
    try:
        response = comments_table.scan(
            FilterExpression=Key('postId').eq(postId)
        )
    except ClientError as e:
        logger.error(f"Failed to query comments from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch comments.")

    items = response.get('Items', [])
    return [Comment(**item) for item in items]

@router.delete("/{commentId}", response_model=dict)
async def delete_comment(commentId: str):
    """
    Delete a comment by its commentId.
    """
    logger.info(f"Deleting comment with commentId: {commentId}")
    try:
        comments_table.delete_item(
            Key={'commentId': commentId}
        )
    except ClientError as e:
        logger.error(f"Failed to delete comment from DynamoDB: {e}")
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=404, detail="Comment not found.")
        raise HTTPException(status_code=500, detail="Failed to delete comment.")

    return {"message": "Comment deleted successfully!"}
