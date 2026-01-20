from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class RecipeIngredient(BaseModel):
    """Schema for recipe ingredient."""
    name: str
    amount: str
    available: bool = False


class RecipeGenerate(BaseModel):
    """Schema for generating recipes from scan."""
    scan_id: str
    count: int = 3


class RecipeResponse(BaseModel):
    """Schema for recipe response."""
    id: str
    user_id: Optional[str]
    scan_id: Optional[str]
    title: str
    description: Optional[str]
    cook_time: Optional[int]
    difficulty: Optional[str]
    servings: Optional[int]
    ingredients: List[dict]
    instructions: List[str]
    is_favorite: bool
    times_made: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeUpdate(BaseModel):
    """Schema for updating recipe."""
    is_favorite: Optional[bool] = None
    times_made: Optional[int] = None
