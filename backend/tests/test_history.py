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

def test_history_and_analytics_flow():
    # 1. Create a prediction first
    img_bytes = create_test_image_bytes()
    pred_res = client.post(
        "/api/predict",
        files={"file": ("history_test_leaf.jpg", img_bytes, "image/jpeg")}
    )
    assert pred_res.status_code == 200
    pred_id = pred_res.json()["prediction_id"]

    # 2. Get history list
    hist_res = client.get("/api/history?page=1&page_size=10")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["total"] >= 1
    found = any(item["id"] == pred_id for item in hist_data["items"])
    assert found

    # 3. Get history item detail
    detail_res = client.get(f"/api/history/{pred_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["record"]["id"] == pred_id
    assert "guidance" in detail_data

    # 4. Download PDF report
    report_res = client.get(f"/api/reports/{pred_id}")
    assert report_res.status_code == 200
    assert report_res.headers["content-type"] == "application/pdf"
    assert len(report_res.content) > 1000 # Valid non-empty PDF bytes

    # 5. Get analytics summary
    analytics_res = client.get("/api/analytics/summary")
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert analytics_data["total_predictions"] >= 1
    assert "healthy_count" in analytics_data
    assert "diseased_count" in analytics_data
    assert "class_distribution" in analytics_data

    # 6. Delete history item
    del_res = client.delete(f"/api/history/{pred_id}")
    assert del_res.status_code == 200
    assert del_res.json()["id"] == pred_id

    # 7. Confirm item is deleted
    del_check = client.get(f"/api/history/{pred_id}")
    assert del_check.status_code == 404
