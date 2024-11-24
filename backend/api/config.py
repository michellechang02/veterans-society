# backend/api/config.py
from fastapi_login import LoginManager
import os
from dotenv import load_dotenv
import logging
from botocore.exceptions import ClientError

# Load environment variables
load_dotenv()

# Retrieve the secret key from environment variables
SECRET_KEY = os.getenv("secret_login_key", "default_secret_key")

# Initialize the LoginManager with the secret key and token URL
login_manager = LoginManager(SECRET_KEY, token_url="/users/login")

# Initialize the logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

logger.info(f"login_manager._user_callback before registration: {login_manager._user_callback}")

@login_manager.user_loader()
def load_user(username: str):
    print(f"Attempting to load user: {username}")
    try:
        from api.db_setup import dynamodb  # Import here to avoid circular imports
        response = dynamodb.Table('users').get_item(Key={"username": username})
        user = response.get("Item")
        if user:
            print(f"Loaded user: {user}")
        else:
            print(f"User not found: {username}")
        return user
    except ClientError as e:
        logger.error(f"Error loading user from DynamoDB: {e}")
        return None

logger.info(f"login_manager._user_callback after registration: {login_manager._user_callback}")

# Export the login_manager for use in other modules
__all__ = ["login_manager"]
