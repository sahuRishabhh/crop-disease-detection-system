import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from .database import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    predicted_class = Column(String(100), nullable=False, index=True)
    crop_name = Column(String(50), nullable=False, index=True)
    disease_name = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    model_version = Column(String(50), default="MobileNetV2-Custom")
    inference_time_ms = Column(Float, default=0.0)
    warning = Column(String(255), nullable=True)
    top_predictions = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "predicted_class": self.predicted_class,
            "crop_name": self.crop_name,
            "disease_name": self.disease_name,
            "confidence": self.confidence,
            "model_version": self.model_version,
            "inference_time_ms": self.inference_time_ms,
            "warning": self.warning,
            "top_predictions": self.top_predictions or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
