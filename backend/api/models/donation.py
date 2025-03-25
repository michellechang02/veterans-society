from decimal import Decimal
from pydantic import BaseModel, Field, condecimal
from typing import Optional
from datetime import datetime
from uuid import uuid4, UUID


class DonationCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Donation amount (must be greater than 0)")
    message: Optional[str] = None
    donor_name: Optional[str] = None
    email: Optional[str] = None


class DonationResponse(BaseModel):
    id: UUID
    amount: Decimal
    message: Optional[str] = None
    donor_name: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    client_secret: Optional[str] = None

    class Config:
        json_encoders = {
            Decimal: str,  # Convert Decimal to string for JSON serialization
            UUID: str,     # Convert UUID to string
        }


class DonationDB(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    amount: Decimal
    message: Optional[str] = None
    donor_name: Optional[str] = None
    email: Optional[str] = None
    payment_id: Optional[str] = None
    payment_status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        json_encoders = {
            Decimal: str,
            UUID: str,
        }
