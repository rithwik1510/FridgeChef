from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserPreferences, UserPreferencesUpdate
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/preferences", response_model=UserPreferences)
async def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get user preferences.
    """
    preferences = current_user.preferences or {}

    return UserPreferences(
        dietary=preferences.get("dietary", []),
        allergies=preferences.get("allergies", []),
        cuisines=preferences.get("cuisines", []),
        skill_level=preferences.get("skill_level", "intermediate"),
        max_cook_time=preferences.get("max_cook_time", 60),
        servings=preferences.get("servings", 2)
    )


@router.put("/preferences", response_model=UserPreferences)
async def update_preferences(
    preferences_update: UserPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user preferences.
    """
    current_prefs = current_user.preferences or {}

    # Update with new values (only non-None values)
    update_data = preferences_update.model_dump(exclude_none=True)
    current_prefs.update(update_data)

    # Save to database
    current_user.preferences = current_prefs
    db.commit()
    db.refresh(current_user)

    return UserPreferences(**current_prefs)
