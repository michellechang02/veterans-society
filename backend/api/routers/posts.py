from fastapi import APIRouter, Form, HTTPException, UploadFile, File, Depends, Query
from api.db_setup import dynamodb
from api.config import login_manager
from api.models.post import Post, UpdatePostModel, LikeRequest
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from typing import List, Set
import logging
from api.nlp.trends import get_trending_keywords, get_trending_topics
from api.aws_wrappers.images import upload_image, delete_image

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
async def create_post(
    author: str = Form(..., description="Username of the post's author"),
    content: str = Form(..., description="Content of the post"),
    topics: Set[str] = Form(default={"general"}, description="Set of topics associated with the post"),
    images: List[UploadFile] = File(default=[], description="List of images")
):
    try:
        # Upload images to S3
        image_urls = []

        if images:
            for image in images:
                url = await upload_image("post-pictures", image)
                image_urls.append(url)

        # Construct the post
        post = Post(
            author=author,
            content=content,
            topics=topics,
            images=set(image_urls) if image_urls else {"none"},
        )
        post_dict = post.dict()
        
        # Initialize empty likedBy array if not provided
        if 'likedBy' not in post_dict:
            post_dict['likedBy'] = []
            
        # Handle empty sets for DynamoDB
        if not post_dict.get('topics'):
            post_dict['topics'] = {"general"}
        if not post_dict.get('images'):
            post_dict['images'] = {"none"}
        
        # Save post to DynamoDB
        posts_table.put_item(Item=post.dict())
        logger.info(f"Post created successfully: {post.postId}")
        return post
    except ClientError as e:
        # Add more detailed error logging
        logger.error(f"Failed to save post to DynamoDB: {str(e)}")
        logger.error(f"Error code: {e.response['Error']['Code']}")
        logger.error(f"Error message: {e.response['Error']['Message']}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create post: {str(e)}"
        )
    except Exception as e:
        # Catch any other exceptions
        logger.error(f"Unexpected error creating post: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error: {str(e)}"
        )

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
            # Ensure likedBy exists
            if 'likedBy' not in post:
                post['likedBy'] = []

        return [Post(**post) for post in posts]
    except ClientError as e:
        logger.error(f"Failed to fetch all posts from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch posts.")

