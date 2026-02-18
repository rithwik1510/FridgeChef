from datetime import datetime

from pydantic import BaseModel, Field


class RecipeIngredient(BaseModel):
    """Schema for recipe ingredient."""
    name: str
    amount: str
    available: bool = False


class RecipeGenerate(BaseModel):
    """Schema for generating recipes from scan."""
    scan_id: str
    count: int = Field(default=3, ge=1, le=10)


class RecipeResponse(BaseModel):
    """Schema for recipe response."""
    id: str
    user_id: str | None
    scan_id: str | None
    title: str
    description: str | None
    cook_time: int | None
    difficulty: str | None
    servings: int | None
    ingredients: list[dict]
    instructions: list[str]
    is_favorite: bool
    times_made: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeListResponse(BaseModel):
    """Schema for recipe list response (without heavy instruction text)."""
    id: str
    user_id: str | None
    scan_id: str | None
    title: str
    description: str | None
    cook_time: int | None
    difficulty: str | None
    servings: int | None
    ingredients: list[dict]
    is_favorite: bool
    times_made: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecipeUpdate(BaseModel):
    """Schema for updating recipe."""
    is_favorite: bool | None = None
    times_made: int | None = None
