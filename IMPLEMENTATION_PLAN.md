# FridgeChef Production-Ready Implementation Plan

**Timeline**: 13 days | **Test Coverage**: 70%+ backend, 60%+ frontend | **Database**: PostgreSQL

---

## Critical Security Issues (MUST FIX IMMEDIATELY)

1. **EXPOSED API KEY**: [REDACTED] in `.env` - REVOKE NOW
2. **Test user bypass**: 4 files allow authentication bypass
3. **CORS open**: `allow_origins=["*"]` allows any origin
4. **Weak SECRET_KEY**: Auto-generated, won't persist
5. **57 print statements** exposing sensitive data
6. **Zero test coverage** - no testing infrastructure

---

## Phase 1: Security Fixes (Days 1-2)

### 1.1 Revoke & Rotate API Key ⚠️ CRITICAL
```bash
# Action Required:
# 1. Go to Google Cloud Console → API & Services → Credentials
# 2. Find and DELETE key: [REDACTED]
# 3. Generate new key with HTTP referrer restrictions
# 4. Update backend/.env with new key
```

**Files to update**:
- `backend/.env` - Add new API key
- `.gitignore` - Ensure `.env` is ignored (already present)
- `backend/.env.example` - Create template without real keys

### 1.2 Fix CORS Configuration
**File**: `backend/app/main.py:26`

**Current** (DANGEROUS):
```python
allow_origins=["*"]  # Allow all origins for development
```

**Fixed**:
```python
allow_origins=settings.allowed_origins_list,  # Use config setting
```

The `settings.allowed_origins_list` already exists in `config.py:42` and defaults to `http://localhost:3000`.

### 1.3 Remove Test User Bypass
**Problem**: Authentication is completely bypassed. The `get_current_user()` function always returns a test user without validating tokens.

**File**: `backend/app/services/auth.py:51-77`

**Current** (INSECURE):
```python
async def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> User:
    """
    Bypass authentication and return a test user.
    """
    test_email = "test@example.com"
    # ... creates test user without checking token
    return user
```

**Fixed**:
```python
async def get_current_user(
    db: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token.credentials)
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception

    return user
```

**Additional files with test user code** (need to check):
- `backend/app/api/v1/endpoints/scans.py`
- `backend/app/api/v1/endpoints/recipes.py`
- `backend/app/api/v1/endpoints/lists.py`

### 1.4 Fix SECRET_KEY Configuration
**File**: `backend/app/config.py:19`

**Current** (INSECURE):
```python
SECRET_KEY: str = secrets.token_hex(32)  # Auto-generate if not provided
```

**Problem**: Generates a new random key every restart, invalidating all existing tokens.

**Fixed**:
```python
SECRET_KEY: str  # Required from environment
```

Add validation after settings creation:
```python
settings = Settings()

# Validate required settings
if not settings.SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set")
if not settings.GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable must be set")
```

### 1.5 Re-enable Auth Redirect
**File**: `frontend/src/lib/api.ts:35`

**Current**:
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token');
  if (typeof window !== 'undefined') {
    // window.location.href = '/login';  // COMMENTED OUT
  }
}
```

**Fixed**:
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('auth_token');
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
```

---

## Phase 2: Code Quality (Days 3-4)

### 2.1 Create Structured Logging Utility
**Create**: `backend/app/utils/logger.py`

```python
import logging
import sys
from pathlib import Path

def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Set up a logger with console and file handlers.

    Args:
        name: Logger name (usually __name__)
        level: Logging level (default: INFO)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)

    # File handler
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    file_handler = logging.FileHandler(log_dir / "app.log")
    file_handler.setLevel(level)

    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger
```

**Also create**: `backend/app/utils/__init__.py` (empty file)

### 2.2 Replace Print Statements with Logging

**Files with print statements** (57 total):

1. **`backend/app/services/Groq.py`** (25 prints)
   - Add at top: `from app.utils.logger import setup_logger`
   - Add: `logger = setup_logger(__name__)`
   - Replace all `print()` → `logger.info()` or `logger.error()`

