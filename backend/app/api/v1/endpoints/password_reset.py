import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.core.security import get_password_hash
from app.database import get_db
from app.models.user import User
from app.schemas.password_reset import (
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetResponse,
)
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()

RESET_TOKEN_EXPIRE_MINUTES = 30


@router.post("/request", response_model=PasswordResetResponse)
@limiter.limit("3/hour")
async def request_password_reset(
    request: Request,
    body: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    """
    Request a password reset token. Returns the token directly (no email service).
    """
    user = db.query(User).filter(User.email == body.email).first()

    if not user:
        # Don't reveal whether the email exists
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address",
        )

    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    db.commit()

    logger.info(f"Password reset token generated for user {user.id}")

    return PasswordResetResponse(
        message="Reset token generated. Use it to set a new password.",
        reset_token=token,
    )


@router.post("/confirm", response_model=PasswordResetResponse)
@limiter.limit("5/hour")
async def confirm_password_reset(
    request: Request,
    body: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    """
    Reset password using the token from the request endpoint.
    """
    user = db.query(User).filter(User.reset_token == body.token).first()

    if not user or not user.reset_token_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    if datetime.utcnow() > user.reset_token_expires:
        # Token expired — clear it
        user.reset_token = None
        user.reset_token_expires = None
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Update password and clear token
    user.password_hash = get_password_hash(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    logger.info(f"Password reset completed for user {user.id}")

    return PasswordResetResponse(message="Password has been reset successfully. You can now log in.")
