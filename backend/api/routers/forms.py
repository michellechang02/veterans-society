from fastapi import APIRouter, HTTPException
from boto3.dynamodb.conditions import Key
from api.db_setup import dynamodb

router = APIRouter(
    prefix="/forms",
    tags=["forms"]
)

google_forms_table = dynamodb.Table('google_forms')

@router.get("/get_all_forms")
async def get_forms():
    try:
        response = google_forms_table.scan()
        return response.get('Items', [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/get_form_by_link")
async def get_form_by_link(link: str):
    try:
        response = google_forms_table.get_item(Key={'link': link})
        return response.get('Item', {})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))