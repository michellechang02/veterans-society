from fastapi import APIRouter, HTTPException
from api.db_setup import dynamodb
from api.models.donation import DonationCreate
from boto3.dynamodb.conditions import Key
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/donations",
    tags=["donations"]
)

donations_table = dynamodb.Table('donations')

@router.post("/")
async def create_donation(donation: DonationCreate):
    try:
        donation_id = str(uuid.uuid4())
        donation_item = {
            "donation_id": donation_id,
            "amount": donation.amount,
            "message": donation.message,
            "user_id": donation.user_id,
            "created_at": str(datetime.now())
        }
        
        dynamodb.Table('donations').put_item(Item=donation_item)
        return {"message": "Donation successful", "donation_id": donation_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/donations/{user_id}")
async def get_user_donations(user_id: str):
    try:
        response = dynamodb.Table('donations').query(
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
        return response['Items']
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 