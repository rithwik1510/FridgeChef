import uuid

from sqlalchemy import JSON, Column, DateTime, String
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    """User model for authentication and preferences."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100))
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())
    preferences = Column(JSON, default={})
    # Temporarily disabled - migration didn't run
    # reset_token = Column(String(64), nullable=True, index=True)
    # reset_token_expires = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User {self.email}>"
