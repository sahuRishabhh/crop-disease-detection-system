from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_classes():
    response = client.get("/api/classes")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
    assert "classes" in data
    assert len(data["classes"]) > 0
    first_class = data["classes"][0]
    assert "class_id" in first_class
    assert "crop_name" in first_class
    assert "disease_name" in first_class
    assert "is_healthy" in first_class

def test_get_samples():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert len(data["samples"]) >= 1
