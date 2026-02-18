import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from app.database import Base


class PantryItem(Base):
    """Pantry item model for user's ingredient inventory."""

    __tablename__ = "pantry_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    quantity = Column(String(100), default="some")
    category = Column(String(100), default="Other")
    expiry_date = Column(Date, nullable=True)
    added_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    def __repr__(self):
        return f"<PantryItem {self.name}>"
