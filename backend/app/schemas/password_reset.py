from pydantic import BaseModel, EmailStr, Field


class PasswordResetRequest(BaseModel):
    """Schema for requesting a password reset token."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for confirming a password reset with the token."""
    token: str
    new_password: str = Field(min_length=8, max_length=100)


class PasswordResetResponse(BaseModel):
    """Schema for password reset response (returns token directly since no email)."""
    message: str
    reset_token: str | None = None
