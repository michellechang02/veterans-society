import os
import boto3
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Fetch AWS credentials and region
aws_access_key_id = os.getenv('aws_access_key_id')
aws_secret_access_key = os.getenv('aws_secret_access_key')
aws_region = os.getenv('aws_region')

# Create a DynamoDB client
dynamodb = boto3.resource('dynamodb', 
                          aws_access_key_id=aws_access_key_id,
                          aws_secret_access_key=aws_secret_access_key,
                          region_name=aws_region)
# include creating tables after this.

if __name__ == "__main__":
    create_table()