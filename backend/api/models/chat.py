from pydantic import BaseModel
from typing import List

class ChatRoom(BaseModel):
    room: str
    users: List[str]

class MessageResponse(BaseModel):
    message: str