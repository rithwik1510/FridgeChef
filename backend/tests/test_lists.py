import pytest
from fastapi import status

def test_create_list_manual(client, auth_headers):
    """Test creating a manual shopping list."""
    response = client.post("/api/v1/lists", json={
        "name": "Weekly Groceries",
        "items": [
            {"name": "Milk", "quantity": "1L", "checked": False},
            {"name": "Bread", "quantity": "1 loaf", "checked": False}
        ]
    }, headers=auth_headers)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Weekly Groceries"
    assert len(data["items"]) == 2

def test_list_shopping_lists(client, auth_headers):
    """Test listing shopping lists."""
    response = client.get("/api/v1/lists", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.json(), list)

def test_update_shopping_list(client, auth_headers):
    """Test updating a shopping list."""
    # Create list
    create_res = client.post("/api/v1/lists", json={
        "name": "To Update",
        "items": [{"name": "Item 1", "quantity": "1", "checked": False}]
    }, headers=auth_headers)
    list_id = create_res.json()["id"]

    # Update
    response = client.patch(f"/api/v1/lists/{list_id}", json={
        "items": [{"name": "Item 1", "quantity": "1", "checked": True}]
    }, headers=auth_headers)

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["items"][0]["checked"] == True

def test_delete_shopping_list(client, auth_headers):
    """Test deleting a shopping list."""
    # Create list
    create_res = client.post("/api/v1/lists", json={
        "name": "To Delete",
        "items": []
    }, headers=auth_headers)
    list_id = create_res.json()["id"]

    # Delete
    response = client.delete(f"/api/v1/lists/{list_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify deleted
    get_res = client.get(f"/api/v1/lists/{list_id}", headers=auth_headers)
    assert get_res.status_code == status.HTTP_404_NOT_FOUND
