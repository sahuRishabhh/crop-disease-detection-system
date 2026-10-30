# PowerShell Setup Script for Crop Disease Detection System
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " FloraScan AI: Crop Disease Detection System Setup" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Virtual Environment Setup
if (-not (Test-Path "venv")) {
    Write-Host "[1/4] Creating Python virtual environment in 'venv'..." -ForegroundColor Cyan
    python -m venv venv
} else {
    Write-Host "[1/4] Existing virtual environment found in 'venv'." -ForegroundColor Cyan
}

# 2. Python Dependencies
Write-Host "[2/4] Installing PyTorch (CPU) and backend dependencies..." -ForegroundColor Cyan
.\venv\Scripts\pip.exe install torch torchvision --index-url https://download.pytorch.org/whl/cpu
.\venv\Scripts\pip.exe install -r backend/requirements.txt

# 3. Frontend Dependencies
Write-Host "[3/4] Installing Node.js frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

# 4. Sample Images & Model Verification
Write-Host "[4/4] Generating sample leaf images and verifying model weights..." -ForegroundColor Cyan
.\venv\Scripts\python.exe scripts/prepare_samples.py

if (-not (Test-Path "models/mobilenet_v2_crop_disease.pt")) {
    Write-Host "Training initial baseline MobileNetV2 checkpoint..." -ForegroundColor Yellow
    .\venv\Scripts\python.exe training/train.py --generate-fixtures --epochs 3 --batch-size 8
    .\venv\Scripts\python.exe training/evaluate.py
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Setup Completed Successfully!" -ForegroundColor Green
Write-Host " Start Backend:  powershell -File scripts/run_backend.ps1" -ForegroundColor Yellow
Write-Host " Start Frontend: powershell -File scripts/run_frontend.ps1" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
