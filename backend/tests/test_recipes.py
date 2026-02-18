import pytest
from fastapi import status
from unittest.mock import patch

def test_generate_recipes_success(client, auth_headers):
    """Test generating recipes from a valid scan."""
    # 1. Create a scan first (mocking Groq image detection)
    # Patch where it is imported in the endpoint module
    with patch("app.api.v1.endpoints.scans.detect_ingredients_from_image") as mock_detect:
        mock_detect.return_value = [{"name": "Chicken", "quantity": "200g", "confidence": 0.9}]
        
        from io import BytesIO
        from PIL import Image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        files = {"file": ("test.png", img_bytes, "image/png")}
        scan_response = client.post("/api/v1/scans", files=files, headers=auth_headers)
        scan_id = scan_response.json()["id"]

    # 2. Mock Groq recipe generation
    # Patch where it is imported in the endpoint module
    with patch("app.api.v1.endpoints.recipes.generate_recipes") as mock_gen:
        mock_gen.return_value = [
            {
                "title": "Test Recipe",
                "description": "Tasty test",
                "cook_time": 30,
                "difficulty": "easy",
                "servings": 2,
                "ingredients": [],
                "instructions": ["Step 1"]
            }
        ]

        response = client.post("/api/v1/recipes/generate", json={
            "scan_id": scan_id,
            "count": 1
        }, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == "Test Recipe"

def test_list_recipes(client, auth_headers):
    """Test listing user recipes."""
    response = client.get("/api/v1/recipes", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)

def test_list_recipes_uses_lightweight_payload(client, auth_headers):
    """List endpoint should omit heavy instruction arrays for faster loading."""
    with patch("app.api.v1.endpoints.scans.detect_ingredients_from_image") as mock_detect:
        mock_detect.return_value = [{"name": "Tomato", "quantity": "2", "confidence": 0.9}]

        from io import BytesIO
        from PIL import Image
        img = Image.new('RGB', (100, 100), color='green')
        img_bytes = BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)

        files = {"file": ("test.png", img_bytes, "image/png")}
        scan_response = client.post("/api/v1/scans", files=files, headers=auth_headers)
        scan_id = scan_response.json()["id"]

    with patch("app.api.v1.endpoints.recipes.generate_recipes") as mock_gen:
        mock_gen.return_value = [
            {
                "title": "Quick Tomato Pasta",
                "description": "Simple weeknight pasta",
                "cook_time": 20,
                "difficulty": "easy",
                "servings": 2,
                "ingredients": [{"name": "Tomato", "amount": "2", "available": True}],
                "instructions": ["Boil pasta", "Add sauce", "Serve"]
            }
        ]

        create_response = client.post(
            "/api/v1/recipes/generate",
            json={"scan_id": scan_id, "count": 1},
            headers=auth_headers
        )
        assert create_response.status_code == status.HTTP_201_CREATED

    list_response = client.get("/api/v1/recipes", headers=auth_headers)
    assert list_response.status_code == status.HTTP_200_OK
    data = list_response.json()
    assert len(data) >= 1
    assert "instructions" not in data[0]
    assert "ingredients" in data[0]

def test_get_recipe_not_found(client, auth_headers):
    """Test getting a non-existent recipe."""
    response = client.get("/api/v1/recipes/non-existent-id", headers=auth_headers)
    assert response.status_code == status.HTTP_404_NOT_FOUND
