from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.api.v1.router import api_router
from app.database import Base, engine
from app.utils.logger import setup_logger
import os

logger = setup_logger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
logger.info(f"Uploads directory: {os.path.abspath(settings.UPLOAD_DIR)}")

# Create FastAPI app
app = FastAPI(
    title="FridgeChef API",
    description="Backend API for FridgeChef - Your personal recipe assistant",
    version="1.2.0"
)

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from app.middleware.exception_handlers import (
    generic_exception_handler,
    database_exception_handler,
    validation_exception_handler
)
from sqlalchemy.exc import SQLAlchemyError

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
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
