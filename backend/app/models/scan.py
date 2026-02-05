import uuid

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from app.database import Base


class Scan(Base):
    """Fridge scan model for storing uploaded images and detected ingredients."""

    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    status = Column(String(50), default="processing")  # processing, completed, failed
    ingredients = Column(JSON, default=[])
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<Scan {self.id} - {self.status}>"
