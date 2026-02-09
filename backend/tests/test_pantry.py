import pytest
from fastapi import status


class TestPantryEndpoints:
    """Tests for pantry CRUD operations."""

    def test_get_pantry_unauthenticated(self, client):
        """Test that unauthenticated users cannot access pantry."""
        response = client.get("/api/v1/pantry")
        # API returns 403 Forbidden when no valid token is provided
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_empty_pantry(self, client, auth_headers):
        """Test getting pantry when empty."""
        response = client.get("/api/v1/pantry", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["items"] == []
        assert isinstance(data["categories"], list)

    def test_get_pantry_without_grouped_payload(self, client, auth_headers):
        """Test requesting pantry response without grouped data for smaller payloads."""
        client.post(
            "/api/v1/pantry",
            headers=auth_headers,
            json={"name": "Tomato", "quantity": "3"}
        )

        response = client.get("/api/v1/pantry?include_grouped=false", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 1
        assert data["grouped"] == {}
        assert isinstance(data["categories"], list)

    def test_add_pantry_item(self, client, auth_headers):
        """Test adding a single item to pantry."""
        response = client.post(
            "/api/v1/pantry",
            headers=auth_headers,
            json={"name": "Chicken breast", "quantity": "2 lbs"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "Chicken breast"
        assert data["quantity"] == "2 lbs"
        assert data["category"] == "Meat & Seafood"  # Auto-categorized

    def test_add_pantry_item_auto_category(self, client, auth_headers):
        """Test that items are auto-categorized correctly."""
        items_and_categories = [
            ({"name": "Milk", "quantity": "1 gallon"}, "Dairy & Eggs"),
            ({"name": "Broccoli", "quantity": "2 heads"}, "Produce"),
            ({"name": "Pasta", "quantity": "1 box"}, "Grains & Pasta"),
        ]

        for item_data, expected_category in items_and_categories:
            response = client.post(
                "/api/v1/pantry",
                headers=auth_headers,
                json=item_data
            )
            assert response.status_code == status.HTTP_201_CREATED
            assert response.json()["category"] == expected_category

    def test_add_pantry_item_with_custom_category(self, client, auth_headers):
        """Test adding item with explicit category."""
        response = client.post(
            "/api/v1/pantry",
            headers=auth_headers,
            json={"name": "Mystery item", "quantity": "1", "category": "Special Items"}
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["category"] == "Special Items"

    def test_add_pantry_items_bulk(self, client, auth_headers):
        """Test adding multiple items at once."""
        response = client.post(
            "/api/v1/pantry/bulk",
            headers=auth_headers,
            json={
                "items": [
                    {"name": "Apples", "quantity": "6"},
                    {"name": "Oranges", "quantity": "4"},
                    {"name": "Bananas", "quantity": "3"}
                ]
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data) == 3
        assert all(item["category"] == "Produce" for item in data)

    def test_update_pantry_item(self, client, auth_headers):
        """Test updating a pantry item."""
        # First create an item
        create_response = client.post(
            "/api/v1/pantry",
            headers=auth_headers,
            json={"name": "Eggs", "quantity": "6"}
        )
        item_id = create_response.json()["id"]

        # Update the item
        update_response = client.put(
            f"/api/v1/pantry/{item_id}",
            headers=auth_headers,
            json={"quantity": "12"}
        )
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.json()["quantity"] == "12"
        assert update_response.json()["name"] == "Eggs"  # Name unchanged

    def test_update_nonexistent_item(self, client, auth_headers):
        """Test updating item that doesn't exist."""
        response = client.put(
            "/api/v1/pantry/nonexistent-id",
            headers=auth_headers,
            json={"quantity": "1"}
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_pantry_item(self, client, auth_headers):
        """Test deleting a pantry item."""
        # First create an item
        create_response = client.post(
            "/api/v1/pantry",
            headers=auth_headers,
            json={"name": "Butter", "quantity": "1 stick"}
        )
        item_id = create_response.json()["id"]

        # Delete the item
        delete_response = client.delete(
            f"/api/v1/pantry/{item_id}",
            headers=auth_headers
        )
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

        # Verify it's gone
        pantry_response = client.get("/api/v1/pantry", headers=auth_headers)
        items = pantry_response.json()["items"]
        assert not any(item["id"] == item_id for item in items)

    def test_delete_nonexistent_item(self, client, auth_headers):
        """Test deleting item that doesn't exist."""
        response = client.delete(
            "/api/v1/pantry/nonexistent-id",
            headers=auth_headers
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_clear_pantry(self, client, auth_headers):
        """Test clearing all pantry items."""
        # Add some items first
        client.post(
            "/api/v1/pantry/bulk",
            headers=auth_headers,
            json={
                "items": [
                    {"name": "Item 1", "quantity": "1"},
                    {"name": "Item 2", "quantity": "1"},
                ]
            }
        )

        # Clear pantry
        clear_response = client.delete("/api/v1/pantry", headers=auth_headers)
        assert clear_response.status_code == status.HTTP_204_NO_CONTENT

        # Verify empty
        pantry_response = client.get("/api/v1/pantry", headers=auth_headers)
        assert pantry_response.json()["items"] == []

    def test_pantry_items_grouped_by_category(self, client, auth_headers):
        """Test that pantry items are correctly grouped."""
        # Add items from different categories
        client.post(
            "/api/v1/pantry/bulk",
            headers=auth_headers,
            json={
                "items": [
                    {"name": "Milk", "quantity": "1"},
                    {"name": "Cheese", "quantity": "1"},
                    {"name": "Apple", "quantity": "3"},
                ]
            }
        )

        response = client.get("/api/v1/pantry", headers=auth_headers)
        data = response.json()

        assert "grouped" in data
        assert "Dairy & Eggs" in data["grouped"]
        assert "Produce" in data["grouped"]
        assert len(data["grouped"]["Dairy & Eggs"]) == 2
        assert len(data["grouped"]["Produce"]) == 1
