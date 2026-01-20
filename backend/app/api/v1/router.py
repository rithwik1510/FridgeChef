from fastapi import APIRouter
from app.api.v1.endpoints import auth, scans, recipes, shopping_lists, user, health

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(scans.router, prefix="/scans", tags=["scans"])
api_router.include_router(recipes.router, prefix="/recipes", tags=["recipes"])
api_router.include_router(shopping_lists.router, prefix="/lists", tags=["shopping_lists"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
