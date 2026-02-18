import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session, load_only

from app.core.limiter import limiter
from app.database import get_db
from app.models.pantry import PantryItem
from app.models.recipe import Recipe
from app.models.scan import Scan
from app.models.user import User
from app.schemas.recipe import RecipeGenerate, RecipeListResponse, RecipeResponse
from app.services.auth import get_current_user
from app.services.groq_service import generate_recipes
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter()


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
    pantry_items = (
        db.query(PantryItem)
        .options(load_only(PantryItem.name, PantryItem.quantity))
        .filter(PantryItem.user_id == current_user.id)
        .all()
    )

    # Convert pantry items to ingredient format
    pantry_ingredients = [
        {
            'name': item.name,
            'quantity': item.quantity,
        }
        for item in pantry_items
    ]

    try:
        # Generate recipes using Gemini (run in thread to avoid blocking event loop)
        recipes_data = await asyncio.to_thread(
            generate_recipes,
            available_ingredients=scan.ingredients,
            preferences=current_user.preferences,
            count=recipe_request.count,
            pantry_ingredients=pantry_ingredients,
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
        logger.error(f"Error generating recipes: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recipes: {str(e)}"
        ) from e


@router.get("", response_model=list[RecipeListResponse])
@limiter.limit("60/minute")
async def list_recipes(
    request: Request,
    db: Session = Depends(get_db),
    favorites_only: bool = False,
    search: str | None = Query(default=None, max_length=200),
    difficulty: str | None = Query(default=None, pattern="^(easy|medium|hard)$"),
    max_cook_time: int | None = Query(default=None, ge=1, le=1440),
    sort_by: str = Query(default="created_at", pattern="^(created_at|cook_time|times_made|title)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user)
):
    """
    List user's saved recipes with optional search, filtering, and sorting.
    """
    query = (
        db.query(Recipe)
        .options(
            load_only(
                Recipe.id,
                Recipe.user_id,
                Recipe.scan_id,
                Recipe.title,
                Recipe.description,
                Recipe.cook_time,
                Recipe.difficulty,
                Recipe.servings,
                Recipe.ingredients,
                Recipe.is_favorite,
                Recipe.times_made,
                Recipe.created_at,
            )
        )
        .filter(Recipe.user_id == current_user.id)
    )

    if favorites_only:
        query = query.filter(Recipe.is_favorite.is_(True))

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Recipe.title.ilike(search_term)) | (Recipe.description.ilike(search_term))
        )

    if difficulty:
        query = query.filter(Recipe.difficulty == difficulty)

    if max_cook_time is not None:
        query = query.filter(Recipe.cook_time <= max_cook_time)

    # Sorting
    sort_column = getattr(Recipe, sort_by, Recipe.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    recipes = query.offset(offset).limit(limit).all()

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
