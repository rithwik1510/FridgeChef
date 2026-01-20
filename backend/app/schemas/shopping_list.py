from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ShoppingListItem(BaseModel):
    """Schema for shopping list item."""
    name: str
    amount: str
    category: Optional[str] = None
    checked: bool = False


class ShoppingListCreate(BaseModel):
    """Schema for creating shopping list."""
    recipe_id: Optional[str] = None
    name: str
    items: List[dict]


class ShoppingListResponse(BaseModel):
    """Schema for shopping list response."""
    id: str
    user_id: str
    recipe_id: Optional[str]
    name: str
    items: List[dict]
    created_at: datetime

    class Config:
        from_attributes = True


class ShoppingListUpdate(BaseModel):
    """Schema for updating shopping list."""
    items: List[dict]
