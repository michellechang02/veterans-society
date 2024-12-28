from pydantic import BaseModel, Field
from typing import List
import uuid
from api.models.post import Post

class Group(BaseModel):
    groupId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the group")
    name: str
    description: str
    author: str
    posts: List[Post] = []