from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.user import User
from app.models.pantry import PantryItem
from app.schemas.pantry import (
    PantryItemCreate,
    PantryItemUpdate,
    PantryItemResponse,
    PantryItemBulkCreate,
    PantryResponse,
    PANTRY_CATEGORIES
)
from app.services.auth import get_current_user

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def categorize_ingredient(name: str) -> str:
    """Categorize an ingredient based on its name."""
    name_lower = name.lower()

    # Produce
    produce = ["lettuce", "tomato", "onion", "garlic", "pepper", "carrot", "celery", "spinach",
               "broccoli", "cauliflower", "cucumber", "zucchini", "potato", "apple", "banana",
               "lemon", "lime", "orange", "berry", "herb", "cilantro", "parsley", "basil",
               "mushroom", "cabbage", "kale", "avocado", "ginger", "corn", "peas", "beans",
               "eggplant", "squash", "radish", "beet", "turnip", "asparagus", "artichoke"]
    if any(item in name_lower for item in produce):
        return "Produce"

    # Dairy & Eggs
    dairy = ["milk", "cheese", "yogurt", "butter", "cream", "egg", "sour cream", "cottage",
             "cheddar", "mozzarella", "parmesan", "ricotta", "feta"]
    if any(item in name_lower for item in dairy):
        return "Dairy & Eggs"

    # Meat & Seafood
    meat = ["chicken", "beef", "pork", "fish", "salmon", "turkey", "bacon", "sausage", "meat",
            "shrimp", "prawn", "tuna", "cod", "lamb", "duck", "ham", "steak", "ground", "crab",
            "lobster", "scallop", "mussel", "clam", "anchovy"]
    if any(item in name_lower for item in meat):
        return "Meat & Seafood"

    # Spices & Seasonings
    spices = ["cumin", "paprika", "oregano", "thyme", "rosemary", "cinnamon", "nutmeg",
              "turmeric", "coriander", "cayenne", "chili", "bay leaf", "sage", "dill",
              "mint", "clove", "cardamom", "fennel", "mustard seed", "pepper flake"]
    if any(item in name_lower for item in spices):
        return "Spices & Seasonings"

    # Condiments & Sauces
    condiments = ["ketchup", "mustard", "mayonnaise", "soy sauce", "hot sauce", "salsa",
                  "bbq sauce", "worcestershire", "teriyaki", "sriracha", "tahini",
                  "hoisin", "fish sauce", "oyster sauce", "honey", "maple syrup", "jam",
                  "jelly", "peanut butter", "nutella", "ranch", "dressing"]
    if any(item in name_lower for item in condiments):
        return "Condiments & Sauces"

    # Grains & Pasta
    grains = ["rice", "pasta", "noodle", "bread", "flour", "oat", "quinoa", "couscous",
              "barley", "bulgur", "cereal", "tortilla", "pita", "bagel", "roll", "bun",
              "cracker", "breadcrumb"]
    if any(item in name_lower for item in grains):
        return "Grains & Pasta"

    # Frozen
    frozen = ["frozen", "ice cream", "popsicle", "ice"]
    if any(item in name_lower for item in frozen):
        return "Frozen"

    # Beverages
    beverages = ["juice", "soda", "coffee", "tea", "water", "wine", "beer", "milk",
                 "smoothie", "lemonade", "cola"]
    if any(item in name_lower for item in beverages):
        return "Beverages"

    # Pantry Staples
    pantry = ["sugar", "salt", "oil", "vinegar", "stock", "broth", "can", "bean", "lentil",
              "chickpea", "coconut milk", "tomato paste", "tomato sauce", "olive oil",
              "vegetable oil", "sesame oil", "cornstarch", "baking", "yeast", "vanilla",
              "cocoa", "chocolate", "nut", "almond", "walnut", "cashew", "seed"]
    if any(item in name_lower for item in pantry):
        return "Pantry Staples"

    return "Other"


@router.get("", response_model=PantryResponse)
@limiter.limit("60/minute")
async def get_pantry(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pantry items for the current user, grouped by category."""
    items = db.query(PantryItem).filter(
        PantryItem.user_id == current_user.id
    ).order_by(PantryItem.category, PantryItem.name).all()

    # Group items by category
    grouped = {}
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


@router.post("/bulk", response_model=List[PantryItemResponse], status_code=status.HTTP_201_CREATED)
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
