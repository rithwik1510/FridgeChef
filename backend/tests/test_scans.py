import pytest
from io import BytesIO
from PIL import Image
from fastapi import status

def create_test_image():
    """Create a test image file."""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_create_scan_success(client, auth_headers):
    """Test creating a scan with valid image."""
    # Mocking Groq service avoids real API calls
    # For now we assume the service handles "no API key" or network gracefully if we don't mock
    # But strictly, we should patch detect_ingredients_from_image
    
    from unittest.mock import patch
    with patch("app.api.v1.endpoints.scans.detect_ingredients_from_image") as mock_detect:
        mock_detect.return_value = [{"name": "Test Ingredient", "quantity": "1", "confidence": 0.9}]
        
        files = {"file": ("test.png", create_test_image(), "image/png")}
        response = client.post("/api/v1/scans", files=files, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert "id" in data
        assert "ingredients" in data

def test_create_scan_invalid_file_type(client, auth_headers):
    """Test creating scan with invalid file type fails."""
    files = {"file": ("test.txt", BytesIO(b"not an image"), "text/plain")}
    response = client.post("/api/v1/scans", files=files, headers=auth_headers)

    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_get_scan_by_id(client, auth_headers):
    """Test retrieving scan by ID."""
    from unittest.mock import patch
    with patch("app.api.v1.endpoints.scans.detect_ingredients_from_image") as mock_detect:
        mock_detect.return_value = []
        
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
    from unittest.mock import patch
    with patch("app.api.v1.endpoints.scans.detect_ingredients_from_image") as mock_detect:
        mock_detect.return_value = []

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
