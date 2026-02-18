from datetime import date, datetime

from pydantic import BaseModel

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
    quantity: str | None = "some"
    category: str | None = "Other"
    expiry_date: date | None = None


class PantryItemUpdate(BaseModel):
    """Schema for updating a pantry item."""
    name: str | None = None
    quantity: str | None = None
    category: str | None = None
    expiry_date: date | None = None


class PantryItemResponse(BaseModel):
    """Schema for pantry item response."""
    id: str
    user_id: str
    name: str
    quantity: str
    category: str
    expiry_date: date | None
    added_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class PantryItemBulkCreate(BaseModel):
    """Schema for bulk creating pantry items."""
    items: list[PantryItemCreate]


class PantryResponse(BaseModel):
    """Schema for pantry response with items grouped by category."""
    items: list[PantryItemResponse]
    grouped: dict[str, list[PantryItemResponse]]
    categories: list[str] = PANTRY_CATEGORIES
