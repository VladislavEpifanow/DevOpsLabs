import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine
from app import models

client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup_db():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    yield

def test_create_book():
    response = client.post("/books/", json={"title": "1984", "author": "George Orwell"})
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == "1984"

def test_read_books():
    client.post("/books/", json={"title": "1984", "author": "George Orwell"})
    response = client.get("/books/")
    assert len(response.json()) == 1

def test_read_nonexistent_book():
    response = client.get("/books/999")
    assert response.status_code == 404

def test_update_book():
    create_response = client.post("/books/", json={"title": "Old Title", "author": "Old Author"})
    book_id = create_response.json()["id"]
    response = client.put(f"/books/{book_id}", json={"title": "New Title", "author": "New Author"})
    assert response.status_code == 200
    updated_book = client.get(f"/books/{book_id}").json()
    assert updated_book["title"] == "New Title"

def test_delete_book():
    create_response = client.post("/books/", json={"title": "To Delete", "author": "Author"})
    book_id = create_response.json()["id"]
    response = client.delete(f"/books/{book_id}")
    assert response.status_code == 200
    response = client.get(f"/books/{book_id}")
    assert response.status_code == 404