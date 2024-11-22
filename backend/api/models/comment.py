from pydantic import BaseModel, Field
from typing import Optional
import uuid

class Comment(BaseModel):
    commentId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the comment")
    postId: str = Field(..., description="Unique identifier of the associated post")
    author: str = Field(..., description="Username of the comment's author")
    content: str = Field(..., description="Content of the comment")
