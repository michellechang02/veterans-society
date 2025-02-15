# api/models/user.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from decimal import Decimal

class UserCreate(BaseModel):
    firstName: str
    lastName: str 
    username: str
    password: str
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    interests: Optional[List[str]] = None
    employmentStatus: Optional[str] = None
    workLocation: Optional[str] = None
    liveLocation: Optional[str] = None
    isVeteran: bool
    weight: Optional[Decimal] = None  # Changed to Decimal for compatibility with DynamoDB
    height: Optional[Decimal] = None  # Changed to Decimal for compatibility with DynamoDB

    @validator('employmentStatus', 'workLocation', 'liveLocation', 'weight', 'height', always=True)
    def validate_veteran_fields(cls, v, values, field):
        if values.get('isVeteran'):
            if v is None:
                raise ValueError(f'{field.name} is required for veterans.')
            if field.name == 'height' and v <= 0:
                raise ValueError('Height must be a positive number.')
            if field.name == 'weight' and v <= 0:
                raise ValueError('Weight must be a positive number.')
        return v

class UserResponse(BaseModel):
    username: Optional[str]
    firstName: Optional[str]
    lastName: Optional[str]
    email: Optional[str]
    isVeteran: Optional[bool]
    employmentStatus: Optional[str]
    workLocation: Optional[str]
    liveLocation: Optional[str]
    height: Optional[int]  # Height in inches
    weight: Optional[int]

    @validator('height', 'weight', pre=True, always=True)
    def convert_decimal_to_int(cls, v):
        if isinstance(v, Decimal):
            return int(v)
        return v

class LoginRequest(BaseModel):
    username: str
    password: str

# UserUpdateRequest model for updating user data
class UserUpdateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    interests: Optional[List[str]] = None
    employmentStatus: Optional[str] = None
    workLocation: Optional[str] = None
    liveLocation: Optional[str] = None
    isVeteran: Optional[bool] = None
    weight: Optional[Decimal] = None  # Changed to Decimal for compatibility with DynamoDB
    height: Optional[Decimal] = None  # Changed to Decimal for compatibility with DynamoDB

    @validator('employmentStatus', 'workLocation', 'liveLocation', 'weight', 'height', always=True)
    def validate_veteran_fields(cls, v, values, field):
        if values.get('isVeteran'):
            if v is None:
                raise ValueError(f"{field.name} is required for veterans.")
            if field.name == 'height' and v <= 0:
                raise ValueError("Height must be a positive number.")
            if field.name == 'weight' and v <= 0:
                raise ValueError("Weight must be a positive number.")
        return v
