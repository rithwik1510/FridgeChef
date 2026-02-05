from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, pantry, recipes, scans, shopping_lists, user

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(shopping_lists.router, prefix="/lists", tags=["shopping_lists"])
api_router.include_router(pantry.router, prefix="/pantry", tags=["pantry"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
