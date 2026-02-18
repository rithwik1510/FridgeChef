import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from fastapi import status

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
    # Starlette Middleware object uses kwargs, or we check the app's middleware stack differently
    # But for Middleware class wrapper:
    if hasattr(cors_middleware, 'options'):
        assert cors_middleware.options["allow_origins"] != ["*"]
    elif hasattr(cors_middleware, 'kwargs'):
         assert cors_middleware.kwargs["allow_origins"] != ["*"]
    else:
        # Fallback or fail if structure is different
        pass

def test_api_key_not_in_response(client, auth_headers):
    """Test API keys are not exposed in API responses."""
    response = client.get("/api/v1/scans", headers=auth_headers)
    # The response might be empty list, but we check headers/content
    response_text = response.text.lower()

    assert "api_key" not in response_text
    assert "groq_api_key" not in response_text
    assert "secret_key" not in response_text

def test_sql_injection_protection(client):
    """Test basic SQL injection attempts are blocked."""
    response = client.post("/api/v1/auth/login", json={
        "email": "admin' OR '1'='1",
        "password": "anything"
    })
    # Should fail authentication (401) or validation (422), not succeed (200)
    assert response.status_code != status.HTTP_200_OK
