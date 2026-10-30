# Crop Disease Detection System — Backend Service

FastAPI-powered RESTful API service providing deep learning inference, Grad-CAM visual attention mapping, agronomic disease knowledge retrieval, SQLite prediction telemetry, and PDF diagnostic report generation.

---

## 1. Architecture & Directory Overview

```
backend/
├── app/
│   ├── api/
│   │   ├── routes.py          # REST API route handlers
│   │   └── __init__.py
│   ├── core/
│   │   ├── config.py          # Application configuration & Pydantic BaseSettings
│   │   └── __init__.py
│   ├── db/
│   │   ├── database.py        # SQLAlchemy engine, session maker, and init_db()
│   │   ├── models.py          # SQLAlchemy ORM models (PredictionRecord)
│   │   └── __init__.py
│   ├── knowledge_base/
│   │   ├── diseases.json      # Structured agronomic pathology & IPM repository
│   │   ├── service.py         # Knowledge base querying & search service
│   │   └── __init__.py
│   ├── ml/
│   │   ├── gradcam.py         # PyTorch Grad-CAM implementation & heatmap rendering
│   │   ├── inference.py       # ModelManager singleton & end-to-end inference
│   │   ├── model.py           # MobileNetV2 and ResNet18 model builder architectures
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── prediction.py      # Pydantic v2 schemas for request & response models
│   │   └── __init__.py
│   ├── services/
│   │   ├── report_generator.py # ReportLab PDF pathology report synthesis
│   │   └── __init__.py
│   ├── main.py                # FastAPI application entrypoint & lifespan lifecycle
│   └── __init__.py
├── tests/                     # 11 automated pytest unit & integration tests
│   ├── test_classes.py
│   ├── test_health.py
│   ├── test_history.py
│   ├── test_kb.py
│   └── test_predict.py
├── .env.example               # Backend environment template
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## 2. API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, device info, model status, and disclaimer |
| `GET` | `/api/classes` | List of 9 supported crop disease classes with metadata |
| `GET` | `/api/classes/samples` | Curated sample foliage image URLs for testing |
| `POST` | `/api/predict` | Upload image for inference, top-5 confidence, and Grad-CAM |
| `GET` | `/api/history` | Paginated prediction telemetry logs with crop filter |
| `GET` | `/api/history/{id}` | Detailed single prediction log |
| `DELETE` | `/api/history/{id}` | Remove a single history record |
| `GET` | `/api/analytics/summary` | Aggregate analytics (total, healthy vs diseased, class frequencies) |
| `GET` | `/api/reports/{id}` | Generate and stream formal PDF diagnosis report |

Interactive Swagger documentation is served at `http://127.0.0.1:8000/docs`.

---

## 3. Environment Configuration

Copy `.env.example` to `.env` if custom configuration is required:

```bash
PROJECT_NAME="Deep Learning-Based Crop Disease Detection System"
API_V1_STR=/api
MODEL_PATH=../models/mobilenet_v2_crop_disease.pt
CLASSES_PATH=../models/class_labels.json
CONFIDENCE_THRESHOLD=0.65
DATABASE_URL=sqlite:///./crop_disease.db
MAX_IMAGE_SIZE_BYTES=5242880
ALLOWED_IMAGE_TYPES=["image/jpeg","image/png","image/webp","image/jpg"]
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000","http://127.0.0.1:8000"]
```

---

## 4. Running the Backend

From the repository root:

```powershell
# Set Python path
$env:PYTHONPATH = "."

# Start FastAPI via Uvicorn
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 5. Running Automated Tests

Run the complete 11-test suite with pytest:

```powershell
.\venv\Scripts\pytest.exe -v
```
