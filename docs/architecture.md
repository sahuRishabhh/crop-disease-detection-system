# System Architecture & Technical Specifications

## 1. High-Level System Overview
The **Crop Disease Detection System** is designed as a modular, decoupled full-stack machine learning platform for academic foliar pathology research and agricultural demonstration.

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (TypeScript, Tailwind CSS, Vite, Lucide, Recharts)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / Multipart Upload
                            ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│            (Uvicorn ASGI, Pydantic v2)                 │
└─────┬─────────────────────┬──────────────────────┬─────┘
      │                     │                      │
      ▼                     ▼                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  PyTorch ML  │     │   Disease    │     │   SQLite &   │
│ MobileNetV2  │     │  Knowledge   │     │  SQLAlchemy  │
│  & Grad-CAM  │     │     Base     │     │ Persistence  │
└──────────────┘     └──────────────┘     └──────────────┘
```

## 2. Deep Learning Pipeline
1. **Input Normalization**: Ingests RGB imagery resized to $256 \times 256$, center-cropped to $224 \times 224$, and normalized using ImageNet parameters ($\mu=[0.485, 0.456, 0.406]$, $\sigma=[0.229, 0.224, 0.225]$).
2. **Convolutional Extraction**: Evaluated through MobileNetV2 inverted residual blocks featuring depthwise separable convolutions to maximize parameter efficiency.
3. **Classification Head**: Replaced linear projection layer mapping 1280 latent channels into $N$ disease classes.
4. **Grad-CAM Attention**: Backward gradient hook captures target class gradients relative to the final activation tensor `features[-1]`, generating a spatial heatmap overlaid onto the original foliage image.

## 3. Database Schema
- Managed via SQLAlchemy ORM with SQLite backend (`backend/crop_disease.db`).
- Table `prediction_history`:
  - `id`: UUID (Primary Key)
  - `predicted_class`: string index
  - `crop_name`: extracted host plant
  - `disease_name`: diagnosed pathology
  - `confidence`: float $[0.0, 1.0]$
  - `model_version`: architecture string
  - `inference_time_ms`: CPU execution latency
  - `warning`: uncertainty advisory string
  - `top_predictions`: JSON array of top-5 hypotheses
  - `created_at`: UTC timestamp
