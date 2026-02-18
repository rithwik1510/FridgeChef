from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    name: str | None = Field(None, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: str
    email: str
    name: str | None
    created_at: datetime
    preferences: dict

    class Config:
        from_attributes = True
