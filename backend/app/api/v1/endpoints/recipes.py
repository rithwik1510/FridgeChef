
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pantry import PantryItem
from app.models.recipe import Recipe
from app.models.scan import Scan
from app.models.user import User
from app.schemas.recipe import RecipeGenerate, RecipeResponse
from app.services.auth import get_current_user
from app.services.gemini import generate_recipes

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/generate", response_model=list[RecipeResponse], status_code=status.HTTP_201_CREATED)
@limiter.limit("15/minute")
async def generate_recipes_from_scan(
    request: Request,
    recipe_request: RecipeGenerate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate recipe suggestions from a scan.
    """
    # Get the scan
    scan = db.query(Scan).filter(Scan.id == recipe_request.scan_id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )

    if scan.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this scan"
        )

    if not scan.ingredients:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No ingredients detected in scan"
        )

    # Fetch user's pantry items
    pantry_items = db.query(PantryItem).filter(
        PantryItem.user_id == current_user.id
    ).all()

    # Convert pantry items to ingredient format
    pantry_ingredients = [
        {
            'name': item.name,
            'quantity': item.quantity,
        }
        for item in pantry_items
    ]

    try:
        # Generate recipes using Gemini with both scan and pantry ingredients
        recipes_data = generate_recipes(
            available_ingredients=scan.ingredients,
            preferences=current_user.preferences,
            count=recipe_request.count,
            pantry_ingredients=pantry_ingredients
        )

        # Save recipes to database
        recipes = []
        for recipe_data in recipes_data:
            recipe = Recipe(
                user_id=current_user.id,
                scan_id=scan.id,
                title=recipe_data.get("title", "Untitled Recipe"),
                description=recipe_data.get("description"),
                cook_time=recipe_data.get("cook_time"),
                difficulty=recipe_data.get("difficulty", "medium"),
                servings=recipe_data.get("servings", 2),
                ingredients=recipe_data.get("ingredients", []),
                instructions=recipe_data.get("instructions", []),
                is_favorite=False,
                times_made=0
            )
            db.add(recipe)
            recipes.append(recipe)

        db.commit()

        for recipe in recipes:
            db.refresh(recipe)

        return recipes

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating recipes: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recipes: {str(e)}"
        ) from e


@router.get("", response_model=list[RecipeResponse])
@limiter.limit("60/minute")
async def list_recipes(
    request: Request,
    db: Session = Depends(get_db),
    favorites_only: bool = False,
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """
    List user's saved recipes.
    """
    query = db.query(Recipe).filter(Recipe.user_id == current_user.id)

    if favorites_only:
        query = query.filter(Recipe.is_favorite.is_(True))

    recipes = query.order_by(Recipe.created_at.desc()).offset(offset).limit(limit).all()

    return recipes


@router.get("/{recipe_id}", response_model=RecipeResponse)
@limiter.limit("60/minute")
async def get_recipe(
    request: Request,
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific recipe.
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )

    if recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this recipe"
        )

    return recipe


@router.patch("/{recipe_id}/favorite", response_model=RecipeResponse)
@limiter.limit("30/minute")
async def toggle_favorite(
    request: Request,
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Toggle recipe favorite status.
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )

    if recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this recipe"
        )

    recipe.is_favorite = not recipe.is_favorite
    db.commit()
    db.refresh(recipe)

    return recipe


@router.patch("/{recipe_id}/made", response_model=RecipeResponse)
@limiter.limit("30/minute")
async def increment_times_made(
    request: Request,
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Increment times made counter.
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )

    if recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this recipe"
        )

    recipe.times_made += 1
    db.commit()
    db.refresh(recipe)

    return recipe


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_recipe(
    request: Request,
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a recipe.
    """
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()

    if not recipe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found"
        )

    if recipe.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this recipe"
        )

    db.delete(recipe)
    db.commit()

    return None