# READ: Get a post by postId
@router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    try:
        response = posts_table.get_item(Key={'postId': post_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Post not found.")
        
        post = response['Item']
        # Ensure likedBy exists
        if 'likedBy' not in post:
            post['likedBy'] = []
            
        return post
    except ClientError as e:
        logger.error(f"Failed to query DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

# READ: Get trending topics and keywords
@router.get("/trends/trending-topics", response_model=dict)
def trending_topics():
    try:
        response = posts_table.scan()
        posts = response.get("Items", [])
        topics = get_trending_topics(posts)
        return {"trending_topics": [[topic, count] for topic, count in topics]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending topics: {e}")

@router.get("/trends/trending-keywords", response_model=dict)
def trending_keywords():
    try:
        response = posts_table.scan()
        posts = response.get("Items", [])
        
        formatted_posts = []
        for post in posts:
            if 'content' in post:
                formatted_posts.append({
                    'content': str(post['content']),
                    'topics': post.get('topics', [])
                })
        
        keywords = get_trending_keywords(formatted_posts)
        return {"trending_keywords": [[word, count] for word, count in keywords]}
    except Exception as e:
        print(f"Error details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch trending keywords: {e}")

# READ: Get all posts by an author
@router.get("/filter/author/{author}", response_model=list[Post])
async def get_posts_by_author(author: str):
    try:
        response = posts_table.scan()
        items = response.get('Items', [])
        if not items:
            raise HTTPException(status_code=404, detail="No posts found.")

        filtered_items = [item for item in items if item.get('author') == author]
        
        # Ensure likedBy exists for each post
        for item in filtered_items:
            if 'likedBy' not in item:
                item['likedBy'] = []

        if not filtered_items:
            raise HTTPException(status_code=404, detail="No posts found for the given author.")

        return filtered_items
    except Exception as e:
        logger.error(f"Error fetching posts by author: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch posts.")

@router.get("/filter/topics", response_model=List[Post])
async def get_posts_by_topics(topics: List[str] = Query(..., description="List of topics to filter by")):
    try:
        if not topics:
            raise HTTPException(status_code=400, detail="At least one topic must be specified.")
        topic_list = [topic.strip() for topic in topics[0].split(',')]
        topic_set = {topic.replace('+', ' ').strip() for topic in topic_list}
        response = posts_table.scan()
        items = response.get('Items', [])
        if not items:
            raise HTTPException(status_code=404, detail="No posts found.")
        topic_list = [topic.replace('+', ' ') for topic in topic_list]

        filtered_items = [
            item for item in items 
            if "topics" in item and (
                len(set(item["topics"]) & topic_set) > 0
            )
        ]

        # Ensure likedBy exists for each post
        for item in filtered_items:
            if 'likedBy' not in item:
                item['likedBy'] = []

        if not filtered_items:
            raise HTTPException(status_code=404, detail="No posts found for the given topics.")

        return filtered_items
    except Exception as e:
        logger.error(f"Error fetching posts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch posts.")

# UPDATE
@router.put("/{post_id}", response_model=dict)
async def update_post(post_id: str, update_data: UpdatePostModel):
    try:
        # First check if post exists
        response = posts_table.get_item(Key={"postId": post_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Post not found.")

        post = response["Item"]
        
        # Build update expression and attributes
        update_expression_parts = []
        expression_attribute_values = {}
        expression_attribute_names = {}

        if update_data.content is not None:
            update_expression_parts.append("#content = :content")
            expression_attribute_values[":content"] = update_data.content
            expression_attribute_names["#content"] = "content"

        if update_data.likes is not None:
            update_expression_parts.append("#likes = :likes")
            expression_attribute_values[":likes"] = update_data.likes
            expression_attribute_names["#likes"] = "likes"

        if update_data.topics is not None:
            # Ensure topics is not an empty set for DynamoDB
            topics_set = update_data.topics if update_data.topics else {"general"}
            update_expression_parts.append("#topics = :topics")
            expression_attribute_values[":topics"] = topics_set
            expression_attribute_names["#topics"] = "topics"

        if not update_expression_parts:
            raise HTTPException(status_code=400, detail="No valid fields to update.")

        # Perform the update
        try:
            response = posts_table.update_item(
                Key={"postId": post_id},
                UpdateExpression="SET " + ", ".join(update_expression_parts),
                ExpressionAttributeValues=expression_attribute_values,
                ExpressionAttributeNames=expression_attribute_names,
                ReturnValues="ALL_NEW"
            )
            
            updated_post = response.get("Attributes", {})
            
            # Ensure required fields exist
            if 'likedBy' not in updated_post:
                updated_post['likedBy'] = []
            if 'topics' not in updated_post or not updated_post['topics']:
                updated_post['topics'] = {"general"}
            if 'images' not in updated_post or not updated_post['images']:
                updated_post['images'] = {"none"}
                
            logger.info(f"Successfully updated post {post_id}")
            return updated_post
            
        except ClientError as e:
            logger.error(f"DynamoDB update failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update post in database: {str(e)}"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error updating post {post_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error updating post: {str(e)}"
        )

# DELETE: Delete a post by postId
@router.delete("/{post_id}", response_model=dict)
async def delete_post(post_id: str, user: dict = Depends(login_manager)):
    try:
        response = posts_table.get_item(Key={"postId": post_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Post not found.")

        post = response['Item']

        # Allow admins to delete any post, but regular users can only delete their own posts
        if post["author"] != user["username"] and user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Access forbidden: You are not the author of this post.")

        if "images" in post:
            for image_url in post["images"]:
                delete_image(image_url, "post-pictures")

        # Delete the post
        posts_table.delete_item(Key={"postId": post_id})
        logger.info(f"Post {post_id} deleted successfully by user {user['username']}.")
        return {"message": f"Post {post_id} deleted successfully."}
    except ClientError as e:
        logger.error(f"Failed to delete post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete post.")



@router.post("/{post_id}/like")
async def like_post(post_id: str, like_request: LikeRequest):
    try:
        # Log incoming request
        logger.info(f"Like request received for post {post_id} from user {like_request.username}")
        
        # Get the post
        try:
            response = posts_table.get_item(Key={'postId': post_id})
            logger.info(f"DynamoDB response: {response}")
        except ClientError as e:
            logger.error(f"DynamoDB get_item error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to fetch post from database")
            
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Post not found")
            
        post = response['Item']
        username = like_request.username
        liked_by = post.get('likedBy', [])
        current_likes = post.get('likes', 0)
        
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
            
        # Update the post
        try:
            update_response = posts_table.update_item(
                Key={'postId': post_id},
                UpdateExpression='SET likes = :likes, likedBy = :likedBy',
                ExpressionAttributeValues={
                    ':likes': current_likes,
                    ':likedBy': liked_by
                },
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
        logger.error(f"Error in like_post: {str(e)}", exc_info=True)  # Added exc_info for full traceback
        raise HTTPException(status_code=500, detail=f"Failed to process like: {str(e)}")

