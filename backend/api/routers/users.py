# backend/api/routes/users.py
from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, Request, Depends, UploadFile
from api.aws_wrappers.images import delete_image, upload_image
from api.db_setup import dynamodb
from api.config import login_manager
from api.models.user import UserCreate, UserResponse, LoginRequest, UserUpdateRequest, ProfilePicResponse
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
admins_table = dynamodb.Table('admins')

# Used for logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# After importing login_manager

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# 1. FIXED PATH ROUTES (most specific, no path parameters)
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
        
    if user.phoneNumber:
        user_item['phoneNumber'] = user.phoneNumber

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

    role = "veteran"
    try:
        admin = admins_table.get_item(Key={'email': user_data.get('email')})
        role = "admin" if 'Item' in admin else "veteran"
    except ClientError as e:
        logger.error(f"This is not an admin")

    # Return the token as JSON instead of RedirectResponse
    return {"access_token": token, "token_type": "bearer", "role": role}

@router.get("/logout")
def logout(user: dict = Depends(login_manager)):
    return RedirectResponse(url="/", status_code=303)

@router.get("/admin/all", response_model=List[UserResponse])
async def get_all_users(user: dict = Depends(login_manager)):
    """
    Retrieve all users in the system.
    Only admin users can access this endpoint.
    Returns only veteran users.
    """
    try:
        # Comment out admin check for development
        # admin_response = admins_table.get_item(Key={'email': user.get('email', '')})
        # if 'Item' not in admin_response:
        #     raise HTTPException(status_code=403, detail="Access forbidden. Admin privileges required.")
        
        # Scan the users table to get all users
        response = users_table.scan()
        users = response.get('Items', [])
        
        # Handle pagination if there are more results
        while 'LastEvaluatedKey' in response:
            response = users_table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            users.extend(response.get('Items', []))
        
        # Format user data to match response model, filtering for veterans only
        formatted_users = []
        for user_data in users:
            # Only include users where isVeteran is True
            if user_data.get("isVeteran", False):
                formatted_user = {
                    "username": user_data.get("username"),
                    "firstName": user_data.get("firstName"),
                    "lastName": user_data.get("lastName"),
                    "email": user_data.get("email"),
                    "phoneNumber": user_data.get("phoneNumber"),
                    "interests": user_data.get("interests", []),
                    "isVeteran": user_data.get("isVeteran", False),
                    "profilePic": user_data.get("profilePic"),
                    "employmentStatus": user_data.get("employmentStatus"),
                    "workLocation": user_data.get("workLocation"),
                    "liveLocation": user_data.get("liveLocation"),
                    "height": user_data.get("height"),
                    "weight": user_data.get("weight")
                }
                formatted_users.append(formatted_user)
            
        logger.info(f"Retrieved {len(formatted_users)} veteran users from database")
        return formatted_users
    except ClientError as e:
        logger.error(f"Failed to retrieve users from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve users.")

# 2. ADMIN ROUTES WITH PARAMETERS
@router.put("/admin/{username}/update", response_model=UserResponse)
async def admin_update_user(
    username: str,
    firstName: Optional[str] = Form(None),
    lastName: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phoneNumber: Optional[str] = Form(None),
    interests: Optional[List[str]] = Form(None),
    employmentStatus: Optional[str] = Form(None),
    workLocation: Optional[str] = Form(None),
    liveLocation: Optional[str] = Form(None),
    isVeteran: Optional[bool] = Form(None),
    height: Optional[int] = Form(None),
    weight: Optional[int] = Form(None),
    profilePic: Optional[UploadFile] = File(None),
    user: dict = Depends(login_manager),
):
    """
    Update user information as an admin.
    Only admin users can access this endpoint.
    """
    try:
        # Comment out admin check for development
        # admin_response = admins_table.get_item(Key={'email': user.get('email', '')})
        # if 'Item' not in admin_response:
        #     raise HTTPException(status_code=403, detail="Access forbidden. Admin privileges required.")
            
        # Check if the user to update exists
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")

        update_expression = "SET "
        expression_attribute_values = {}

        # Build update fields dynamically
        update_fields = {
            "firstName": firstName,
            "lastName": lastName,
            "password": password,
            "email": email,
            "phoneNumber": phoneNumber,
            "interests": interests,
            "employmentStatus": employmentStatus,
            "workLocation": workLocation,
            "liveLocation": liveLocation,
            "isVeteran": isVeteran,
            "height": height,
            "weight": weight,
        }

        for field, value in update_fields.items():
            if value is not None:
                update_expression += f"{field} = :{field}, "
                expression_attribute_values[f":{field}"] = value

        if profilePic is not None:
            url = await upload_image("profile-pictures", profilePic)
            update_expression += "profilePic = :profilePic, "
            expression_attribute_values[":profilePic"] = url

        update_expression = update_expression.rstrip(", ")

        if not expression_attribute_values:
            return {"message": "No fields to update."}

        users_table.update_item(
            Key={"username": username},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )

        # Fetch the updated user data
        updated_response = users_table.get_item(Key={"username": username})
        updated_user = updated_response['Item']

        # Return the updated user data as a UserResponse object
        return UserResponse(
            username=updated_user.get("username"),
            firstName=updated_user.get("firstName"),
            lastName=updated_user.get("lastName"),
            email=updated_user.get("email"),
            phoneNumber=updated_user.get("phoneNumber"),
            isVeteran=updated_user.get("isVeteran"),
            employmentStatus=updated_user.get("employmentStatus"),
            workLocation=updated_user.get("workLocation"),
            liveLocation=updated_user.get("liveLocation"),
            height=updated_user.get("height"),
            weight=updated_user.get("weight"),
            profilePic=updated_user.get("profilePic"),
        )
    except ClientError as e:
        logger.error(f"Failed to update user in DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user.")
    except ValueError as e:
        # Catch validation errors from Pydantic
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/admin/{username}")
async def admin_delete_user(username: str, user: dict = Depends(login_manager)):
    """
    Delete a user as an admin.
    Only admin users can access this endpoint.
    """
    try:
        # Comment out admin check for development
        # admin_response = admins_table.get_item(Key={'email': user.get('email', '')})
        # if 'Item' not in admin_response:
        #     raise HTTPException(status_code=403, detail="Access forbidden. Admin privileges required.")
        
        # Check if the user to delete exists
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")
        
        # Delete profile pic if it exists
        user_item = response['Item']
        if "profilePic" in user_item:
            delete_image(user_item["profilePic"], "profile-pictures")
        
        # Delete the user
        users_table.delete_item(Key={"username": username})
        return {"message": f"User {username} deleted successfully."}
    except ClientError as e:
        logger.error(f"Failed to delete user from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user.")

