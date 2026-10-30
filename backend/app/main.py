from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .db.database import init_db
from .api.routes import router as api_router
from .ml.inference import model_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("crop_disease_system")

# Ensure database tables exist immediately on import/startup
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing crop disease detection service...")
    init_db()
    if model_manager.is_ready:
        logger.info(f"Model loaded: {model_manager.model_name} with {len(model_manager.class_labels)} classes on device '{model_manager.device}'.")
    else:
        logger.warning(f"Model not loaded: {model_manager.load_error}. Running in setup/demo mode.")
    yield
    logger.info("Service shutdown completed.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Academic Deep Learning-Based Crop Disease Detection System API with MobileNetV2, Grad-CAM, and Integrated Disease Knowledge Base.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sample images directory for UI preview / testing if present
samples_dir = Path(__file__).resolve().parent.parent.parent / "data" / "sample_images"
if samples_dir.exists():
    app.mount("/sample_images", StaticFiles(directory=str(samples_dir)), name="sample_images")

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "model_ready": model_manager.is_ready,
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR,
        "disclaimer": "Diagnostic predictions are preliminary academic aids and not a substitute for certified agricultural consultation."
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please verify your input or check server logs."}
    )
