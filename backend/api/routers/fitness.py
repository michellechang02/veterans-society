from fastapi import APIRouter, HTTPException, Depends
import boto3
from boto3.dynamodb.conditions import Key
from api.db_setup import dynamodb
from pydantic import BaseModel
import uuid

router = APIRouter(
    prefix="/fitness",
    tags=["fitness"]
)

table = dynamodb.Table('fitness_tasks')

class TaskCreate(BaseModel):
    description: str

@router.get("/{username}")
async def get_fitness_tasks(username: str):
    print(f"Getting fitness tasks for {username}")
    try:
        response = table.query(
            KeyConditionExpression=Key('username').eq(username)
        )
        return response['Items']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
    
@router.post("/{username}/{task_id}/check")
async def check_fitness_task(username: str, task_id: str):
    print(f"Checking fitness task {task_id} for {username}")

    try:
        response = table.query( KeyConditionExpression=Key('username').eq(username))
        if 'Items' not in response:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task = next((item for item in response['Items'] if item['task_id'] == task_id), None)
        current_task = task['is_finished']

        response = table.update_item(
            Key={'username': username, 'task_id': task_id},
            UpdateExpression='SET is_finished = :is_finished',
            ExpressionAttributeValues={':is_finished': not current_task},
            ReturnValues='UPDATED_NEW')
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{username}/task/add")
async def create_fitness_task(username: str, task: TaskCreate):
    try:
        task_id = str(uuid.uuid4())
        response = table.put_item(
            Item={
                'username': username,
                'task_id': task_id,
                'description': task.description,
                'is_finished': False
            }
        )
        return {
            'username': username,
            'task_id': task_id,
            'description': task.description,
            'is_finished': False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{username}/{task_id}/delete")
async def delete_fitness_task(username: str, task_id: str):
    try:
        # Delete the item
        response = table.delete_item(
            Key={
                'username': username,
                'task_id': task_id
            }
        )
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
