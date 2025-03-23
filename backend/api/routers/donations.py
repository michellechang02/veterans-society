from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Request
from api.models.donation import DonationCreate, DonationResponse, DonationDB
from typing import List, Optional
import stripe
import os
from datetime import datetime
import uuid
import boto3
from botocore.exceptions import ClientError
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix="/donations",
    tags=["donations"],
    responses={404: {"description": "Not found"}},
)

# Configure Stripe with your API key
# In production, use environment variables for this
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_your_test_key")

# Configure DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=os.getenv('aws_access_key_id'),
    aws_secret_access_key=os.getenv('aws_secret_access_key'),
    region_name=os.getenv('aws_region')
)
donation_table = dynamodb.Table('donations')

# Helper function to convert DynamoDB item to DonationResponse
def item_to_donation(item):
    return DonationResponse(
        id=uuid.UUID(item['id']),
        amount=float(item['amount']),
        message=item.get('message'),
        donor_name=item.get('donor_name'),
        email=item.get('email'),
        created_at=datetime.fromisoformat(item['created_at']),
        client_secret=item.get('client_secret')
    )

@router.post("/create-payment-intent", response_model=DonationResponse)
async def create_payment_intent(donation: DonationCreate):
    try:
        # Create a payment intent with Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(donation.amount * 100),  # Stripe requires amount in cents
            currency="usd",
            metadata={
                "message": donation.message,
                "donor_name": donation.donor_name,
                "email": donation.email
            }
        )
        
        # Create a donation record
        donation_id = str(uuid.uuid4())
        donation_record = DonationDB(
            id=uuid.UUID(donation_id),
            amount=donation.amount,
            message=donation.message,
            donor_name=donation.donor_name,
            email=donation.email,
            payment_id=intent.id,
            payment_status="pending"
        )
        
        # Convert to dict for DynamoDB and store
        donation_item = jsonable_encoder(donation_record)
        # Convert UUID to string and datetime to ISO string for DynamoDB
        donation_item['id'] = str(donation_record.id)
        # Fix: Access the datetime object directly instead of through FieldInfo
        created_at = donation_record.created_at
        if isinstance(created_at, datetime):
            donation_item['created_at'] = created_at.isoformat()
        
        # Store in DynamoDB
        donation_table.put_item(Item=donation_item)
        
        # Return the client_secret to the frontend
        return DonationResponse(
            id=donation_record.id,
            amount=donation.amount,
            message=donation.message,
            donor_name=donation.donor_name,
            email=donation.email,
            created_at=donation_record.created_at,
            client_secret=intent.client_secret
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.post("/webhook", status_code=200)
async def webhook(background_tasks: BackgroundTasks, request: Request):
    # Get the Stripe signature from the headers
    signature = request.headers.get("stripe-signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")
    
    # Read the raw body
    body = await request.body()
    
    try:
        # Verify the webhook signature
        event = stripe.Webhook.construct_event(
            payload=body,
            sig_header=signature,
            secret=os.getenv("STRIPE_WEBHOOK_SECRET")
        )
        
        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # Update the payment status in DynamoDB
            donation_table.update_item(
                Key={'payment_id': payment_intent['id']},
                UpdateExpression="set payment_status=:s",
                ExpressionAttributeValues={':s': 'succeeded'}
            )
        
        return {"status": "success"}
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")


@router.get("/", response_model=List[DonationResponse])
async def get_donations():
    try:
        # Query DynamoDB for all donations
        response = donation_table.scan()
        donations = response.get('Items', [])
        
        # Convert DynamoDB items to DonationResponse objects
        return [item_to_donation(item) for item in donations]
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