2. **`backend/app/services/image.py`** (13 prints)
   - Same pattern

3. **`backend/app/api/v1/endpoints/scans.py`** (15 prints)
   - Same pattern

4. **`backend/app/config.py`** (3 prints - lines 50-52)
   - Same pattern

5. **`backend/app/main.py`** (1 print - line 14)
   - Same pattern

### 2.3 Fix TypeScript Types
**Create**: `frontend/src/types/api.ts`

```typescript
// User types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  dietary: string[];
  allergies: string[];
  cuisines: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  max_cook_time: number;
  servings: number;
}

// Scan types
export interface Ingredient {
  name: string;
  quantity: string;
  confidence: number;
}

export interface Scan {
  id: string;
  user_id: string;
  image_path: string;
  ingredients: Ingredient[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// Recipe types
export interface Recipe {
  id: string;
  user_id: string;
  scan_id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine_type: string;
  dietary_info: string[];
  is_favorite: boolean;
  times_made: number;
  created_at: string;
}

// Shopping list types
export interface ShoppingListItem {
  name: string;
  quantity: string;
  checked: boolean;
  category?: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: ShoppingListItem[];
  created_at: string;
  updated_at: string;
}

// API response types
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
```

**Update**: `frontend/src/lib/api.ts`
- Replace all `any` types with proper types from `api.ts`
- Import types: `import type { User, Scan, Recipe, ShoppingList, AuthResponse, Ingredient, ShoppingListItem } from '@/types/api';`

**Current `any` usages** (5 total):
- Line 84: `ingredients: any[]` → `ingredients: Ingredient[]`
- Line 119: `items?: any[]` → `items?: ShoppingListItem[]`
- Line 131: `items: any[]` → `items: ShoppingListItem[]`
- Line 146: `preferences: any` → `preferences: Partial<UserPreferences>`

### 2.4 Improve Frontend Error Handling
**Current**: 14 `console.error()` calls throughout frontend

**Strategy**: Create a toast notification system or use existing UI to show errors to users instead of just logging to console.

**Files to update**:
- All component files with `console.error()` calls
- Add proper error handling with user-facing messages

**Example transformation**:
```typescript
// Before
catch (error) {
  console.error('Error uploading image:', error);
}

// After
catch (error) {
  logger.error('Error uploading image:', error);
  toast.error('Failed to upload image. Please try again.');
}
```

---

## Phase 3: Testing Infrastructure (Days 5-8)

### 3.1 Backend Testing Setup

**Install dependencies**:
```bash
cd backend
pip install pytest pytest-asyncio pytest-cov httpx faker
```

**Create**: `backend/requirements-dev.txt`
```
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
httpx==0.25.2
faker==20.1.0
```

**Create**: `backend/pytest.ini`
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --cov=app
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=70
    -v
```

### 3.2 Backend Test Structure

```
backend/tests/
├── __init__.py
├── conftest.py              # Fixtures (test DB, client, auth)
├── test_auth.py             # Authentication tests (7 tests)
├── test_security.py         # Security tests (5 tests)
├── test_scans.py            # Scan endpoint tests (5 tests)
├── test_recipes.py          # Recipe endpoint tests
├── test_lists.py            # Shopping list tests
└── test_Groq_service.py   # Groq API integration tests
```

### 3.3 Critical Test Cases

**Create**: `backend/tests/conftest.py`
```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.core.security import create_access_token

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    """Create test database."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    """Create test client."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(db):
    """Create authenticated user and return auth headers."""
    from app.services.auth import create_user
    user = create_user(db, "test@example.com", "testpass123", "Test User")
    token = create_access_token({"sub": user.email})
    return {"Authorization": f"Bearer {token}"}
```

**Create**: `backend/tests/test_auth.py`
```python
import pytest
from fastapi import status

def test_register_user_success(client):
    """Test user registration with valid data."""
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepass123",
        "name": "New User"
    })
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@example.com"

