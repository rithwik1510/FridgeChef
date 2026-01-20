from pydantic import BaseModel
from typing import Optional, List


class UserPreferences(BaseModel):
    """Schema for user preferences."""
    dietary: Optional[List[str]] = []
    allergies: Optional[List[str]] = []
    cuisines: Optional[List[str]] = []
    skill_level: Optional[str] = "intermediate"
    max_cook_time: Optional[int] = 60
    servings: Optional[int] = 2


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences."""
    dietary: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    cuisines: Optional[List[str]] = None
    skill_level: Optional[str] = None
    max_cook_time: Optional[int] = None
    servings: Optional[int] = None
