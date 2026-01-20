import pytest
from fastapi import status

def test_register_user_success(client):
    """Test user registration with valid data."""
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepass123",
        "name": "New User"
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    # The endpoint only returns the token, not the user object
    assert data["token_type"] == "bearer"

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
    """Test protected endpoint without token returns 403."""
    response = client.get("/api/v1/scans")
    assert response.status_code == status.HTTP_403_FORBIDDEN

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
