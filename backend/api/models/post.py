from pydantic import BaseModel, Field
from typing import Set, Optional
import uuid

class Post(BaseModel):
    postId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the post")
    author: str = Field(..., description="Username of the post's author")
    content: str = Field(..., description="Content of the post")
    topics: Set[str] = Field(default_factory=set, description="Set of topics associated with the post")
    images: Set[str] = Field(default_factory=set, description="Set of vector embeddings or image references")
    likes: int = Field(default=0, description="Number of likes on the post")
