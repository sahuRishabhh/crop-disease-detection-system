# Run FastAPI Uvicorn Server
$ErrorActionPreference = "Stop"

Write-Host "Starting Crop Disease Detection Backend API on http://127.0.0.1:8000..." -ForegroundColor Green
Write-Host "API Documentation available at: http://127.0.0.1:8000/docs" -ForegroundColor Cyan

$env:PYTHONPATH = "."
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
