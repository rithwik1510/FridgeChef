
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.database import get_db
from app.models.recipe import Recipe
from app.models.shopping_list import ShoppingList
from app.models.user import User
from app.schemas.shopping_list import ShoppingListCreate, ShoppingListResponse, ShoppingListUpdate
from app.services.auth import get_current_user
from app.services.categorization import categorize_ingredient

router = APIRouter()


@router.post("", response_model=ShoppingListResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def create_shopping_list(
    request: Request,
    list_data: ShoppingListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a shopping list.
    If recipe_id is provided, creates list from missing ingredients.
    """
    items = list_data.items

    # If recipe_id is provided, extract missing ingredients
    if list_data.recipe_id:
        recipe = db.query(Recipe).filter(Recipe.id == list_data.recipe_id).first()

        if not recipe:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipe not found"
            )

        if recipe.user_id != current_user.id:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this recipe"
            )

        # Extract missing ingredients (where available = False)
        missing_ingredients = [
            {
                "name": ing["name"],
                "amount": ing["amount"],
                "category": categorize_ingredient(ing["name"]),
                "checked": False
            }
            for ing in recipe.ingredients
            if not ing.get("available", False)
        ]

        items = missing_ingredients

    # Create shopping list
    shopping_list = ShoppingList(
        user_id=current_user.id,
        recipe_id=list_data.recipe_id,
        name=list_data.name,
        items=items
    )

    db.add(shopping_list)
    db.commit()
    db.refresh(shopping_list)

    return shopping_list


@router.get("", response_model=list[ShoppingListResponse])
@limiter.limit("60/minute")
async def list_shopping_lists(
    request: Request,
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """
    List user's shopping lists.
    """
    lists = db.query(ShoppingList).filter(
        ShoppingList.user_id == current_user.id
    ).order_by(
        ShoppingList.created_at.desc()
    ).offset(offset).limit(limit).all()

    return lists


@router.get("/{list_id}", response_model=ShoppingListResponse)
@limiter.limit("60/minute")
async def get_shopping_list(
    request: Request,
    list_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific shopping list.
    """
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()

    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list not found"
        )

    if shopping_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this list"
        )

    return shopping_list


@router.patch("/{list_id}", response_model=ShoppingListResponse)
@limiter.limit("30/minute")
async def update_shopping_list(
    request: Request,
    list_id: str,
    list_update: ShoppingListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update shopping list items (check/uncheck).
    """
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()

    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list not found"
        )

    if shopping_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this list"
        )

    # Update items
    shopping_list.items = list_update.items
    db.commit()
    db.refresh(shopping_list)

    return shopping_list


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("20/minute")
async def delete_shopping_list(
    request: Request,
    list_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a shopping list.
    """
    shopping_list = db.query(ShoppingList).filter(ShoppingList.id == list_id).first()

    if not shopping_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopping list not found"
        )

    if shopping_list.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this list"
        )

    db.delete(shopping_list)
    db.commit()

    return None



