# api/models/user.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List

class UserCreate(BaseModel):
    first_name: Optional[str]
    last_name: str 
    username: str
    password: Optional[str]
    email: EmailStr
    phone_number: str
    interests: List[str] = []
    employment_status: Optional[str] = None
    work_location: Optional[str] = None
    live_location: Optional[str] = None
    is_veteran: bool = False
    weight: Optional[float] = None 
    height: Optional[float] = None

    @validator('employment_status', 'work_location', 'live_location', 'weight', 'height', always=True)
    def validate_veteran_fields(cls, v, values, field):
        if values.get('is_veteran'):
            if v is None:
                raise ValueError(f'{field.name} is required for veterans.')
            if field.name == 'height' and v <= 0:
                raise ValueError('Height must be a positive number.')
            if field.name == 'weight' and v <= 0:
                raise ValueError('Weight must be a positive number.')
        return v

class UserResponse(BaseModel):
    message: str
