# User registration endpoint using Pydantic model
from Pydantic import BaseModel, EmaitStr, Field
from typing import Optional

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    phone_number: str = Field(..., min_length=10, max_length=15)
    password: Optional[str] = Field(..., min_length=8, max_length=50)
    first_name: str = Field(None, min_length=3, max_length=50)
    last_name: str = Field(..., min_length=3)
    is_veteran: bool = False
    height: Optional[float] = None # Height in inches
    weight: Optional[float] = None # Weight in pounds

    # If is veteran, height and weight are required
    @validator('height', 'weight', always=True)
    def validate_veteran_fields(cls, v, values, field):
        if values.get('is_veteran'):
            if v is None:
                raise ValueError(f'{field.name} is required for veterans')
            if field.name == 'height' and v <= 0:
                raise ValueError('Height must be a positive number')
            if field.name == 'weight' and v <= 0:
                raise ValueError('Weight must be a positive number')
        return v

class UserResponse(BaseModel):
    message: str