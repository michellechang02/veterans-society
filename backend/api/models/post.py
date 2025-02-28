from fastapi import UploadFile
from pydantic import BaseModel, Field
from typing import Set, Optional, List
import uuid
from datetime import datetime

class Post(BaseModel):
    postId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the post")
    author: str = Field(..., description="Username of the post's author")
    content: str = Field(..., description="Content of the post")
    topics: Set[str] = Field(default={"general"}, description="Set of topics associated with the post")
    images: Set[str] = Field(default={"none"}, description="Set of vector embeddings or image references")
    likes: int = Field(default=0, description="Number of likes on the post")
    likedBy: List[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: str(datetime.now()), description="Timestamp of the post")
    
class UpdatePostModel(BaseModel):
    content: Optional[str] = None
    likes: Optional[int] = None
    topics: Optional[Set[str]] = None

class LikeRequest(BaseModel):
    username: str = Field(..., description="Username of the user liking the post")