from pydantic import BaseModel, Field
from fastapi import UploadFile
from typing import List, Optional
import uuid
from api.models.post import Post

class CreateGroup(BaseModel):
    groupId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the group")
    name: str = Field(..., description="Name of the group")
    description: str = Field(..., description="Description of the group")
    author: str = Field(..., description="Author or creator of the group")
    image: Optional[UploadFile] = Field(None, description="URL of the group's image")  # Image URL field, optional
    posts: List[Post] = Field(default_factory=list, description="List of posts associated with the group")  # Default to empty list

class Group(BaseModel):
    groupId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the group")
    name: str = Field(..., description="Name of the group")
    description: str = Field(..., description="Description of the group")
    author: str = Field(..., description="Author or creator of the group")
    image: str = Field(None, description="URL of the group's image")  # Image URL field, optional
    posts: List[Post] = Field(default_factory=list, description="List of posts associated with the group")  # Default to empty list


class UpdateGroupNameDescription(BaseModel):
    name: str
    description: str