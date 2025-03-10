import hashlib
import hmac
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field, SecretStr, validator

from api.db_setup import dynamodb
from api.models.donation import Donation

# You should store this in a secure environment variable
HMAC_KEY = os.getenv("CARD_FINGERPRINT_KEY")

if not HMAC_KEY:
    raise ValueError("CARD_FINGERPRINT_KEY environment variable not set")

router = APIRouter(
    prefix="/donations",
    tags=["donations"]
)

table = dynamodb.Table('donations')


def process_payment(card_number, expiry_date, security_code, amount):
    """
    Process a payment with the card details.

    In a real implementation, this would call a payment gateway API.
    For this example, we'll simulate a success/failure based on the card number.
    """
    # Get the raw card number
    card_num = card_number.get_secret_value()

    # Simple simulation: cards ending with odd numbers are declined
    if int(card_num[-1]) % 2 == 1:
        return {
            "success": False,
            "transaction_id": None,
            "message": "Payment declined. Please use a different card."
        }

    # Generate a fake transaction ID
    transaction_id = str(uuid.uuid4())

    return {
        "success": True,
        "transaction_id": transaction_id,
        "message": "Payment processed successfully."
    }


def generate_card_fingerprint(card_number, expiry_date):
    """
    Create a secure fingerprint of the card that can be used to identify repeat usage
    without storing the actual card number.
    """
    # Get the raw card number
    card_num = card_number.get_secret_value()

    # Combine card number and expiry for the fingerprint
    data = f"{card_num}|{expiry_date}"

    # Create an HMAC using a secret key
    h = hmac.new(
        key=HMAC_KEY.encode('utf-8'),
        msg=data.encode('utf-8'),
        digestmod=hashlib.sha256
    )

    return h.hexdigest()


class DonationRequest(BaseModel):
    amount: int = Field(..., description="Donation amount in cents")
    message: Optional[str] = Field(None, description="Optional message from donor")
    cardNumber: SecretStr = Field(..., description="Credit card number (last 4 digits will be stored)")
    expiryDate: str = Field(..., description="Card expiry date in MM/YY format")
    securityCode: SecretStr = Field(..., description="Card security code (will not be stored)")

    @validator('cardNumber')
    def validate_card_number(cls, v):
        # Basic validation
        card_number = v.get_secret_value()
        if not card_number.isdigit():
            raise ValueError("Card number must contain only digits")
        if len(card_number) < 13 or len(card_number) > 19:
            raise ValueError("Card number length must be between 13 and 19 digits")
        return v

    @validator('expiryDate')
    def validate_expiry_date(cls, v):
        # Basic MM/YY validation
        if not v or len(v) != 5 or v[2] != '/':
            raise ValueError("Expiry date must be in MM/YY format")

        month, year = v.split('/')
        if not (month.isdigit() and year.isdigit()):
            raise ValueError("Month and year must be digits")

        month_num = int(month)
        if month_num < 1 or month_num > 12:
            raise ValueError("Month must be between 01 and 12")

        current_year = datetime.now().year % 100  # Gets the last 2 digits
        if int(year) < current_year:
            raise ValueError("Card is expired")

        return v


def log_payment_attempt(donation_id, username, amount, success, message):
    """Log payment attempts for audit purposes"""
    # In a real application, you would log this to a separate table or logging system
    # This is just a placeholder
    print(f"PAYMENT LOG: ID={donation_id}, User={username}, Amount={amount}, Success={success}, Message={message}")


@router.post("/{username}/donate")
async def make_donation(username: str, request: DonationRequest, background_tasks: BackgroundTasks):
    """Process a donation and store the record in the database"""
    try:
        # 1. Get the last 4 digits of the card (only part we'll store)
        card_number = request.cardNumber.get_secret_value()
        last4 = card_number[-4:]

        # 2. Generate a card fingerprint (for identifying repeat usage)
        card_fingerprint = generate_card_fingerprint(
            request.cardNumber,
            request.expiryDate
        )

        # 3. Process the payment
        payment_result = process_payment(
            request.cardNumber,
            request.expiryDate,
            request.securityCode,
            request.amount
        )

        # 4. Create donation record
        donation = Donation(
            username=username,
            amount=request.amount,
            message=request.message,
            last4=last4,
            expiryDate=request.expiryDate,
            cardFingerprint=card_fingerprint,
            status="completed" if payment_result["success"] else "failed"
        )

        # 5. Store in DynamoDB
        table.put_item(Item=donation.dict())

        # 6. Log the payment attempt (background task)
        background_tasks.add_task(
            log_payment_attempt,
            donation.donationId,
            username,
            request.amount,
            payment_result["success"],
            payment_result["message"]
        )

        # 7. Return appropriate response
        if payment_result["success"]:
            return {
                "success": True,
                "message": "Donation processed successfully",
                "donationId": donation.donationId,
                "transactionId": payment_result["transaction_id"]
            }
        else:
            return {
                "success": False,
                "message": payment_result["message"],
                "donationId": donation.donationId
            }

    except ValueError as e:
        # Handle validation errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing donation: {str(e)}")


# 4. For development/testing purposes - get donation by ID
@router.get("/{donation_id}")
async def get_donation(donation_id: str):
    """Retrieve a donation by ID"""
    try:
        response = table.get_item(Key={"donationId": donation_id})
        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Donation not found")
        return response["Item"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving donation: {str(e)}")


# 5. Get all donations for a user
@router.get("/user/{username}")
async def get_user_donations(username: str):
    """Retrieve all donations made by a user"""
    try:
        response = table.query(
            IndexName="UserIndex",
            KeyConditionExpression="username = :username",
            ExpressionAttributeValues={
                ":username": username
            }
        )
        return response.get("Items", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving donations: {str(e)}")
