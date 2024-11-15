from fastapi import APIRouter, HTTPException, Request, Depends
from api.db_setup import dynamodb
from api.models.user import UserCreate, UserResponse, LoginRequest
from fastapi_login.exceptions import InvalidCredentialsException
from fastapi.responses import RedirectResponse
from fastapi_login import LoginManager
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


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Assuming pwd_context is configured for password hashing
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login", response_model=UserResponse)
async def login_user(request: Request, login_data: LoginRequest):
    username = login_data.username
    password = login_data.password
    logger.info(f"Attempt to login user: {username}")
    
    # Retrieve user from DynamoDB using the primary key 'username'
    try:
        response = users_table.get_item(Key={'username': username})
    except ClientError as e:
        logger.error(f"Failed to query DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
    
    logger.info(f"PRINTING RESPONSE")
    logger.info(response)
    print("PRINTING RESPONSE")
    
    if 'Item' not in response:
        logger.warning(f"User not found: {username}")
        raise HTTPException(status_code=404, detail="User not found.")
    
    user_data = response['Item']
    stored_password = user_data.get('password')

    # Verify password
    if not verify_password(password, stored_password):
        logger.warning(f"Invalid password for user: {username}")
        raise HTTPException(status_code=400, detail="Invalid password.")
    
    # Set session cookie
    request.session["user_id"] = "example_user_id"
    logger.info(f"User {username} logged in successfully")
    return RedirectResponse(url=f"/users/{user_data['username']}", status_code=303)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_details(user_id: str):
    logger.info(f"Fetching details for user: {user_id}")
    try:
        response = users_table.get_item(Key={'username': user_id})
    except ClientError as e:
        logger.error(f"Failed to query DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
    if 'Item' not in response:
        logger.warning(f"User not found: {user_id}")
        raise HTTPException(status_code=404, detail="User not found.")
    
    return response['Item']

@router.get("/logout")
def logout(request: Request):
    # Clear the session
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)

