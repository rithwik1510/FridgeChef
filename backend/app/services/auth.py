from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import (
    decode_access_token,
    get_password_hash,
    is_token_blacklisted,
    verify_password,
)
from app.database import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)


def get_user_by_email(db: Session, email: str) -> User | None:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Authenticate user with email and password."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_user(db: Session, email: str, password: str, name: str | None = None) -> User:
    """Create a new user."""
    # Check if user already exists
    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(password)
    user = User(
        email=email,
        password_hash=hashed_password,
        name=name,
        preferences={}
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


async def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if token is None:
        raise credentials_exception

    try:
        # Check if token has been blacklisted (logged out)
        if is_token_blacklisted(token.credentials):
            raise credentials_exception

        payload = decode_access_token(token.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except HTTPException:
        raise
    except Exception:
        raise credentials_exception from None

    user = get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    return user


async def get_optional_user(
    db: Session = Depends(get_db),
    token: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User | None:
    """Get user if token is valid, else return None (Guest)."""
    if token is None:
        return None

    try:
        if is_token_blacklisted(token.credentials):
            return None
        payload = decode_access_token(token.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return get_user_by_id(db, user_id)
    except Exception:
        return None
