from fastapi import APIRouter, HTTPException, Depends
from api.db_setup import dynamodb
from api.models.user import UserCreate, UserResponse
from passlib.context import CryptContext
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError
import logging

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Initialize password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Reference to the users table
users_table = dynamodb.Table('users')

# Used for logging
logger = logging.getLogger(__name__)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    # Check if the username already exists
    logger.info(f"Attempt to register user: {user.username}")
    try:
        response = users_table.get_item(Key={'username': user.username})
    except ClientError as e:
        logger.error(f"Failed to query DynamoDB: {e}")
        err_code = e.response['Error']['Code']
        if err_code == 'ResourceNotFoundException':
            raise HTTPException(status_code=500, detail="User table does not exist")
        raise HTTPException(status_code=500, detail="Internal server error.")
    else:
        if 'Item' in response:
            raise HTTPException(status_code=400, detail="Username already exists.")
    hashed_password = get_password_hash(user.password)

    # Prepare the user item
    user_item = {
        'username': user.username,
        'password': hashed_password,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'isVeteran': user.isVeteran,
    }

    if user.email:
        user_item['email'] = user.email

    if user.isVeteran:
        user_item['employmentStatus'] = user.employmentStatus
        user_item['workLocation'] = user.workLocation
        user_item['liveLocation'] = user.liveLocation
        user_item['height'] = user.height  # Height in inches
        user_item['weight'] = user.weight  # Weight in pounds

    try:
        # Save the user in DynamoDB
        users_table.put_item(Item=user_item)
    except ClientError as e:
        logger.error(f"Failed to save user to DynamoDB: {e}")
        error_code = e.response['Error']['Code']
        if error_code == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=400, detail="Failed to register user due to a condition check failure.")
        raise HTTPException(status_code=500, detail="Failed to save user data.")

    return {"message": "User registered successfully!"}