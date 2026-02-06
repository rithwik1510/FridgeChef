import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.config import settings
from app.database import Base, engine

# Import all models to ensure tables are created
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Create database tables automatically in development only.
# In production, use Alembic migrations: alembic upgrade head
if not settings.is_production:
    Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
logger.info(f"Uploads directory: {os.path.abspath(settings.UPLOAD_DIR)}")

# Create FastAPI app
app = FastAPI(
    title="FridgeChef API",
    description="Backend API for FridgeChef - Your personal recipe assistant",
    version="1.3.0"
)

# Rate limiter (shared singleton)
from app.core.limiter import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from sqlalchemy.exc import SQLAlchemyError

from app.middleware.exception_handlers import (
    database_exception_handler,
    generic_exception_handler,
    validation_exception_handler,
)
from app.middleware.logging import RequestLoggingMiddleware, SecurityHeadersMiddleware

app.add_exception_handler(Exception, generic_exception_handler)
app.add_exception_handler(SQLAlchemyError, database_exception_handler)
app.add_exception_handler(ValueError, validation_exception_handler)

# CORS middleware
# Using explicit allowed origins is required for allow_credentials=True
# which is needed for authenticated requests (even with Bearer tokens in some contexts)
logger.info(f"Configuring CORS with allowed origins: {settings.allowed_origins_list}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Mount uploads directory for serving images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to FridgeChef API",
        "docs": "/docs",
        "version": "1.3.0"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
