# REST API Reference Documentation

Base URL: `http://127.0.0.1:8000/api`
Interactive Swagger UI: `http://127.0.0.1:8000/docs`
ReDoc Specification: `http://127.0.0.1:8000/redoc`

## Endpoints

### 1. Health & Readiness
`GET /api/health`
- **Response**:
```json
{
  "status": "ok",
  "model_ready": true,
  "model_name": "MobileNetV2",
  "classes_count": 9,
  "device": "cpu",
  "disclaimer": "Diagnostic predictions are preliminary academic inferences..."
}
```

### 2. Available Classes
`GET /api/classes`
- Returns indexed class labels, associated host crops, and healthy/diseased classification.

### 3. Leaf Disease Prediction
`POST /api/predict`
- **Request**: Multipart form data with file field `file`.
- **Allowed Formats**: JPEG, PNG, WEBP (Max size: 5 MB).
- **Response**:
  - `prediction_id`: Unique history record UUID
  - `predicted_class`: Class key
  - `crop_name`: Host plant name
  - `disease_name`: Identified condition
  - `confidence`: Softmax probability ($0.0$ to $1.0$)
  - `top_predictions`: Top 5 candidate classes with probabilities
  - `gradcam_base64`: Base64 JPEG data URL containing visual attention heatmap overlay
  - `guidance`: Verified symptoms, prevention practices, and IPM recommendations
  - `inference_time_ms`: Execution latency in milliseconds

### 4. Prediction History
`GET /api/history?page=1&page_size=10&crop=Tomato`
- Returns paginated diagnostic records with total record count.

`GET /api/history/{id}`
- Retrieves audit record details for a specific prediction.

`DELETE /api/history/{id}`
- Deletes an individual history record from the SQLite database.

### 5. Analytics Summary
`GET /api/analytics/summary`
- Aggregates total predictions, healthy-vs-diseased breakdown, class frequency distribution, and recent activity.

### 6. Downloadable Diagnostic Report
`GET /api/reports/{id}`
- Streams a formal downloadable PDF pathology report generated via ReportLab.
