# api/models/user.py
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List

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
    weight: Optional[float] = None 
    height: Optional[float] = None

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
    message: str
