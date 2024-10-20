from fastapi import APIRouter, HTTPException, Depends
from api.db_setup import dynamodb
from api.models.user import UserCreate, UserResponse
from passlib.context import CryptContext
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Initialize password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Reference to the users table
users_table = dynamodb.Table('users')

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate):
    # Check if the username already exists
    try:
        response = users_table.get_item(Key={'username': user.username})
    except ClientError:
        raise HTTPException(status_code=500, detail="Internal server error.")
    else:
        if 'Item' in response:
            raise HTTPException(status_code=400, detail="Username already exists.")

    # Check if the phone number already exists using GSI
    try:
        response = users_table.query(
            IndexName='PhoneNumberIndex',
            KeyConditionExpression=Attr('phone_number').eq(user.phone_number)
        )
    except ClientError:
        raise HTTPException(status_code=500, detail="Internal server error.")
    else:
        if 'Items' in response and len(response['Items']) > 0:
            raise HTTPException(status_code=400, detail="Phone number already registered.")

    # Hash the password
    hashed_password = get_password_hash(user.password)

    # Prepare the user item
    user_item = {
        'username': user.username,
        'password': hashed_password,
        'firstName': user.firstName,
        'lastName': user.lastName,
        'interests': user.interests,
        'isVeteran': user.isVeteran,
    }

    if user.email:
        user_item['email'] = user.email

    if user.is_veteran:
        user_item['employmentStatus'] = user.employmentStatus
        user_item['workLocation'] = user.workLocation
        user_item['liveLocation'] = user.liveLocation
        user_item['height'] = user.height  # Height in inches
        user_item['weight'] = user.weight  # Weight in pounds

    try:
        # Save the user in DynamoDB
        users_table.put_item(Item=user_item)
    except ClientError:
        raise HTTPException(status_code=500, detail="Internal server error.")

    return {"message": "User registered successfully!"}