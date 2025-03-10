import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Donation(BaseModel):
    donationId: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique identifier for the donation")
    username: str = Field(..., description="Username of the donor")
    amount: int = Field(..., description="Donation amount in cents")
    message: Optional[str] = Field(None, description="Optional message from donor")
    last4: str = Field(..., description="Last 4 digits of the card")
    expiryDate: str = Field(..., description="Card expiry date in MM/YY format")
    cardFingerprint: str = Field(..., description="Hashed fingerprint of the card (for repeat usage)")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Timestamp of the donation")
    status: str = Field(default="pending", description="Status of the donation")
