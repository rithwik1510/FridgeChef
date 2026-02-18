from fastapi import APIRouter, Depends, status
from sqlalchemy import text
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
        db.execute(text("SELECT 1"))
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
        "groq_api": "unknown"
    }

    # Check database
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        checks["database"] = "unhealthy"

    # Check Groq API (optional)
    try:
        from app.config import settings
        if settings.GROQ_API_KEY:
             checks["groq_api"] = "configured"
        else:
             checks["groq_api"] = "missing_key"
    except Exception as e:
        logger.error(f"Groq API check failed: {e}")
        checks["groq_api"] = "unhealthy"

    overall_status = "healthy" if all(v in ["healthy", "configured"] for v in checks.values()) else "degraded"

    return {
        "status": overall_status,
        "checks": checks,
        "version": "1.0.0"
    }


@router.get("/health/groq")
async def groq_api_test():
    """
    Test if Groq API is actually working.
    Makes a real API call to verify the key is valid.
    """
    from app.config import settings

    result = {
        "api_key_set": bool(settings.GROQ_API_KEY),
        "test_call": "not_attempted",
        "error": None
    }

    if not settings.GROQ_API_KEY:
        result["test_call"] = "skipped"
        result["error"] = "GROQ_API_KEY environment variable is not set"
        return result

    # Try a simple API call
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)

        # Simple test prompt
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Say API working in exactly 2 words."}],
            temperature=0,
            max_tokens=10,
        )
        response_text = (response.choices[0].message.content or "").strip()

        result["test_call"] = "success"
        result["response_preview"] = response_text[:100] if response_text else "empty response"
        logger.info(f"Groq API test successful: {response_text[:50]}")

    except Exception as e:
        result["test_call"] = "failed"
        result["error"] = str(e)
        logger.error(f"Groq API test failed: {e}")

    return result
