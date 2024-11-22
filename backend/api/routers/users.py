from fastapi import APIRouter, HTTPException, Request, Depends
from api.db_setup import dynamodb
from api.models.user import UserCreate, UserResponse, LoginRequest, UserUpdateRequest
from fastapi_login.exceptions import InvalidCredentialsException
from fastapi.responses import RedirectResponse
from fastapi_login import LoginManager

from passlib.context import CryptContext
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError
import logging
from typing import List

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

# POST (C of CRUD): Register a new user
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

    request.session["user_id"] = "example_user_id"
    logger.info(f"User {username} logged in successfully")
    return RedirectResponse(url=f"/users/{user_data['username']}", status_code=303)

# GET (Read) - Retrieve user by username
@router.get("/{username}", response_model=UserCreate)
async def get_user(username: str):
    try:
        logger.info(f"Fetching user: {username}")
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")
        return response['Item']
    except ClientError as e:
        logger.error(f"Failed to retrieve user from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
 
# PUT (Update) - Update user by username
@router.put("/{username}", response_model=UserResponse)
async def update_user(username: str, request: UserUpdateRequest):
    try:
        # Check if user exists
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")

        # Create update expression
        update_expression = "SET "
        expression_attribute_values = {}

        for field, value in request.dict(exclude_unset=True).items():
            update_expression += f"{field} = :{field}, "
            expression_attribute_values[f":{field}"] = value
        update_expression = update_expression.rstrip(", ")

        # Update DynamoDB
        users_table.update_item(
            Key={"username": username},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )
        return UserResponse(message="User updated successfully.")
    except ClientError as e:
        logger.error(f"Failed to update user in DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user.")

# DELETE (Delete) - Delete user by username
@router.delete("/{username}", response_model=UserResponse)
async def delete_user(username: str):
    try:
        # Check if user exists
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")

        # Delete from DynamoDB
        users_table.delete_item(Key={"username": username})
        return UserResponse(message="User deleted successfully.")
    except ClientError as e:
        logger.error(f"Failed to delete user from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user.")
    return RedirectResponse(url="/", status_code=303)

@router.get("/logout")
def logout(request: Request):
    # Clear the session
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)

