import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def create_test_image_bytes():
    img = Image.new("RGB", (224, 224), color=(60, 140, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_predict_success():
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/predict",
        files={"file": ("test_leaf.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "prediction_id" in data
    assert "predicted_class" in data
    assert "crop_name" in data
    assert "disease_name" in data
    assert "confidence" in data
    assert data["confidence"] >= 0.0 and data["confidence"] <= 1.0
    assert "top_predictions" in data
    assert len(data["top_predictions"]) >= 1
    assert "guidance" in data
    assert "gradcam_base64" in data
    assert data["gradcam_base64"] is not None

def test_predict_invalid_image_type():
    response = client.post(
        "/api/predict",
        files={"file": ("test.txt", b"plain text content", "text/plain")}
    )
    assert response.status_code == 400

def test_predict_corrupted_image():
    response = client.post(
        "/api/predict",
        files={"file": ("broken.jpg", b"\x00\x01\x02\x03not-a-real-jpeg", "image/jpeg")}
    )
    assert response.status_code == 400
