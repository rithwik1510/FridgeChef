
from pydantic import BaseModel


class UserPreferences(BaseModel):
    """Schema for user preferences."""
    dietary: list[str] | None = []
    allergies: list[str] | None = []
    cuisines: list[str] | None = []
    skill_level: str | None = "intermediate"
    max_cook_time: int | None = 60
    servings: int | None = 2


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences."""
    dietary: list[str] | None = None
    allergies: list[str] | None = None
    cuisines: list[str] | None = None
    skill_level: str | None = None
    max_cook_time: int | None = None
    servings: int | None = None
