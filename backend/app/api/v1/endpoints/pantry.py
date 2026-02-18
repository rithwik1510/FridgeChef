
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.database import get_db
from app.models.pantry import PantryItem
from app.models.user import User
from app.schemas.pantry import (
    PANTRY_CATEGORIES,
    PantryItemBulkCreate,
    PantryItemCreate,
    PantryItemResponse,
    PantryItemUpdate,
    PantryResponse,
)
from app.services.auth import get_current_user
from app.services.categorization import categorize_ingredient

router = APIRouter()





@router.get("", response_model=PantryResponse)
@limiter.limit("60/minute")
async def get_pantry(
    request: Request,
    db: Session = Depends(get_db),
    include_grouped: bool = Query(default=True),
    current_user: User = Depends(get_current_user)
):
    """Get all pantry items for the current user, grouped by category."""
    items = db.query(PantryItem).filter(
        PantryItem.user_id == current_user.id
    ).order_by(PantryItem.category, PantryItem.name).all()

    grouped = {}
    if include_grouped:
        # Build grouped response only when requested to reduce payload size.
        for item in items:
            if item.category not in grouped:
                grouped[item.category] = []
            grouped[item.category].append(item)

    return PantryResponse(
        items=items,
        grouped=grouped,
        categories=PANTRY_CATEGORIES
    )


@router.post("", response_model=PantryItemResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
async def add_pantry_item(
    request: Request,
    item_data: PantryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a single item to the pantry."""
    # Auto-categorize if not provided or is "Other"
    category = item_data.category
    if not category or category == "Other":
        category = categorize_ingredient(item_data.name)

    pantry_item = PantryItem(
        user_id=current_user.id,
        name=item_data.name,
        quantity=item_data.quantity or "some",
        category=category,
        expiry_date=item_data.expiry_date
    )

    db.add(pantry_item)
    db.commit()
    db.refresh(pantry_item)

    return pantry_item


@router.post("/bulk", response_model=list[PantryItemResponse], status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def add_pantry_items_bulk(
    request: Request,
    bulk_data: PantryItemBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add multiple items to the pantry (e.g., from a scan)."""
    created_items = []

    for item_data in bulk_data.items:
        # Auto-categorize if not provided or is "Other"
        category = item_data.category
        if not category or category == "Other":
            category = categorize_ingredient(item_data.name)

        pantry_item = PantryItem(
            user_id=current_user.id,
            name=item_data.name,
            quantity=item_data.quantity or "some",
            category=category,
            expiry_date=item_data.expiry_date
        )

        db.add(pantry_item)
        created_items.append(pantry_item)

    db.commit()

    # Refresh all items to get their IDs
    for item in created_items:
        db.refresh(item)

    return created_items


@router.put("/{item_id}", response_model=PantryItemResponse)
@limiter.limit("30/minute")
async def update_pantry_item(
    request: Request,
    item_id: str,
    item_update: PantryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a pantry item."""
    pantry_item = db.query(PantryItem).filter(PantryItem.id == item_id).first()

    if not pantry_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pantry item not found"
        )

    if pantry_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this item"
        )

    # Update fields if provided
    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pantry_item, field, value)

    db.commit()
    db.refresh(pantry_item)

    return pantry_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_pantry_item(
    request: Request,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a pantry item."""
    pantry_item = db.query(PantryItem).filter(PantryItem.id == item_id).first()

    if not pantry_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pantry item not found"
        )

    if pantry_item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this item"
        )

    db.delete(pantry_item)
    db.commit()

    return None


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("5/minute")
async def clear_pantry(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear all items from the pantry."""
    db.query(PantryItem).filter(
        PantryItem.user_id == current_user.id
    ).delete()

    db.commit()

    return None
