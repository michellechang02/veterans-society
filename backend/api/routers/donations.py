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
from pydantic import BaseModel
from decimal import Decimal

router = APIRouter(
    prefix="/donations",
    tags=["donations"],
    responses={404: {"description": "Not found"}},
)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

stripe.webhook_secret = os.getenv("VITE_STRIPE_WEBHOOK_SECRET")
print(f"Stripe secret key: {stripe.api_key}")
print(f"Stripe webhook secret: {stripe.webhook_secret}")

# Configure DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=os.getenv('aws_access_key_id'),
    aws_secret_access_key=os.getenv('aws_secret_access_key'),
    region_name=os.getenv('aws_region')
)

donation_table = dynamodb.Table('donations')

class PaymentIntentRequest(BaseModel):
    amount: float
    message: Optional[str] = None

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

@router.post("/create-payment-intent")
async def create_payment_intent(donation: DonationCreate):
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    try:
        # Convert string to Decimal
        amount = Decimal(donation.amount)
        
        # Create Stripe payment intent (Stripe needs cents as integer)
        stripe_amount = int(amount * 100)
        
        intent = stripe.PaymentIntent.create(
            amount=stripe_amount,
            currency='usd',
            automatic_payment_methods={
                'enabled': True
            },
            metadata={
                'message': donation.message or '',
                'donor_name': donation.donor_name or '',
                'email': donation.email or ''
            }
        )

        # Create donation record
        donation_db = DonationDB(
            amount=amount,
            message=donation.message,
            donor_name=donation.donor_name,
            email=donation.email,
            payment_id=intent.id,
            payment_status='pending'
        )

        # Convert to response model
        response = DonationResponse(
            id=donation_db.id,
            amount=donation_db.amount,
            message=donation_db.message,
            donor_name=donation_db.donor_name,
            email=donation_db.email,
            created_at=donation_db.created_at,
            client_secret=intent.client_secret
        )

        return response

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid amount format: {str(e)}")
    except Exception as e:
        print(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv('VITE_STRIPE_WEBHOOK_SECRET')
    stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )

        # Handle successful payments
        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            
            # Update donation status in DynamoDB
            try:
                donations = donation_table.query(
                    IndexName='payment_intent_id-index',
                    KeyConditionExpression='payment_intent_id = :pid',
                    ExpressionAttributeValues={
                        ':pid': payment_intent.id
                    }
                )

                if donations.get('Items'):
                    donation = donations['Items'][0]
                    donation_table.update_item(
                        Key={'id': donation['id']},
                        UpdateExpression='SET #status = :status, updated_at = :updated_at',
                        ExpressionAttributeNames={
                            '#status': 'status'
                        },
                        ExpressionAttributeValues={
                            ':status': 'completed',
                            ':updated_at': datetime.now().isoformat()
                        }
                    )
            except Exception as e:
                print(f" Error updating donation status: {str(e)}")
                # Don't raise here - we still want to return 200 to Stripe

        # Handle failed payments
        elif event.type == 'payment_intent.payment_failed':
            payment_intent = event.data.object
            error_message = payment_intent.last_payment_error.message if payment_intent.last_payment_error else 'Unknown error'

        return {"status": "success"}

    except ValueError as e:
        raise HTTPException(status_code=400, detail='Invalid payload')
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail='Invalid signature')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[DonationResponse])
async def get_donations():
    try:
        response = donation_table.scan()
        return [item for item in response.get('Items', [])]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
