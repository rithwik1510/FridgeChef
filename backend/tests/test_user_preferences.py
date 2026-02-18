import pytest
from fastapi import status


class TestUserPreferencesEndpoints:
    """Tests for user preferences API."""

    def test_get_preferences_unauthenticated(self, client):
        """Test that unauthenticated users cannot access preferences."""
        response = client.get("/api/v1/user/preferences")
        # API returns 403 Forbidden when no valid token is provided
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_default_preferences(self, client, auth_headers):
        """Test getting preferences returns defaults for new user."""
        response = client.get("/api/v1/user/preferences", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["dietary"] == []
        assert data["allergies"] == []
        assert data["cuisines"] == []
        assert data["skill_level"] == "intermediate"
        assert data["max_cook_time"] == 60
        assert data["servings"] == 2

    def test_update_dietary_restrictions(self, client, auth_headers):
        """Test updating dietary restrictions."""
        response = client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"dietary": ["vegetarian", "gluten-free"]}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["dietary"] == ["vegetarian", "gluten-free"]

        # Verify persistence
        get_response = client.get("/api/v1/user/preferences", headers=auth_headers)
        assert get_response.json()["dietary"] == ["vegetarian", "gluten-free"]

    def test_update_allergies(self, client, auth_headers):
        """Test updating allergy list."""
        response = client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"allergies": ["peanuts", "shellfish", "dairy"]}
        )
        assert response.status_code == status.HTTP_200_OK
        assert "peanuts" in response.json()["allergies"]
        assert "shellfish" in response.json()["allergies"]

    def test_update_cuisine_preferences(self, client, auth_headers):
        """Test updating cuisine preferences."""
        response = client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"cuisines": ["italian", "mexican", "japanese"]}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["cuisines"] == ["italian", "mexican", "japanese"]

    def test_update_skill_level(self, client, auth_headers):
        """Test updating cooking skill level."""
        for level in ["beginner", "intermediate", "advanced"]:
            response = client.put(
                "/api/v1/user/preferences",
                headers=auth_headers,
                json={"skill_level": level}
            )
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["skill_level"] == level

    def test_update_max_cook_time(self, client, auth_headers):
        """Test updating maximum cooking time."""
        response = client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"max_cook_time": 30}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["max_cook_time"] == 30

    def test_update_servings(self, client, auth_headers):
        """Test updating default servings."""
        response = client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"servings": 4}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["servings"] == 4

    def test_update_multiple_preferences(self, client, auth_headers):
        """Test updating multiple preferences at once."""
        response = client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={
                "dietary": ["vegan"],
                "allergies": ["nuts"],
                "skill_level": "beginner",
                "max_cook_time": 20,
                "servings": 1
            }
        )
        assert response.status_code == status.HTTP_200_OK

        data = response.json()
        assert data["dietary"] == ["vegan"]
        assert data["allergies"] == ["nuts"]
        assert data["skill_level"] == "beginner"
        assert data["max_cook_time"] == 20
        assert data["servings"] == 1

    def test_partial_update_preserves_other_fields(self, client, auth_headers):
        """Test that partial updates don't clear other fields."""
        # First set some preferences
        client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={
                "dietary": ["keto"],
                "servings": 6
            }
        )

        # Now update only allergies
        client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"allergies": ["soy"]}
        )

        # Verify other fields preserved
        response = client.get("/api/v1/user/preferences", headers=auth_headers)
        data = response.json()
        assert data["dietary"] == ["keto"]
        assert data["servings"] == 6
        assert data["allergies"] == ["soy"]

    def test_empty_arrays_valid(self, client, auth_headers):
        """Test that empty arrays are valid values."""
        # First set some values
        client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"dietary": ["vegetarian"], "allergies": ["peanuts"]}
        )

        # Now clear them
        response = client.put(
            "/api/v1/user/preferences",
            headers=auth_headers,
            json={"dietary": [], "allergies": []}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["dietary"] == []
        assert response.json()["allergies"] == []
