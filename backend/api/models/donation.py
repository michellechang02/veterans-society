from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DonationCreate(BaseModel):
    amount: float
    message: Optional[str]
    user_id: str
    created_at: Optional[str] = None