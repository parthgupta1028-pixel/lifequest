import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    level: int
    total_xp: int
    current_streak: int
    best_streak: int
    avatar: str
    role: str = "user"
    is_active: bool = True
    last_active_date: Optional[datetime.date] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

Token.model_rebuild()
