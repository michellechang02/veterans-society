# backend/api/routes/users.py
from fastapi import APIRouter, HTTPException, Request, Depends
from api.db_setup import dynamodb
from api.config import login_manager
from api.models.user import UserCreate, UserResponse, LoginRequest, UserUpdateRequest
from fastapi.responses import RedirectResponse
from passlib.context import CryptContext
from boto3.dynamodb.conditions import Attr
from fastapi.concurrency import run_in_threadpool
from datetime import timedelta
from botocore.exceptions import ClientError
import logging
from decimal import Decimal

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
logger.setLevel(logging.INFO)

# After importing login_manager

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
        'interests': user.interests
    }

    if user.email:
        user_item['email'] = user.email

    if user.isVeteran:
        user_item['employmentStatus'] = user.employmentStatus
        user_item['workLocation'] = user.workLocation
        user_item['liveLocation'] = user.liveLocation
        user_item['height'] = Decimal(user.height) if user.height is not None else None  # Height in inches
        user_item['weight'] = Decimal(user.weight) if user.weight is not None else None  # Weight in pounds

    try:
        # Save the user in DynamoDB
        users_table.put_item(Item=user_item)
    except ClientError as e:
        logger.error(f"Failed to save user to DynamoDB: {e}")
        error_code = e.response['Error']['Code']
        if error_code == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=400, detail="Failed to register user due to a condition check failure.")
        raise HTTPException(status_code=500, detail="Failed to save user data.")

    return user_item

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login")
async def login_user(request: Request, login_data: LoginRequest):
    username = login_data.username
    password = login_data.password
    logger.info(f"Attempt to login user: {username}")
    
    try:
        response = users_table.get_item(Key={'username': username})
    except ClientError as e:
        logger.error(f"Failed to query DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")
        
    if 'Item' not in response:
        logger.warning(f"User not found: {username}")
        raise HTTPException(status_code=404, detail="User not found.")
    
    user_data = response['Item']
    stored_password = user_data.get('password')

    if not verify_password(password, stored_password):
        logger.warning(f"Invalid password for user: {username}")
        raise HTTPException(status_code=400, detail="Invalid password.")

    # Generate a token for the user
    token = login_manager.create_access_token(
        data={"sub": username},
        expires=timedelta(minutes=10)
    )
    
    # Return the token as JSON instead of RedirectResponse
    return {"access_token": token, "token_type": "bearer"}

# GET (Read) - Retrieve user by username
@router.get("/{username}", response_model=UserCreate)
async def get_user(username: str, user: dict = Depends(login_manager)):
    """
    Retrieve user information for the specified username.
    Only the authenticated user can access their data.
    """
    response = []
    table_result = users_table.get_item(Key={"username": username})
    user_data = table_result.get("Item")

    if user["username"] == username:
        response = user_data
    else:
        user_info = {
            "username": user_data.get("username"),
            "firstName": user_data.get("firstName"),
            "lastName": user_data.get("lastName"),
            "isVeteran": user_data.get("isVeteran"),
            "interests": user_data.get("interests")
        }
        response.append(user_info)
    return response

# PUT (Update) - Update user by username
@router.put("/{username}", response_model=UserResponse)
async def update_user(username: str, request: UserUpdateRequest, user: dict = Depends(login_manager)):
    if user["username"] != username:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    try:
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")

        update_expression = "SET "
        expression_attribute_values = {}

        for field, value in request.dict(exclude_unset=True).items():
            update_expression += f"{field} = :{field}, "
            expression_attribute_values[f":{field}"] = value
        update_expression = update_expression.rstrip(", ")

        users_table.update_item(
            Key={"username": username},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )
        return {"message": "User updated successfully."}
    except ClientError as e:
        logger.error(f"Failed to update user in DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user.")

