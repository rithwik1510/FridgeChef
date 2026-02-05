from datetime import datetime

from pydantic import BaseModel


class ShoppingListItem(BaseModel):
    """Schema for shopping list item."""
    name: str
    amount: str
    category: str | None = None
    checked: bool = False


class ShoppingListCreate(BaseModel):
    """Schema for creating shopping list."""
    recipe_id: str | None = None
    name: str
    items: list[dict]


class ShoppingListResponse(BaseModel):
    """Schema for shopping list response."""
    id: str
    user_id: str
    recipe_id: str | None
    name: str
    items: list[dict]
    created_at: datetime

    class Config:
        from_attributes = True


class ShoppingListUpdate(BaseModel):
    """Schema for updating shopping list."""
    items: list[dict]
