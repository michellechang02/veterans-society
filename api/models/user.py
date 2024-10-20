# User registration endpoint using Pydantic model
from pydantic import BaseModel, Field
from pydantic.networks import EmailStr
from typing import Optional

class UserCreate(BaseModel):
    first_name: str = Field(None, min_length=3, max_length=50)
    last_name: str = Field(..., min_length=3)
    username: str = Field(..., min_length=3, max_length=50)
    password: Optional[str] = Field(..., min_length=8, max_length=50)
    email: Optional[EmailStr] = None
    phone_number: str = Field(..., min_length=10, max_length=15)
    interests: List[str] = []
    employmentStatus: str
    workLocation: Optional[str] = None
    liveLocation: Optional[str] = None
    isVeteran: bool = False

    # If is veteran, height and weight are required
    @validator('employmentStatus', 'workLocation', 'liveLocation', 'weight', 'height', always=True)
    def validate_veteran_fields(cls, v, values, field):
        if values.get('isVeteran'):
            if v is None:
                raise ValueError(f'{field.name} is required for veterans')
            if field.name == 'height' and v <= 0:
                raise ValueError('Height must be a positive number')
            if field.name == 'weight' and v <= 0:
                raise ValueError('Weight must be a positive number')
        return v

class UserResponse(BaseModel):
    message: str