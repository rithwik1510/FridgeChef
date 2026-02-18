from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Get the directory where this config file is located
CONFIG_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = CONFIG_DIR / ".env"


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Database - required, use a PostgreSQL URL (Supabase/Render/etc.)
    DATABASE_URL: str

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return "postgresql" in self.DATABASE_URL or "postgres" in self.DATABASE_URL

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days

    # AI Provider
    GROQ_API_KEY: str = ""

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "heic", "webp"]

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Allow local dev on any port and FridgeChef Vercel deployment URLs.
    CORS_ORIGIN_REGEX: str = (
        r"^(https://fridgechef(-[a-z0-9]+)?\.vercel\.app|"
        r"http://localhost(:\d+)?|http://127\.0\.0\.1(:\d+)?)$"
    )

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        """Convert comma-separated origins to list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


settings = Settings()

# Validate required settings
if not settings.SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set")
if not settings.GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable must be set")
if not settings.DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable must be set")
if not settings.is_production:
    raise ValueError("DATABASE_URL must be a PostgreSQL connection string")

# Debug logging to verify settings loaded
logger.info(f"ENV file path: {ENV_FILE}")
logger.info(f"ENV file exists: {ENV_FILE.exists()}")
logger.info(f"GROQ_API_KEY loaded: {'Yes' if settings.GROQ_API_KEY else 'No'}")
logger.info("Database: PostgreSQL")
