import uuid

from sqlalchemy import JSON, Column, DateTime, ForeignKey, String
from sqlalchemy.sql import func

from app.database import Base


class ShoppingList(Base):
    """Shopping list model for missing ingredients."""

    __tablename__ = "shopping_lists"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recipe_id = Column(String(36), ForeignKey("recipes.id", ondelete="SET NULL"), index=True)
    name = Column(String(200), nullable=False)
    items = Column(JSON, default=[])
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<ShoppingList {self.name}>"
