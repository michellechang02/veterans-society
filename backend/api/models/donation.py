from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import uuid4, UUID


class DonationCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Donation amount (must be greater than 0)")
    message: Optional[str] = None
    donor_name: Optional[str] = None
    email: Optional[str] = None


class DonationResponse(BaseModel):
    id: UUID
    amount: float
    message: Optional[str] = None
    donor_name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    client_secret: Optional[str] = None


class DonationDB(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    amount: float
    message: Optional[str] = None
    donor_name: Optional[str] = None
    email: Optional[str] = None
    payment_id: Optional[str] = None
    payment_status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.now)