def test_register_duplicate_email(client, db):
    """Test registration with duplicate email fails."""
    from app.services.auth import create_user
    create_user(db, "existing@example.com", "pass123")

    response = client.post("/api/v1/auth/register", json={
        "email": "existing@example.com",
        "password": "anotherpass"
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_login_success(client, db):
    """Test login with correct credentials."""
    from app.services.auth import create_user
    create_user(db, "user@example.com", "correctpass")

    response = client.post("/api/v1/auth/login", json={
        "email": "user@example.com",
        "password": "correctpass"
    })
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()

def test_login_wrong_password(client, db):
    """Test login with wrong password fails."""
    from app.services.auth import create_user
    create_user(db, "user@example.com", "correctpass")

    response = client.post("/api/v1/auth/login", json={
        "email": "user@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_protected_endpoint_no_token(client):
    """Test protected endpoint without token returns 401."""
    response = client.get("/api/v1/scans")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_protected_endpoint_invalid_token(client):
    """Test protected endpoint with invalid token returns 401."""
    response = client.get("/api/v1/scans", headers={
        "Authorization": "Bearer invalid_token_xyz"
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_protected_endpoint_valid_token(client, auth_headers):
    """Test protected endpoint with valid token succeeds."""
    response = client.get("/api/v1/scans", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
```

**Create**: `backend/tests/test_security.py`
```python
import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    """Test password is properly hashed."""
    password = "mysecretpassword"
    hashed = get_password_hash(password)

    assert hashed != password
    assert len(hashed) > 50
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)

def test_jwt_token_structure():
    """Test JWT token is valid and contains correct data."""
    email = "test@example.com"
    token = create_access_token({"sub": email})

    assert isinstance(token, str)
    assert len(token) > 20

    payload = decode_access_token(token)
    assert payload["sub"] == email

def test_cors_not_allowing_all_origins():
    """Test CORS is not set to allow all origins."""
    from app.main import app
    cors_middleware = None
    for middleware in app.user_middleware:
        if middleware.cls.__name__ == "CORSMiddleware":
            cors_middleware = middleware
            break

    assert cors_middleware is not None
    # Should NOT be ["*"]
    assert cors_middleware.options["allow_origins"] != ["*"]

def test_api_key_not_in_response(client, auth_headers):
    """Test API keys are not exposed in API responses."""
    response = client.get("/api/v1/scans", headers=auth_headers)
    response_text = response.text.lower()

    assert "api_key" not in response_text
    assert "GROQ_API_KEY" not in response_text
    assert "secret_key" not in response_text

def test_sql_injection_protection(client):
    """Test basic SQL injection attempts are blocked."""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin' OR '1'='1",
        "password": "anything"
    })
    # Should fail authentication, not succeed
    assert response.status_code != status.HTTP_200_OK
```

**Create**: `backend/tests/test_scans.py`
```python
import pytest
from io import BytesIO
from PIL import Image

def create_test_image():
    """Create a test image file."""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_create_scan_success(client, auth_headers):
    """Test creating a scan with valid image."""
    files = {"file": ("test.png", create_test_image(), "image/png")}
    response = client.post("/api/v1/scans", files=files, headers=auth_headers)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "id" in data
    assert "ingredients" in data

def test_create_scan_invalid_file_type(client, auth_headers):
    """Test creating scan with invalid file type fails."""
    files = {"file": ("test.txt", BytesIO(b"not an image"), "text/plain")}
    response = client.post("/api/v1/scans", files=files, headers=auth_headers)

    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_create_scan_oversized_file(client, auth_headers):
    """Test creating scan with oversized file fails."""
    # Create 15MB file (over 10MB limit)
    large_data = b"x" * (15 * 1024 * 1024)
    files = {"file": ("large.png", BytesIO(large_data), "image/png")}
    response = client.post("/api/v1/scans", files=files, headers=auth_headers)

    assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

def test_get_scan_by_id(client, auth_headers):
    """Test retrieving scan by ID."""
    # Create scan first
    files = {"file": ("test.png", create_test_image(), "image/png")}
    create_response = client.post("/api/v1/scans", files=files, headers=auth_headers)
    scan_id = create_response.json()["id"]

    # Get scan
    response = client.get(f"/api/v1/scans/{scan_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["id"] == scan_id

def test_update_scan_ingredients(client, auth_headers):
    """Test updating scan ingredients."""
    # Create scan
    files = {"file": ("test.png", create_test_image(), "image/png")}
    create_response = client.post("/api/v1/scans", files=files, headers=auth_headers)
    scan_id = create_response.json()["id"]

    # Update ingredients
    new_ingredients = [
        {"name": "Tomato", "quantity": "2", "confidence": 0.95},
        {"name": "Onion", "quantity": "1", "confidence": 0.88}
    ]
    response = client.put(f"/api/v1/scans/{scan_id}", json={
        "ingredients": new_ingredients
    }, headers=auth_headers)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()["ingredients"]) == 2
```

### 3.4 Frontend Testing Setup

**Install dependencies**:
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Create**: `frontend/vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60
      },
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/types/**'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**Create**: `frontend/tests/setup.ts`
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

**Test files to create**:
- `frontend/tests/components/Button.test.tsx`
- `frontend/tests/components/Card.test.tsx`
- `frontend/tests/api.test.ts`

---

## Phase 4: Production Infrastructure (Days 9-11)

### 4.1 PostgreSQL Migration

**Install dependencies**:
```bash
pip install psycopg2-binary alembic
```

**Update**: `backend/app/config.py`
```python
# Database - PostgreSQL for production, SQLite for development
DATABASE_URL: str = "sqlite:///./fridgechef.db"

@property
def is_production(self) -> bool:
    """Check if running in production mode."""
    return "postgresql" in self.DATABASE_URL
```

**Update**: `backend/app/database.py`
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Connection pooling for PostgreSQL
if settings.is_production:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=20,
        max_overflow=40,
        pool_pre_ping=True,
        pool_recycle=3600
    )
else:
    # SQLite doesn't support connection pooling
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
```

**Initialize Alembic**:
```bash
cd backend
alembic init alembic
```

**Update**: `backend/alembic.ini`
```ini
# Remove hardcoded sqlalchemy.url, we'll set it from code
# sqlalchemy.url = driver://user:pass@localhost/dbname
```

**Update**: `backend/alembic/env.py`
```python
from app.database import Base
from app.models import user, scan, recipe, shopping_list  # Import all models
from app.config import settings

config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata
```

### 4.2 Rate Limiting

**Install**:
```bash
pip install slowapi
```

**Update**: `backend/app/main.py`
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Create limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

**Apply rate limits to endpoints**:

`backend/app/api/v1/endpoints/auth.py`:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def login(...):
    ...

@router.post("/register")
@limiter.limit("3/minute")
async def register(...):
    ...
```

`backend/app/api/v1/endpoints/scans.py`:
```python
@router.post("/")
@limiter.limit("10/minute")
async def create_scan(...):
    ...
```

`backend/app/api/v1/endpoints/recipes.py`:
```python
@router.post("/generate")
@limiter.limit("15/minute")
async def generate_recipes(...):
    ...
```

### 4.3 Health Check Endpoints

**Create**: `backend/app/api/v1/endpoints/health.py`
```python
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
        "Groq_api": "unknown"
    }

    # Check database
    try:
        db.execute("SELECT 1")
        checks["database"] = "healthy"
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        checks["database"] = "unhealthy"

    # Check Groq API (optional)
    try:
        from app.services.Groq import test_connection
        if test_connection():
            checks["Groq_api"] = "healthy"
        else:
            checks["Groq_api"] = "unhealthy"
    except Exception as e:
        logger.error(f"Groq API check failed: {e}")
        checks["Groq_api"] = "unhealthy"

    overall_status = "healthy" if all(v == "healthy" for v in checks.values()) else "degraded"

    return {
        "status": overall_status,
        "checks": checks,
        "version": "1.0.0"
    }
```

**Register in**: `backend/app/api/v1/router.py`
```python
from app.api.v1.endpoints import health

api_router.include_router(health.router, prefix="/health", tags=["health"])
```

### 4.4 Global Exception Handling

**Create**: `backend/app/middleware/exception_handlers.py`
```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

async def generic_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "error_id": str(id(exc))  # For support tracking
        }
    )

async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database-related exceptions."""
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "Database service is temporarily unavailable. Please try again later."
        }
    )

async def validation_exception_handler(request: Request, exc: ValueError):
    """Handle validation errors."""
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": str(exc)
        }
    )
```

**Register in**: `backend/app/main.py`
```python
from app.middleware.exception_handlers import (
    generic_exception_handler,
    database_exception_handler,
    validation_exception_handler
)
from sqlalchemy.exc import SQLAlchemyError

app.add_exception_handler(Exception, generic_exception_handler)
app.add_exception_handler(SQLAlchemyError, database_exception_handler)
app.add_exception_handler(ValueError, validation_exception_handler)
```

---

## Phase 5: Deployment (Days 12-13)

### 5.1 Docker Configuration

**Create**: `backend/Dockerfile`
```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app && \
    mkdir -p /app/uploads /app/logs && \
    chown -R appuser:appuser /app/uploads /app/logs

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create**: `frontend/Dockerfile`
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["npm", "start"]
```

**Create**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: fridgechef_db
    environment:
      POSTGRES_DB: fridgechef
      POSTGRES_USER: fridgechef
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fridgechef"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fridgechef_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fridgechef_backend
    environment:
      DATABASE_URL: postgresql://fridgechef:${DB_PASSWORD}@db:5432/fridgechef
      SECRET_KEY: ${SECRET_KEY}
      GROQ_API_KEY: ${GROQ_API_KEY}
      ALLOWED_ORIGINS: http://localhost:3000,${FRONTEND_URL}
    ports:
      - "8000:8000"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    depends_on:
      db:
        condition: service_healthy
    networks:
      - fridgechef_network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fridgechef_frontend
    environment:
      NEXT_PUBLIC_API_URL: ${BACKEND_URL:-http://localhost:8000/api/v1}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - fridgechef_network
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local

networks:
  fridgechef_network:
    driver: bridge
```

**Create**: `.env.example` (root level)
```env
# Database
DB_PASSWORD=changeme_secure_password

# Backend
SECRET_KEY=changeme_64_character_secret_key_for_jwt_signing_use_secrets_token_hex
GROQ_API_KEY=your_google_GROQ_API_KEY_here

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
BACKEND_URL=http://backend:8000/api/v1
FRONTEND_URL=http://localhost:3000
```

### 5.2 CI/CD Pipeline

**Create**: `.github/workflows/ci.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    name: Backend Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('backend/requirements.txt') }}

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Run tests with coverage
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
          SECRET_KEY: test_secret_key_for_ci_pipeline_only
          GROQ_API_KEY: test_key
        run: |
          cd backend
          pytest --cov --cov-report=xml --cov-fail-under=70

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
          flags: backend

  frontend-tests:
    name: Frontend Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: frontend/node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('frontend/package-lock.json') }}

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run linter
        run: |
          cd frontend
          npm run lint

      - name: Run tests with coverage
        run: |
          cd frontend
          npm run test:coverage

      - name: Build application
        run: |
          cd frontend
          npm run build

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/lcov.info
          flags: frontend

  docker-build:
    name: Docker Build Test
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build backend image
        run: |
          docker build -t fridgechef-backend:test ./backend

      - name: Build frontend image
        run: |
          docker build -t fridgechef-frontend:test ./frontend

      - name: Test docker-compose
        run: |
          cp .env.example .env
          docker-compose config

  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

**Add to**: `frontend/package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### 5.3 Documentation

**Create**: `README.md`
```markdown
# FridgeChef - Your Personal Recipe Assistant

AI-powered recipe generation based on ingredients you have at home.

## Features

- 📸 Scan fridge contents with your camera
- 🤖 AI-powered ingredient recognition using Groq
- 🍳 Generate personalized recipes based on available ingredients
- ⭐ Save favorite recipes
- 📝 Create shopping lists
- 👤 User preferences for dietary restrictions and cuisines

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Production Deployment

1. Clone the repository
2. Copy environment file: `cp .env.example .env`
3. Update `.env` with your credentials
4. Start services: `docker-compose up -d`
5. Access the app at http://localhost:3000

### Local Development

**Backend**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `.env.example` for all required environment variables.

**Critical**:
- `SECRET_KEY` - JWT signing key (64+ characters)
- `GROQ_API_KEY` - Groq API key
- `DB_PASSWORD` - PostgreSQL password

## Testing

**Backend**:
```bash
cd backend
pytest --cov
```

**Frontend**:
```bash
cd frontend
npm run test:coverage
```

## Security

- All API endpoints require authentication
- Rate limiting enabled
- CORS restricted to specified origins
- Passwords hashed with bcrypt
- JWT tokens for session management

See `SECURITY.md` for more details.

## License

MIT
```

**Create**: `DEPLOYMENT.md`
```markdown
# Deployment Guide

## Production Checklist

### Pre-Deployment

- [ ] Revoke old/exposed API keys
- [ ] Generate strong SECRET_KEY (64+ chars)
- [ ] Set up PostgreSQL database
- [ ] Configure allowed origins for CORS
- [ ] Review rate limiting settings
- [ ] Set up backup strategy
- [ ] Configure monitoring/logging

### Deployment Steps

1. **Prepare Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Database Setup**
   ```bash
   docker-compose up -d db
   docker-compose exec backend alembic upgrade head
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   ```

4. **Verify Health**
   ```bash
   curl http://localhost:8000/api/v1/health/full
   ```

### Cloud Deployment

#### AWS ECS/Fargate

1. Build and push images to ECR
2. Create ECS task definitions
3. Set up Application Load Balancer
4. Configure RDS PostgreSQL instance
5. Set environment variables in ECS

#### Google Cloud Run

1. Build images: `gcloud builds submit`
2. Deploy: `gcloud run deploy fridgechef-backend`
3. Set up Cloud SQL PostgreSQL
4. Configure environment variables

#### Heroku

1. Install Heroku CLI
2. Create apps: `heroku create fridgechef-backend`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql`
4. Deploy: `git push heroku main`

### Post-Deployment

- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check database connections
- [ ] Verify rate limiting works
- [ ] Test authentication flow
- [ ] Set up automated backups

## Monitoring

**Health Checks**:
- `/health` - Basic health
- `/health/db` - Database connectivity
- `/health/full` - Comprehensive check

**Logs**:
- Backend: `docker-compose logs -f backend`
- Database: `docker-compose logs -f db`
- Frontend: `docker-compose logs -f frontend`

**Metrics to Monitor**:
- API response times
- Error rates (4xx, 5xx)
- Database connection pool usage
- Rate limit violations
- Groq API quota usage
```

**Create**: `SECURITY.md`
```markdown
# Security Policy

## Reporting Vulnerabilities

Please report security vulnerabilities to: security@fridgechef.com

## Security Features

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Token expiration (7 days default)
- HTTP-only cookies (recommended for production)

### Rate Limiting
- Login: 5 attempts/minute
- Registration: 3 attempts/minute
- Image upload: 10 uploads/minute
- Recipe generation: 15 requests/minute
- General API: 100 requests/minute

### Input Validation
- File type validation (images only)
- File size limits (10MB max)
- SQL injection protection (SQLAlchemy ORM)
- XSS protection (input sanitization)

### CORS
- Restricted to specified origins
- Credentials allowed only for trusted origins

### API Keys
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Restrict API key usage (HTTP referrers, IP allowlists)

## Best Practices

1. **Keep Dependencies Updated**
   ```bash
   pip list --outdated
   npm outdated
   ```

2. **Regular Security Audits**
   ```bash
   pip install safety
   safety check
   npm audit
   ```

3. **Use HTTPS in Production**
   - Enforce HTTPS redirects
   - Set secure cookie flags
   - HSTS headers

4. **Database Security**
   - Strong passwords
   - Encrypted connections
   - Regular backups
   - Access restrictions

5. **Monitoring**
   - Log authentication failures
   - Alert on rate limit violations
   - Monitor for unusual patterns
```

---

## Verification Checklist

### Security ✓
- [ ] Google API key revoked and regenerated with restrictions
- [ ] SECRET_KEY set in .env (not auto-generated)
- [ ] CORS restricted to `settings.allowed_origins_list`
- [ ] Test user bypass removed from `auth.py`
- [ ] Auth redirect enabled in `api.ts:35`
- [ ] Rate limiting on all critical endpoints
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` created with placeholders

### Code Quality ✓
- [ ] Logger utility created at `backend/app/utils/logger.py`
- [ ] All 57 print statements → `logger.info()` / `logger.error()`
- [ ] All 14 `console.error()` → toast notifications
- [ ] TypeScript types file created at `frontend/src/types/api.ts`
- [ ] All 5 `any` types replaced with proper types
- [ ] No sensitive data in logs

### Testing ✓
- [ ] pytest installed and configured
- [ ] `conftest.py` with fixtures created
- [ ] 7 auth tests written and passing
- [ ] 5 security tests written and passing
- [ ] 5 scan tests written and passing
- [ ] Backend coverage ≥ 70%
- [ ] vitest installed and configured
- [ ] Frontend component tests written
- [ ] Frontend coverage ≥ 60%

### Infrastructure ✓
- [ ] PostgreSQL support added to `config.py`
- [ ] Connection pooling configured in `database.py`
- [ ] Alembic initialized for migrations
- [ ] slowapi rate limiting added
- [ ] Rate limits applied to all endpoints
- [ ] Health check endpoints created (`/health`, `/health/db`, `/health/full`)
- [ ] Global exception handlers registered
- [ ] Structured logging to files

### Deployment ✓
- [ ] `backend/Dockerfile` created
- [ ] `frontend/Dockerfile` created
- [ ] `docker-compose.yml` created
- [ ] `.env.example` documented
- [ ] GitHub Actions CI/CD pipeline configured
- [ ] Backend tests run in CI
- [ ] Frontend tests run in CI
- [ ] Docker builds tested in CI
- [ ] `README.md` complete with quick start
- [ ] `DEPLOYMENT.md` with deployment guide
- [ ] `SECURITY.md` with security policies

---

## Summary Timeline

| Day | Phase | Tasks |
|-----|-------|-------|
| 1 | Security | Revoke API key, fix CORS, remove test bypass |
| 2 | Security | Fix SECRET_KEY, re-enable auth redirect |
| 3 | Code Quality | Logging utility, replace prints |
| 4 | Code Quality | TypeScript types, error handling |
| 5 | Testing | Backend test setup, conftest.py |
| 6 | Testing | Auth & security tests |
| 7 | Testing | Scan & recipe tests |
| 8 | Testing | Frontend tests, coverage verification |
| 9 | Infrastructure | PostgreSQL, Alembic migrations |
| 10 | Infrastructure | Rate limiting, health checks |
| 11 | Infrastructure | Exception handlers, logging |
| 12 | Deployment | Docker files, docker-compose |
| 13 | Deployment | CI/CD pipeline, documentation |

---

## Notes

- **Phases can be parallelized**: Code quality and testing can be worked on simultaneously
- **Test coverage is enforced**: CI pipeline will fail if coverage drops below thresholds
- **Security fixes are blocking**: Phase 1 must be completed before deploying to production
- **Database migration is optional**: Can continue using SQLite for development
- **Rate limits are configurable**: Adjust based on your usage patterns

## Next Steps After Implementation

1. Set up production environment (cloud provider, domain, SSL)
2. Configure monitoring (Sentry, DataDog, CloudWatch)
3. Set up automated backups
4. Create runbooks for common operations
5. Load testing and performance optimization
6. User acceptance testing

