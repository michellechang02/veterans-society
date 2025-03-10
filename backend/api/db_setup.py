import os
import boto3
from dotenv import load_dotenv
from botocore.exceptions import ClientError

# Load environment variables from .env file
load_dotenv()

# Fetch AWS credentials and region
aws_access_key_id = os.getenv('aws_access_key_id')
aws_secret_access_key = os.getenv('aws_secret_access_key')
aws_region = os.getenv('aws_region')

# Create a DynamoDB resource
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=aws_region
)

def create_users_table():
    try:
        table = dynamodb.create_table(
            TableName='users',
            KeySchema=[
                {
                    'AttributeName': 'username',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'username',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'phone_number',
                    'AttributeType': 'S'
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'PhoneNumberIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'phone_number',
                            'KeyType': 'HASH'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print("Creating users table...")
        table.meta.client.get_waiter('table_exists').wait(TableName='users')
        print("Users table created successfully.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("Users table already exists.")
        else:
            raise e


def create_posts_table():
    # Delete existing table if it exists
    try:
        dynamodb.Table('posts').delete()
        print("Waiting for posts table to be deleted...")
        dynamodb.Table('posts').wait_until_not_exists()
    except Exception as e:
        print(f"Table might not exist or error deleting: {e}")

    # Create new table with updated schema
    try:
        table = dynamodb.create_table(
            TableName='posts',
            KeySchema=[
                {
                    'AttributeName': 'postId',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'postId',
                    'AttributeType': 'S'
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print("Waiting for posts table to be created...")
        table.wait_until_exists()
        print("Table created successfully!")
        return table
    except Exception as e:
        print(f"Error creating table: {e}")
        raise e


def create_comments_table():
    try:
        table = dynamodb.create_table(
            TableName='comments',
            KeySchema=[
                {
                    'AttributeName': 'commentId',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'commentId',
                    'AttributeType': 'S'  # String type for UUID
                },
                {
                    'AttributeName': 'postId',
                    'AttributeType': 'S'  # String type for associated post ID
                },
                {
                    'AttributeName': 'author',
                    'AttributeType': 'S'  # String type for author username
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'PostIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'postId',
                            'KeyType': 'HASH'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'AuthorIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'author',
                            'KeyType': 'HASH'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        print("Creating comments table...")
        table.meta.client.get_waiter('table_exists').wait(TableName='comments')
        print("Comments table created successfully.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("Comments table already exists.")
        else:
            raise e

def create_groups_table():
    try:
        # Creating the table for groups
        table = dynamodb.create_table(
            TableName='groups',
            KeySchema=[
                {
                    'AttributeName': 'groupId',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'groupId',
                    'AttributeType': 'S'  # String type for UUID
                },
                {
                    'AttributeName': 'name',
                    'AttributeType': 'S'  # String type for group name
                },
                {
                    'AttributeName': 'description',
                    'AttributeType': 'S'  # String type for group description
                },
                {
                    'AttributeName': 'author',
                    'AttributeType': 'S'  # String type for author
                },
                {
                    'AttributeName': 'image',
                    'AttributeType': 'S'  # String type for image URL
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'NameIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'name',
                            'KeyType': 'HASH'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'AuthorIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'author',
                            'KeyType': 'HASH'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        
        # Wait until the table is created
        print("Creating groups table...")
        table.meta.client.get_waiter('table_exists').wait(TableName='groups')
        print("Groups table created successfully.")
    
    except ClientError as e:
        # Handle table already exists error
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("Groups table already exists.")
        else:
            print(f"Error creating table: {e.response['Error']['Message']}")
            raise e


def create_donations_table():
    # Delete existing table if it exists
    try:
        dynamodb.Table('donations').delete()
        print("Waiting for donations table to be deleted...")
        dynamodb.Table('donations').wait_until_not_exists()
    except Exception as e:
        print(f"Table might not exist or error deleting: {e}")

    try:
        # Creating the table for donations
        table = dynamodb.create_table(
            TableName='donations',
            KeySchema=[
                {
                    'AttributeName': 'donationId',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'donationId',
                    'AttributeType': 'S'  # String type for UUID
                },
                {
                    'AttributeName': 'username',
                    'AttributeType': 'S'  # String type for username
                },
                {
                    'AttributeName': 'timestamp',
                    'AttributeType': 'S'  # String type for timestamp
                },
                {
                    'AttributeName': 'cardFingerprint',
                    'AttributeType': 'S'  # String type for card fingerprint
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'UserIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'username',
                            'KeyType': 'HASH'
                        },
                        {
                            'AttributeName': 'timestamp',
                            'KeyType': 'RANGE'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                },
                {
                    'IndexName': 'CardIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'cardFingerprint',
                            'KeyType': 'HASH'
                        },
                        {
                            'AttributeName': 'username',
                            'KeyType': 'RANGE'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    },
                    'ProvisionedThroughput': {
                        'ReadCapacityUnits': 5,
                        'WriteCapacityUnits': 5
                    }
                }
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )

        # Wait until the table is created
        print("Creating donations table...")
        table.meta.client.get_waiter('table_exists').wait(TableName='donations')
        print("Donations table created successfully.")
    except ClientError as e:
        # Handle table already exists error
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print("Donations table already exists.")
        else:
            print(f"Error creating table: {e.response['Error']['Message']}")
            raise e


if __name__ == "__main__":
    create_users_table()
    create_posts_table()
    create_comments_table()
    create_groups_table()
    create_donations_table()