from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from api.db_setup import dynamodb
from api.models.chat import MessageResponse, ChatRequest
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from typing import List, Dict
from datetime import datetime
from collections import defaultdict

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

# Reference to DynamoDB tables
chatrooms_table = dynamodb.Table('chatrooms')
messages_table = dynamodb.Table('messages')

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        self.active_connections[room_id].remove(websocket)
        if not self.active_connections[room_id]:
            del self.active_connections[room_id]

    async def broadcast(self, message: str, room_id: str):
        for connection in self.active_connections[room_id]:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws")
async def chat_endpoint(websocket: WebSocket, room_id: str, author: str):
    await manager.connect(websocket, room_id)

    # Check if room exists in the database
    try:
        response = chatrooms_table.get_item(Key={'room_id': room_id})
    except ClientError:
        await websocket.close()
        raise HTTPException(status_code=500, detail="Internal server error.")
    else:
        if 'Item' not in response:
            await websocket.close()
            raise HTTPException(status_code=404, detail="Chatroom not found.")

    try:
        while True:
            data = await websocket.receive_text()

            # Generate the timestamp
            timestamp = int(datetime.now().timestamp())

            # Store the message in DynamoDB
            message_item = {
                'room_id': room_id,
                'timestamp': timestamp,
                'message': data,
                'author': author
            }

            try:
                messages_table.put_item(Item=message_item)
            except ClientError:
                raise HTTPException(status_code=500, detail="Failed to store message.")

            await manager.broadcast(f"{author} ({datetime.fromtimestamp(timestamp)}): {data}", room_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(f"{author} has left the room.", room_id)

@router.get("/")
async def get_all_chat_rooms(user: str):
    try:
        response = chatrooms_table.scan(
            FilterExpression="contains(#users, :user)",
            ExpressionAttributeNames={"#users": "users"},
            ExpressionAttributeValues={":user": user}
        )
        room_ids = [item['room_id'] for item in response['Items']]
        return room_ids
    except ClientError:
        raise HTTPException(status_code=500, detail="Internal server error.")
    
@router.get("/users")
async def get_users_in_room(room_id: str):
    try:
        # Retrieve the item by room_id (primary key lookup)
        response = chatrooms_table.get_item(Key={"room_id": room_id})
        
        # Check if the room exists
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Get the list of users in the room
        users = response['Item'].get('users', [])
        
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/messages")
async def get_messages_in_room(room_id: str):
    try:
        # Query the Messages table by room_id, ordered by timestamp
        response = messages_table.query(
            KeyConditionExpression=Key('room_id').eq(room_id)
        )
        
        # Extract messages from the response
        messages = response.get('Items', [])
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/create", response_model=MessageResponse)
async def create_chat_room(req: ChatRequest):
    # Define the item to insert into the DynamoDB table
    chatroom_item = {
        'room_id': req.room_id,
        'users': set([req.user])  # Create a set with the initial user
    }

    try:
        chatrooms_table.put_item(
            Item=chatroom_item,
            ConditionExpression=Attr('room_id').not_exists()  # only if room_id does not exist
        )
    except ClientError as e:
        # room already exists
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            raise HTTPException(status_code=400, detail="Chat room already exists.")
        print(f"Error creating room: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail="Internal server error.")

    return {"message": "Chat room created successfully!"}

@router.put("/join", response_model=MessageResponse)
async def join_chat_room(req: ChatRequest):
    try:
        # Fetch the room details
        response = chatrooms_table.get_item(Key={'room_id': req.room_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Chat room not found.")

        room_data = response['Item']
        users_in_room = room_data.get('users', set())

        # Check if the user is already in the room
        if req.user in users_in_room:
            raise HTTPException(status_code=400, detail="User already in the room.")
    except ClientError as e:
        print(f"Error checking room existence or fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error.")

    # Update the users set in the room
    try:
        chatrooms_table.update_item(
            Key={'room_id': req.room_id},
            UpdateExpression="ADD #u :user_set",
            ExpressionAttributeNames={
                '#u': 'users'  # Reference the reserved keyword 'users'
            },
            ExpressionAttributeValues={
                ':user_set': set([req.user])
            }
        )

        # Save the join notification in DynamoDB
        timestamp = int(datetime.now().timestamp())
        message = f"{req.user} has joined the room."

        message_item = {
            'room_id': req.room_id,
            'timestamp': timestamp,
            'message': message,
            'author': 'System'  # Indicate it's a system-generated message
        }

        try:
            messages_table.put_item(Item=message_item)
        except ClientError as e:
            print(f"Error saving system message: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save system message.")

        # Broadcast join notification to the room
        await manager.broadcast(f"System ({datetime.fromtimestamp(timestamp)}): {message}", req.room_id)
    except ClientError as e:
        print(f"Error updating room: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to join the room.")

    return {"message": f"User {req.user} joined room {req.room_id}!"}

@router.put("/leave", response_model=MessageResponse)
async def leave_chat_room(req: ChatRequest):
    try:
        response = chatrooms_table.get_item(Key={'room_id': req.room_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Chat room not found.")
    except ClientError as e:
        print(f"Error checking room existence: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error.")

    # Remove user from the set using DELETE operation
    try:
        chatrooms_table.update_item(
            Key={'room_id': req.room_id},
            UpdateExpression="DELETE #u :user_set",
            ExpressionAttributeNames={
                '#u': 'users'  # Handle reserved keyword
            },
            ExpressionAttributeValues={
                ':user_set': set([req.user])  # Convert to set for removal
            }
        )

        # Save the leave notification in DynamoDB
        timestamp = int(datetime.now().timestamp())
        message = f"{req.user} has left the room."

        message_item = {
            'room_id': req.room_id,
            'timestamp': timestamp,
            'message': message,
            'author': 'System'  # Indicate it's a system-generated message
        }

        try:
            messages_table.put_item(Item=message_item)
        except ClientError as e:
            print(f"Error saving system message: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save system message.")

        # Broadcast leave notification to the room
        await manager.broadcast(f"System ({datetime.fromtimestamp(timestamp)}): {message}", req.room_id)
    except ClientError as e:
        print(f"Error updating room: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to leave the room.")

    return {"message": f"User {req.user} left room {req.room_id}."}
