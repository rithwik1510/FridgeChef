from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Get the directory where this config file is located
CONFIG_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = CONFIG_DIR / ".env"


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Database - SQLite by default for easy setup, override for production
    DATABASE_URL: str = "sqlite:///./fridgechef.db"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return "postgresql" in self.DATABASE_URL or "postgres" in self.DATABASE_URL

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days

    # Google AI
    GOOGLE_API_KEY: str

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "heic", "webp"]

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Regex to match FridgeChef Vercel deployment URLs (production + preview)
    CORS_ORIGIN_REGEX: str = r"https://fridgechef(-[a-z0-9]+)?\.vercel\.app"

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
if not settings.GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable must be set")

# Debug logging to verify settings loaded
logger.info(f"ENV file path: {ENV_FILE}")
logger.info(f"ENV file exists: {ENV_FILE.exists()}")
logger.info(f"GOOGLE_API_KEY loaded: {'Yes' if settings.GOOGLE_API_KEY else 'No'}")
db_type = "PostgreSQL" if settings.is_production else "SQLite"
logger.info(f"Database: {db_type}")
