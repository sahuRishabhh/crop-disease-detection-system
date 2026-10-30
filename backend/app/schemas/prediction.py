from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class TopPrediction(BaseModel):
    class_name: str
    crop_name: str
    disease_name: str
    confidence: float

class KnowledgeGuidance(BaseModel):
    pathogen: Optional[str] = None
    symptoms: List[str] = []
    prevention: List[str] = []
    management: List[str] = []
    limitations: Optional[str] = None
    references: List[str] = []
    verified: bool = False

class PredictionResponse(BaseModel):
    prediction_id: str
    predicted_class: str
    crop_name: str
    disease_name: str
    is_healthy: bool
    confidence: float
    model_name: str
    inference_time_ms: float
    warning: Optional[str] = None
    top_predictions: List[TopPrediction] = []
    guidance: KnowledgeGuidance
    gradcam_base64: Optional[str] = None
    created_at: str

class HistoryItemResponse(BaseModel):
    id: str
    predicted_class: str
    crop_name: str
    disease_name: str
    confidence: float
    model_version: str
    inference_time_ms: float
    warning: Optional[str] = None
    top_predictions: Optional[List[Dict[str, Any]]] = None
    created_at: str

class HistoryListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[HistoryItemResponse]

class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    model_name: Optional[str] = None
    classes_count: int
    device: str
    disclaimer: str

class DiseaseFrequency(BaseModel):
    name: str
    count: int

class AnalyticsSummaryResponse(BaseModel):
    total_predictions: int
    healthy_count: int
    diseased_count: int
    class_distribution: List[DiseaseFrequency]
    recent_activity: List[Dict[str, Any]]
