import uuid

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Recipe(Base):
    """Recipe model for generated and saved recipes."""

    __tablename__ = "recipes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="SET NULL"), index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    cook_time = Column(Integer)  # in minutes
    difficulty = Column(String(50))  # easy, medium, hard
    servings = Column(Integer)
    ingredients = Column(JSON, nullable=False)
    instructions = Column(JSON, nullable=False)
    is_favorite = Column(Boolean, default=False)
    times_made = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<Recipe {self.title}>"
