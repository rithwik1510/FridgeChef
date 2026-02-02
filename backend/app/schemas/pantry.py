from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, date


# Pantry categories
PANTRY_CATEGORIES = [
    "Produce",
    "Dairy & Eggs",
    "Meat & Seafood",
    "Pantry Staples",
    "Spices & Seasonings",
    "Condiments & Sauces",
    "Grains & Pasta",
    "Frozen",
    "Beverages",
    "Other"
]


class PantryItemCreate(BaseModel):
    """Schema for creating a pantry item."""
    name: str
    quantity: Optional[str] = "some"
    category: Optional[str] = "Other"
    expiry_date: Optional[date] = None


class PantryItemUpdate(BaseModel):
    """Schema for updating a pantry item."""
    name: Optional[str] = None
    quantity: Optional[str] = None
    category: Optional[str] = None
    expiry_date: Optional[date] = None


class PantryItemResponse(BaseModel):
    """Schema for pantry item response."""
    id: str
    user_id: str
    name: str
    quantity: str
    category: str
    expiry_date: Optional[date]
    added_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PantryItemBulkCreate(BaseModel):
    """Schema for bulk creating pantry items."""
    items: List[PantryItemCreate]


class PantryResponse(BaseModel):
    """Schema for pantry response with items grouped by category."""
    items: List[PantryItemResponse]
    grouped: Dict[str, List[PantryItemResponse]]
    categories: List[str] = PANTRY_CATEGORIES
