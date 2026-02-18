from datetime import datetime

from pydantic import BaseModel


class IngredientDetected(BaseModel):
    """Schema for detected ingredient."""
    name: str
    quantity: str | None = None
    confidence: float | None = None


class ScanCreate(BaseModel):
    """Schema for creating a scan (file upload handled separately)."""
    pass


class ScanResponse(BaseModel):
    """Schema for scan response."""
    id: str
    user_id: str
    image_path: str
    status: str
    ingredients: list[dict]
    created_at: datetime

    class Config:
        from_attributes = True


class ScanUpdate(BaseModel):
    """Schema for updating scan ingredients."""
    ingredients: list[dict]