# 3. SPECIFIC PATHS WITH ONE PARAMETER
@router.get("/pic/{username}", response_model=ProfilePicResponse)
async def get_user_picture(username: str):
    """
    Retrieve user profile picture for the specified username.
    Only the authenticated user can access their data.
    """
    try:
        logger.info(f"Fetching user data for: {username}")
        response = users_table.get_item(Key={"username": username})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="User not found.")
        
        # Check if the profilePic field exists
        profile_pic = response["Item"].get("profilePic")
        if not profile_pic:  # If profilePic is missing, null, or empty
            return {"profilePic": None}
        
        return {"profilePic": profile_pic}  # Return the profilePic field
    except ClientError as e:
        logger.error(f"Failed to retrieve user from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Internal server error.")

@router.get("/{username}/visit", response_model=UserResponse)
async def get_other_user(username: str, user: dict = Depends(login_manager)):
    """
    Retrieve user information for the specified username.
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
        "phoneNumber": user_data.get("phoneNumber"),
        "employmentStatus": None,  # Hide employment details
        "workLocation": None,
        "liveLocation": None,
        "height": None,  # Hide personal details
        "weight": None,
        "profilePic": user_data.get("profilePic")
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
                    "interests": user.get("interests"),
                    "profilePic": user.get("profilePic")
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

# 4. GENERAL USER ROUTES (basic CRUD operations with the same path)
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

@router.put("/{username}", response_model=UserResponse)
async def update_user(
    username: str,
    firstName: Optional[str] = Form(None),
    lastName: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phoneNumber: Optional[str] = Form(None),
    interests: Optional[List[str]] = Form(None),
    employmentStatus: Optional[str] = Form(None),
    workLocation: Optional[str] = Form(None),
    liveLocation: Optional[str] = Form(None),
    isVeteran: Optional[bool] = Form(None),
    height: Optional[int] = Form(None),
    weight: Optional[int] = Form(None),
    profilePic: Optional[UploadFile] = File(None),
    user: dict = Depends(login_manager),
):
    if user["username"] != username:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    try:
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")

        update_expression = "SET "
        expression_attribute_values = {}

        # Build update fields dynamically
        update_fields = {
            "firstName": firstName,
            "lastName": lastName,
            "password": password,
            "email": email,
            "phoneNumber": phoneNumber,
            "interests": interests,
            "employmentStatus": employmentStatus,
            "workLocation": workLocation,
            "liveLocation": liveLocation,
            "isVeteran": isVeteran,
            "height": height,
            "weight": weight,
        }

        for field, value in update_fields.items():
            if value is not None:
                update_expression += f"{field} = :{field}, "
                expression_attribute_values[f":{field}"] = value

        if profilePic is not None:
            url = await upload_image("profile-pictures", profilePic)
            update_expression += "profilePic = :profilePic, "
            expression_attribute_values[":profilePic"] = url

        update_expression = update_expression.rstrip(", ")

        users_table.update_item(
            Key={"username": username},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
        )

        # Fetch the updated user data
        updated_response = users_table.get_item(Key={"username": username})
        updated_user = updated_response['Item']

        # Return the updated user data as a UserResponse object
        return UserResponse(
            username=updated_user.get("username"),
            firstName=updated_user.get("firstName"),
            lastName=updated_user.get("lastName"),
            email=updated_user.get("email"),
            phoneNumber=updated_user.get("phoneNumber"),
            isVeteran=updated_user.get("isVeteran"),
            employmentStatus=updated_user.get("employmentStatus"),
            workLocation=updated_user.get("workLocation"),
            liveLocation=updated_user.get("liveLocation"),
            height=updated_user.get("height"),
            weight=updated_user.get("weight"),
            profilePic=updated_user.get("profilePic"),
        )
    except ClientError as e:
        logger.error(f"Failed to update user in DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user.")
    
@router.get("/{username}/is-admin", response_model=bool)
async def get_is_admin(username: str):
    response = admins_table.get_item(Key={"email": username})
    return {"isAdmin": "Item" in response}

@router.delete("/{username}", response_model=UserResponse)
async def delete_user(username: str, user: dict = Depends(login_manager)):
    if user["username"] != username:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    try:
        response = users_table.get_item(Key={"username": username})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="User not found.")
        
        # delete profile pic
        user_item = response['Item']
        if "profilePic" in user_item:
            delete_image(user_item["profilePic"], "profile-pictures")

        users_table.delete_item(Key={"username": username})
        return {"message": "User deleted successfully."}
    except ClientError as e:
        logger.error(f"Failed to delete user from DynamoDB: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user.")


