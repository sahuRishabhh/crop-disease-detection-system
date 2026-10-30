import io
from pathlib import Path
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..core.config import settings
from ..db.database import get_db
from ..db.models import PredictionHistory
from ..ml.inference import model_manager, ModelNotReadyError, InvalidImageError
from ..knowledge_base.service import kb_service
from ..services.report_generator import generate_pdf_report
from ..schemas.prediction import (
    HealthResponse,
    PredictionResponse,
    HistoryListResponse,
    HistoryItemResponse,
    AnalyticsSummaryResponse,
    DiseaseFrequency,
    KnowledgeGuidance
)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Returns service health, model load status, and device info."""
    return HealthResponse(
        status="ok",
        model_ready=model_manager.is_ready,
        model_name=model_manager.model_name if model_manager.is_ready else None,
        classes_count=len(model_manager.class_labels),
        device=str(model_manager.device),
        disclaimer="Diagnostic predictions are preliminary academic inferences, not commercial agricultural certifications."
    )

@router.get("/classes")
def get_classes():
    """Returns the list of classes supported by the loaded model or knowledge base."""
    if model_manager.is_ready and model_manager.class_labels:
        classes = model_manager.class_labels
    else:
        classes = list(kb_service.list_all().keys())

    detailed_classes = []
    for c in classes:
        info = kb_service.get_info(c)
        detailed_classes.append({
            "class_id": c,
            "crop_name": info["crop_name"],
            "disease_name": info["disease_name"],
            "is_healthy": info["is_healthy"]
        })
    return {
        "count": len(detailed_classes),
        "model_loaded": model_manager.is_ready,
        "classes": detailed_classes
    }

@router.get("/samples")
def get_sample_images():
    """Returns available sample leaf images for interactive testing."""
    samples_dir = Path(__file__).resolve().parent.parent.parent.parent / "data" / "sample_images"
    if not samples_dir.exists():
        samples_dir = Path(__file__).resolve().parent.parent.parent / "data" / "sample_images"
    samples = []
    if samples_dir.exists():
        for img_path in sorted(samples_dir.glob("*.jpg")):
            name = img_path.stem.replace("_", " ").title()
            samples.append({
                "id": img_path.name,
                "label": name,
                "url": f"/sample_images/{img_path.name}"
            })
    return {"samples": samples}

@router.post("/predict", response_model=PredictionResponse)
async def predict_leaf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts a multipart plant-leaf image, validates it, runs deep learning inference,
    stores the prediction in history, and returns diagnostic results with Grad-CAM and guidance.
    """
    if not model_manager.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=model_manager.load_error or "Model checkpoint is not yet loaded. Please train or provide a model checkpoint."
        )

    # Content type check
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file.content_type}'. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
        )

    # Read image bytes and validate size
    image_bytes = await file.read()
    if len(image_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_IMAGE_SIZE_BYTES / (1024 * 1024):.1f} MB."
        )

    try:
        result = model_manager.predict(image_bytes)
    except InvalidImageError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ModelNotReadyError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Inference processing failed.")

    # Save to database
    history_entry = PredictionHistory(
        predicted_class=result["predicted_class"],
        crop_name=result["crop_name"],
        disease_name=result["disease_name"],
        confidence=result["confidence"],
        model_version=result["model_name"],
        inference_time_ms=result["inference_time_ms"],
        warning=result.get("warning"),
        top_predictions=result.get("top_predictions")
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)

    guidance_obj = KnowledgeGuidance(**result["guidance"])

    return PredictionResponse(
        prediction_id=history_entry.id,
        predicted_class=result["predicted_class"],
        crop_name=result["crop_name"],
        disease_name=result["disease_name"],
        is_healthy=result["is_healthy"],
        confidence=result["confidence"],
        model_name=result["model_name"],
        inference_time_ms=result["inference_time_ms"],
        warning=result.get("warning"),
        top_predictions=result.get("top_predictions", []),
        guidance=guidance_obj,
        gradcam_base64=result.get("gradcam_base64"),
        created_at=history_entry.created_at.isoformat()
    )

@router.get("/history", response_model=HistoryListResponse)
def get_prediction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    crop: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Returns paginated prediction records with optional filtering."""
    query = db.query(PredictionHistory)
    if crop:
        query = query.filter(PredictionHistory.crop_name.ilike(f"%{crop}%"))

    total = query.count()
    items = query.order_by(desc(PredictionHistory.created_at))\
                 .offset((page - 1) * page_size)\
                 .limit(page_size)\
                 .all()

    return HistoryListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[
            HistoryItemResponse(
                id=item.id,
                predicted_class=item.predicted_class,
                crop_name=item.crop_name,
                disease_name=item.disease_name,
                confidence=item.confidence,
                model_version=item.model_version,
                inference_time_ms=item.inference_time_ms,
                warning=item.warning,
                top_predictions=item.top_predictions,
                created_at=item.created_at.isoformat()
            )
            for item in items
        ]
    )

@router.get("/history/{prediction_id}")
def get_history_detail(prediction_id: str, db: Session = Depends(get_db)):
    """Returns complete details of a specific prediction record."""
    item = db.query(PredictionHistory).filter(PredictionHistory.id == prediction_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found.")

    guidance = kb_service.get_info(item.predicted_class)
    return {
        "record": item.to_dict(),
        "guidance": guidance
    }

@router.delete("/history/{prediction_id}")
def delete_history_item(prediction_id: str, db: Session = Depends(get_db)):
    """Deletes an individual history record."""
    item = db.query(PredictionHistory).filter(PredictionHistory.id == prediction_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found.")
    db.delete(item)
    db.commit()
    return {"message": "Prediction record deleted successfully.", "id": prediction_id}

@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(db: Session = Depends(get_db)):
    """Provides statistical aggregations and frequency breakdown for dashboard display."""
    total = db.query(func.count(PredictionHistory.id)).scalar() or 0

    healthy_count = db.query(func.count(PredictionHistory.id))\
                      .filter(PredictionHistory.predicted_class.ilike("%healthy%"))\
                      .scalar() or 0

    diseased_count = total - healthy_count

    # Top class distribution
    class_counts = (
        db.query(PredictionHistory.disease_name, func.count(PredictionHistory.id))
        .group_by(PredictionHistory.disease_name)
        .order_by(desc(func.count(PredictionHistory.id)))
        .limit(8)
        .all()
    )
    class_distribution = [DiseaseFrequency(name=name, count=count) for name, count in class_counts]

    # Recent 7 entries for timeline
    recent_items = (
        db.query(PredictionHistory)
        .order_by(desc(PredictionHistory.created_at))
        .limit(10)
        .all()
    )
    recent_activity = [
        {
            "id": item.id,
            "crop_name": item.crop_name,
            "disease_name": item.disease_name,
            "confidence": item.confidence,
            "created_at": item.created_at.isoformat()
        }
        for item in recent_items
    ]

    return AnalyticsSummaryResponse(
        total_predictions=total,
        healthy_count=healthy_count,
        diseased_count=diseased_count,
        class_distribution=class_distribution,
        recent_activity=recent_activity
    )

@router.get("/reports/{prediction_id}")
def download_pdf_report(prediction_id: str, db: Session = Depends(get_db)):
    """Generates and streams a downloadable PDF diagnostic report for a specific prediction."""
    item = db.query(PredictionHistory).filter(PredictionHistory.id == prediction_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found.")

    guidance = kb_service.get_info(item.predicted_class)
    report_dict = item.to_dict()
    report_dict["guidance"] = guidance

    pdf_buffer = generate_pdf_report(report_dict)

    filename = f"crop_disease_report_{prediction_id[:8]}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
