# Run React Vite Development Server
$ErrorActionPreference = "Stop"

Write-Host "Starting React Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location frontend
npm run dev