# DELETE (Delete) - Delete user by username
@router.delete("/{username}", response_model=UserResponse)
async def delete_user(username: str, user: dict = Depends(login_manager)):
    if user["username"] != username:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    try:
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")

        users_table.delete_item(Key={"username": username})
        return {"message": "User deleted successfully."}
    except ClientError as e:
        logger.error(f"Failed to delete user from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user.")

@router.get("/logout")
def logout(user: dict = Depends(login_manager)):
    return RedirectResponse(url="/", status_code=303)

# GET (Read) - Retrieve user by username
@router.get("/{username}/visit", response_model=UserResponse)
async def get_other_user(username: str, user: dict = Depends(login_manager)):
    """
    Retrieve user information for the specified username.
    Only the authenticated user can access their full data.
    """

    # Fetch user from DynamoDB
    table_result = users_table.get_item(Key={"username": username})
    user_data = table_result.get("Item")

    # If user is not found, return 404 error
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # If the logged-in user is requesting their own data, return full details
    if user["username"] == username:
        return user_data

    # Otherwise, return limited public information
    public_user_info = {
        "username": user_data.get("username"),
        "firstName": user_data.get("firstName"),
        "lastName": user_data.get("lastName"),
        "isVeteran": user_data.get("isVeteran"),
        "email": user_data.get("email"),
        "employmentStatus": None,  # Hide employment details
        "workLocation": None,
        "liveLocation": None,
        "height": None,  # Hide personal details
        "weight": None,
    }
    return public_user_info


@router.get("/{logged_in_user}/search")
def search_users(logged_in_user: str, query: str = None):
    try:
        if query:
            # Perform a scan on DynamoDB to find users matching the query
            query = query.split(" ")
            filter_expression = None
            for term in query:
                term_filter = (Attr("username").contains(term.lower()) |
                            Attr("firstName").contains(term.lower()) |
                            Attr("lastName").contains(term.lower()))
                filter_expression = term_filter if filter_expression is None else filter_expression | term_filter

            if not filter_expression:
                return []
            response = users_table.scan(FilterExpression=filter_expression)
            users = response.get("Items", [])

            return users
        else:
            logged_in_user_data = users_table.get_item(Key={"username": logged_in_user}).get("Item", {})
            current_user_interests = set(logged_in_user_data.get("interests", []))

            # Scan all users
            response = users_table.scan()
            all_users = response.get("Items", [])
            interest_matches = sorted(
                [
                    user for user in all_users 
                    if (common_interests := set(user.get("interests", [])) & current_user_interests and user.get("username") != logged_in_user)
                ],
                key=lambda user: len(set(user.get("interests", [])) & current_user_interests),
                reverse=True  # Sort in descending order so users with more common interests appear first
            )
        
            non_interest_matches = [user for user in all_users if user not in interest_matches and user.get("username") != logged_in_user]

            # If we have 5 or more interest matches, return all of them
            if len(interest_matches) >= 5:
                matched_users = interest_matches
            else:
                matched_users = interest_matches + non_interest_matches[:5 - len(interest_matches)]

            # Format response
            response_data = []
            for user in matched_users:
                user_info = {
                    "username": user.get("username"),
                    "firstName": user.get("firstName"),
                    "lastName": user.get("lastName"),
                    "isVeteran": user.get("isVeteran"),
                    "interests": user.get("interests")
                }
                if not logged_in_user_data.get("isVeteran"):
                    user_info.update({
                        "employmentStatus": user.get("employmentStatus"),
                        "workLocation": user.get("workLocation"),
                        "liveLocation": user.get("liveLocation"),
                    })
                response_data.append(user_info)

            logger.info(f"Search results for '{query}' (if any): {response_data}")
            return response_data
    except ClientError as e:
        logger.error(f"Failed to search users in DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to search users.")

@router.get("/{logged_in_user}/{username}")
def search_users_by_username(username: str, logged_in_user:str):
    # Scan the DynamoDB table to find users with partial match
    response = users_table.get_item(Key={"username": username})
    return RedirectResponse(url=f"/profile/{username}")



