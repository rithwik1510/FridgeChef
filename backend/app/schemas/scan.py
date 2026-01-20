from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class IngredientDetected(BaseModel):
    """Schema for detected ingredient."""
    name: str
    quantity: Optional[str] = None
    confidence: Optional[float] = None


class ScanCreate(BaseModel):
    """Schema for creating a scan (file upload handled separately)."""
    pass


class ScanResponse(BaseModel):
    """Schema for scan response."""
    id: str
    user_id: str
    image_path: str
    status: str
    ingredients: List[dict]
    created_at: datetime

    class Config:
        from_attributes = True


class ScanUpdate(BaseModel):
    """Schema for updating scan ingredients."""
    ingredients: List[dict]
