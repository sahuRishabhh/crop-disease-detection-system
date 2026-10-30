from backend.app.knowledge_base.service import kb_service

def test_kb_indexed_class():
    info = kb_service.get_info("Tomato___Early_blight")
    assert info["verified"] is True
    assert info["crop_name"] == "Tomato"
    assert info["disease_name"] == "Early Blight"
    assert info["is_healthy"] is False
    assert len(info["symptoms"]) > 0
    assert len(info["prevention"]) > 0
    assert len(info["management"]) > 0

def test_kb_healthy_class():
    info = kb_service.get_info("Tomato___healthy")
    assert info["is_healthy"] is True
    assert info["disease_name"] == "Healthy Foliage"

def test_kb_unknown_class_fallback():
    info = kb_service.get_info("Grape___Unknown_Rust")
    assert info["verified"] is False
    assert "Grape" in info["crop_name"]
    assert len(info["management"]) > 0
