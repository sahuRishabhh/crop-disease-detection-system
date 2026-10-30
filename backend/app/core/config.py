from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Deep Learning-Based Crop Disease Detection System"
    API_V1_STR: str = "/api"
    
    # Model configuration
    MODEL_PATH: str = str(BASE_DIR.parent / "models" / "mobilenet_v2_crop_disease.pt")
    CLASSES_PATH: str = str(BASE_DIR.parent / "models" / "class_labels.json")
    CONFIDENCE_THRESHOLD: float = 0.65
    
    # Database
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/crop_disease.db"
    
    # Upload limits (5MB)
    MAX_IMAGE_SIZE_BYTES: int = 5 * 1024 * 1024
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
