import threading
from datetime import datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory token blacklist with expiry timestamps
# For production at scale, replace with Redis
_blacklisted_tokens: dict[str, float] = {}
_blacklist_lock = threading.Lock()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a long-lived JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_refresh_token(token: str) -> dict | None:
    """Decode a refresh token and verify it's the right type."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None


def decode_access_token(token: str) -> dict | None:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def blacklist_token(token: str) -> None:
    """Add a token to the blacklist. It will be cleaned up after it naturally expires."""
    payload = decode_access_token(token)
    if payload and "exp" in payload:
        exp_timestamp = float(payload["exp"])
    else:
        # If we can't decode expiry, blacklist for the max token lifetime
        exp_timestamp = (datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()

    with _blacklist_lock:
        _blacklisted_tokens[token] = exp_timestamp
        # Cleanup expired entries while we're at it
        now = datetime.utcnow().timestamp()
        expired_keys = [k for k, v in _blacklisted_tokens.items() if v < now]
        for k in expired_keys:
            del _blacklisted_tokens[k]


def is_token_blacklisted(token: str) -> bool:
    """Check if a token has been blacklisted (logged out)."""
    with _blacklist_lock:
        return token in _blacklisted_tokens
