from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check."""
    return {
        "status": "healthy",
        "service": "FridgeChef API",
        "version": "1.0.0"
    }

@router.get("/health/db")
async def database_health_check(db: Session = Depends(get_db)):
    """Database connectivity health check."""
    try:
        # Execute simple query
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }, status.HTTP_503_SERVICE_UNAVAILABLE

@router.get("/health/full")
async def full_health_check(db: Session = Depends(get_db)):
    """Comprehensive health check."""
    checks = {
        "api": "healthy",
        "database": "unknown",
        "gemini_api": "unknown"
    }

    # Check database
    try:
        db.execute("SELECT 1")
        checks["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        checks["database"] = "unhealthy"

    # Check Gemini API (optional)
    try:
        from app.config import settings
        if settings.GOOGLE_API_KEY:
             checks["gemini_api"] = "configured"
        else:
             checks["gemini_api"] = "missing_key"
    except Exception as e:
        logger.error(f"Gemini API check failed: {e}")
        checks["gemini_api"] = "unhealthy"

    overall_status = "healthy" if all(v in ["healthy", "configured"] for v in checks.values()) else "degraded"

    return {
        "status": overall_status,
        "checks": checks,
        "version": "1.0.0"
    }
