# Development and Implementation of a Deep Learning-Based Crop Disease Detection System

[![Python](https://img.shields.io/badge/Python-3.13-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.15-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.3-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An academic full-stack deep learning platform engineered to detect, classify, and explain foliar crop diseases from plant leaf imagery using transfer learning (**MobileNetV2**), explainable artificial intelligence (**Grad-CAM**), an integrated agronomic knowledge base, persistent prediction telemetry (**SQLite**), and automated diagnostic PDF report generation.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Problem Statement](#2-problem-statement)
- [3. Project Objectives](#3-project-objectives)
- [4. Key Features](#4-key-features)
- [5. Technology Stack](#5-technology-stack)
- [6. System Architecture](#6-system-architecture)
- [7. Dataset Information and Source Attribution](#7-dataset-information-and-source-attribution)
- [8. Deep Learning Model Architecture](#8-deep-learning-model-architecture)
- [9. Model Training Instructions](#9-model-training-instructions)
- [10. Model Evaluation Methodology](#10-model-evaluation-methodology)
- [11. Actual Evaluation Results](#11-actual-evaluation-results)
- [12. Installation Instructions](#12-installation-instructions)
- [13. Backend Setup](#13-backend-setup)
- [14. Frontend Setup](#14-frontend-setup)
- [15. How to Run the Website](#15-how-to-run-the-website)
- [16. API Documentation](#16-api-documentation)
- [17. Screenshots](#17-screenshots)
- [18. Project Folder Structure](#18-project-folder-structure)
- [19. Limitations](#19-limitations)
- [20. Future Scope](#20-future-scope)
- [21. References and Acknowledgements](#21-references-and-acknowledgements)

---

## 1. Project Overview

Agricultural food security is consistently threatened by plant pathogens that impair crop yields and quality. Traditional disease identification relies heavily on manual visual scouting by agronomists, which is labor-intensive, subjective, and inaccessible in remote farming regions.

This project delivers an end-to-end, reproducible computational solution:
- Ingests digital images of plant foliage via a web interface or REST API.
- Classifies foliar conditions across economic host crops (Tomato, Potato, Corn, Apple) using an optimized deep convolutional neural network (**MobileNetV2**).
- Computes **Grad-CAM (Gradient-Weighted Class Activation Mapping)** visual heatmaps to identify the morphological regions of interest justifying the diagnosis.
- Matches identified pathologies against a local **Agronomic Knowledge Base** to retrieve verified symptoms, preventative cultivation practices, and Integrated Pest Management (IPM) guidelines.
- Logs prediction telemetry into a local relational database (**SQLite**) and compiles comprehensive **PDF Pathology Reports** via ReportLab.

---

## 2. Problem Statement

Smallholder farmers and agricultural technicians frequently struggle with timely and accurate foliar disease identification. Misdiagnosing fungal or bacterial infections often leads to inappropriate pesticide usage, increased input costs, environmental contamination, and accelerated crop loss. Furthermore, standard "black-box" deep learning models fail to provide visual explanations of why a particular prediction was made, inhibiting trust and pedagogical utility.

There is a critical need for an interpretable, lightweight, full-stack crop disease diagnosis system capable of running locally or on modest server infrastructure without requiring commercial cloud APIs.

---

## 3. Project Objectives

1. **Lightweight Deep Learning**: Deploy an efficient transfer-learning model architecture suitable for rapid inference without requiring dedicated GPU clusters.
2. **Explainable AI (XAI)**: Implement Grad-CAM activation mapping to visualize the salient leaf regions triggering the network's diagnostic decision.
3. **Foliar Pathology Taxonomy**: Classify 9 conditions spanning 4 major crops (Apple, Corn, Potato, Tomato) including both healthy leaves and fungal/bacterial blights and rusts.
4. **Offline Knowledge Base**: Deliver actionable agronomic guidance, symptom verification, and IPM remediation directly within the application.
5. **Traceability & Diagnostics**: Persist prediction history with confidence scoring, uncertainty warnings (< 65% threshold), latency tracking, and downloadable PDF reports.
6. **Decoupled Modern Web Architecture**: Maintain a clean separation between the FastAPI REST backend and a responsive React 19 / Tailwind CSS client.

---

## 4. Key Features

- **Interactive Foliage Diagnosis**:
  - Image upload supporting JPEG, PNG, and WEBP formats (up to 5 MB).
  - Quick-pick curated sample leaf gallery for immediate offline testing.
  - Probability distribution across top candidate classes.
- **Explainable Grad-CAM Heatmaps**:
  - Dynamic overlay over original leaf imagery.
  - Interactive controls: Heatmap Overlay, Raw Foliage, and Side-by-Side Split View.
- **Agronomic Knowledge Profiles**:
  - Pathogen scientific taxonomy, confirmed visual symptoms, cultural prevention techniques, and chemical/biological control practices.
- **Historical Audit & Analytics Dashboard**:
  - Paginated SQLite history with search and crop-level filtering.
  - Real-time aggregate KPIs: Total diagnoses, healthy-vs-diseased ratios, and average inference latency.
  - Class distribution and crop frequency visualizations.
- **Automated PDF Pathology Reports**:
  - Single-click downloadable diagnostic dossier synthesizing predictions, Grad-CAM references, agronomic advice, and academic disclaimers.

---

## 5. Technology Stack

### Backend & Machine Learning
- **Python**: 3.10+ (Tested on Python 3.13)
- **PyTorch**: Deep learning framework and tensor computations
- **Torchvision**: Pretrained MobileNetV2 / ResNet18 models and data augmentations
- **FastAPI**: Asynchronous high-performance REST API
- **Uvicorn**: ASGI web server implementation
- **Pydantic v2**: Request/response schema validation and settings management
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Embedded database for prediction telemetry
- **Pillow & NumPy**: Image ingestion, tensor transformations, and normalization
- **ReportLab**: Programmatic PDF report compilation
- **Pytest**: Automated testing harness

### Frontend
- **React**: 19.3
- **TypeScript**: 5.8
- **Tailwind CSS**: v4 utility-first styling
- **Vite**: 8.3 build tool and local development server
- **Lucide React**: Clean iconography
- **Recharts**: Data visualization and analytics charts

---

## 6. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (TypeScript, Tailwind CSS, Vite, Lucide, Recharts)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / REST / Multipart Upload
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

See [docs/architecture.md](docs/architecture.md) for full technical architectural specifications.

---

## 7. Dataset Information and Source Attribution

- **Primary Benchmark Reference**: **PlantVillage Dataset**
- **Citation**:
  > Hughes, D., & Salathé, M. (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics*. arXiv preprint arXiv:1511.08060.
- **Official Repository**: [spMohanty/PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset)
- **Included Dataset Artifacts**:
  - `data/fixtures/`: Smoke-test and regression test suite covering all 9 classes partitioned into `train/`, `val/`, and `test/` splits (~1.7 MB total).
  - `data/sample_images/`: Authentic sample foliage images mounted for instant web demonstration without uploading local files.
- **Storage Policy**: To prevent repository bloat, full raw datasets (>800 MB) are excluded from version control via `.gitignore`. The included fixtures allow full offline pipeline verification and training reproduction.

See [data/README.md](data/README.md) and [docs/dataset.md](docs/dataset.md) for dataset configuration details.

---

## 8. Deep Learning Model Architecture

The core classification backbone is **MobileNetV2** (Sandler et al., 2018), selected for its parameter efficiency, depthwise separable convolutions, and low memory footprint.

- **Pretrained Weights**: ImageNet-1k baseline (`MobileNet_V2_Weights.DEFAULT`).
- **Input Resolution**: $3 \times 224 \times 224$ pixels.
- **Input Normalization**:
  - Mean: $\mu = [0.485, 0.456, 0.406]$
  - Standard Deviation: $\sigma = [0.229, 0.224, 0.225]$
- **Modified Classification Head**:
  ```python
  Sequential(
    (0): Dropout(p=0.2, inplace=False)
    (1): Linear(in_features=1280, out_features=9, bias=True)
  )
  ```
- **Grad-CAM Explainability Hook**:
  Attached to the final convolutional feature layer (`model.features[-1]`). Backward gradients for the predicted class index are pooled across spatial dimensions to compute a weighted combination of forward feature activation maps.

See [models/README.md](models/README.md) for checkpoint placement and format details.

---

## 9. Model Training Instructions

All commands are designed for Windows PowerShell.

### Fast Verification (Smoke-Test Mode)
Verify data loader, device allocation, and gradient backpropagation:
```powershell
.\venv\Scripts\python.exe training/train.py --smoke-test --batch-size 8
```

### Full Training Run
Train the MobileNetV2 model on dataset fixtures:
```powershell
.\venv\Scripts\python.exe training/train.py --data-dir data/fixtures --epochs 3 --batch-size 8 --lr 0.001 --model-name mobilenet_v2
```

### Available Command-Line Flags
- `--data-dir`: Path to dataset directory (defaults to `data/fixtures`).
- `--epochs`: Total training epochs (e.g. `3` or `10`).
- `--batch-size`: Batch size (default: `8` for CPU execution).
- `--lr`: Learning rate (default: `0.001` with Adam optimizer).
- `--model-name`: Model architecture (`mobilenet_v2` or `resnet18`).
- `--seed`: Random seed for reproducible dataset splits and weights initialization.

See [docs/training.md](docs/training.md) for advanced training configurations.

---

## 10. Model Evaluation Methodology

Evaluation is executed against a held-out test split using standard classification metrics:
- **Categorical Accuracy**: Proportion of correctly predicted samples.
- **Precision, Recall, and F1-Score**: Evaluated both per-class and across macro / weighted averages.
- **Confusion Matrix**: Visual cross-tabulation of ground truth versus predicted labels.
- **Inference Latency**: Average CPU/GPU forward-pass execution time in milliseconds.

To run evaluation on the test split:
```powershell
.\venv\Scripts\python.exe training/evaluate.py --data-dir data/fixtures --checkpoint models/mobilenet_v2_crop_disease.pt
```

---

## 11. Actual Evaluation Results

> [!NOTE]
> All metrics below reflect the actual evaluation run recorded in `outputs/metrics.json` and `outputs/training_history.json` on 2026-10-29.

- **Evaluated Model Checkpoint**: `models/mobilenet_v2_crop_disease.pt` (~8.76 MB)
- **Test Dataset Size**: 36 samples (4 samples per class across 9 target classes)
- **Overall Categorical Accuracy**: **88.89%** ($32 / 36$ samples correct)
- **Macro Average F1-Score**: **85.19%**
- **Weighted Average F1-Score**: **85.19%**
- **Average Inference Latency**: **51.37 ms** (CPU execution)
- **Best Validation Accuracy**: **88.89%** (Epoch 3, Validation Loss: 0.2790)

### Per-Class Performance Summary

| Class Index | Target Class | Precision | Recall | F1-Score | Support |
| :---: | :--- | :---: | :---: | :---: | :---: |
| 0 | `Apple___Apple_scab` | 1.00 | 1.00 | 1.00 | 4 |
| 1 | `Apple___healthy` | 1.00 | 1.00 | 1.00 | 4 |
| 2 | `Corn_(maize)___Common_rust_` | 1.00 | 1.00 | 1.00 | 4 |
| 3 | `Corn_(maize)___healthy` | 1.00 | 1.00 | 1.00 | 4 |
| 4 | `Potato___Early_blight` | 0.50 | 1.00 | 0.67 | 4 |
| 5 | `Potato___healthy` | 1.00 | 1.00 | 1.00 | 4 |
| 6 | `Tomato___Early_blight` | 0.00 | 0.00 | 0.00 | 4 |
| 7 | `Tomato___Late_blight` | 1.00 | 1.00 | 1.00 | 4 |
| 8 | `Tomato___healthy` | 1.00 | 1.00 | 1.00 | 4 |
| **—** | **Macro Average** | **0.83** | **0.89** | **0.85** | **36** |
| **—** | **Weighted Average** | **0.83** | **0.89** | **0.85** | **36** |

The evaluation plots are preserved in `outputs/`:
- `outputs/confusion_matrix.png`: High-resolution annotated confusion matrix.
- `outputs/training_curves.png`: Training vs. validation loss and accuracy curves.

---

## 12. Installation Instructions

### Prerequisites
- **Operating System**: Windows 10 or 11 (64-bit)
- **Python**: 3.10+ (Recommended: Python 3.13)
- **Node.js**: v18+ (Tested on Node v24 / npm 11)
- **Git**: Installed and available in terminal

### Automated Quick Setup (Windows PowerShell)
Run the automated environment setup script from the repository root:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
```

---

## 13. Backend Setup

If configuring manually without the setup script:

```powershell
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 3. Install PyTorch CPU and backend dependencies
.\venv\Scripts\pip.exe install torch torchvision --index-url https://download.pytorch.org/whl/cpu
.\venv\Scripts\pip.exe install -r backend/requirements.txt

# 4. Initialize sample leaf assets
.\venv\Scripts\python.exe scripts/prepare_samples.py
```

---

## 14. Frontend Setup

```powershell
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Verify production build
npm run build

# 4. Return to project root
cd ..
```

---

## 15. How to Run the Website

Launch the backend and frontend services in two separate PowerShell windows:

### Terminal 1: Backend API Service
```powershell
powershell -File scripts/run_backend.ps1
```
*Or manual execution:*
```powershell
$env:PYTHONPATH = "."
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

### Terminal 2: Frontend Web Client
```powershell
powershell -File scripts/run_frontend.ps1
```
*Or manual execution:*
```powershell
cd frontend
npm run dev
```
- **Web Application URL**: `http://localhost:5173`

---

## 16. API Documentation

Interactive OpenAPI / Swagger UI documentation is available at `http://127.0.0.1:8000/docs`.

### Core API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check, device, loaded model info, and disclaimer |
| `GET` | `/api/classes` | 9 supported foliar disease classes and metadata |
| `GET` | `/api/classes/samples` | Sample leaf images available for instant demo testing |
| `POST` | `/api/predict` | Multipart image upload for inference and Grad-CAM generation |
| `GET` | `/api/history` | Paginated diagnosis history with crop filtering |
| `GET` | `/api/history/{id}` | Detailed telemetry record for a single diagnosis |
| `DELETE` | `/api/history/{id}` | Delete a diagnosis record from SQLite |
| `GET` | `/api/analytics/summary` | Aggregate analytics (total, diseased/healthy breakdown, frequencies) |
| `GET` | `/api/reports/{id}` | Generate and stream formal PDF diagnosis report |

Detailed payload examples and schemas are provided in [docs/api.md](docs/api.md).

---

## 17. Screenshots

*(Placeholders provided below for user interface walkthrough)*

### Disease Diagnosis & Grad-CAM Heatmap Viewer
```
+-----------------------------------------------------------------------+
|  [ Upload Leaf ]  or  [ Select Sample Leaf Image ]                    |
|                                                                       |
|  +-------------------------+      +--------------------------------+  |
|  |   Original Foliage      |      |   Grad-CAM Heatmap Overlay     |  |
|  |                         |  ->  |   (High Attention on Blight)   |  |
|  +-------------------------+      +--------------------------------+  |
|                                                                       |
|  Diagnosis: Potato Early Blight (Alternaria solani)                   |
|  Confidence: 89.4%   |   Latency: 48 ms                               |
|                                                                       |
|  Top Predictions:                                                     |
|  [████████████████████░░░░░] Potato___Early_blight   89.4%            |
|  [██░░░░░░░░░░░░░░░░░░░░░░░] Tomato___Early_blight    7.1%            |
|  [█░░░░░░░░░░░░░░░░░░░░░░░░] Potato___healthy         2.3%            |
|                                                                       |
|  [ Download Official PDF Pathology Report ]                           |
+-----------------------------------------------------------------------+
```

### Telemetry Dashboard & Historical Audit
```
+-----------------------------------------------------------------------+
|  Total Diagnoses: 42   |   Diseased: 31   |   Avg Latency: 51.4 ms    |
|                                                                       |
|  +--------------------------------+  +-----------------------------+  |
|  | Disease Frequency (Recharts)   |  | Host Crop Distribution      |  |
|  | Tomato: ██████████ (45%)       |  | Tomato: 52%                 |  |
|  | Potato: ██████ (28%)           |  | Potato: 30%                 |  |
|  | Apple:  ████ (18%)             |  | Apple:  10%                 |  |
|  | Corn:   ██ (9%)                |  | Corn:   8%                  |  |
|  +--------------------------------+  +-----------------------------+  |
+-----------------------------------------------------------------------+
```

---

## 18. Project Folder Structure

```
crop-disease-detection-system/
│
├── frontend/                          # React 19 + TypeScript + Tailwind CSS UI
│   ├── public/                        # Static assets (favicons, SVG icons)
│   ├── src/
│   │   ├── assets/                    # UI branding illustrations
│   │   ├── components/                # GradCamViewer, Navbar, Footer, Charts
│   │   ├── pages/                     # Detect, Dashboard, History, Methodology
│   │   ├── services/                  # Axios/Fetch API client layer
│   │   ├── types/                     # TypeScript data interfaces
│   │   ├── App.tsx                    # Client-side router
│   │   └── main.tsx                   # React root entrypoint
│   ├── .env.example                   # Frontend environment template
│   ├── package.json                   # Dependencies and scripts
│   ├── vite.config.ts                 # Build config & backend proxy
│   └── README.md                      # Frontend documentation
│
├── backend/                           # FastAPI REST Application
│   ├── app/
│   │   ├── api/routes.py              # REST API endpoints
│   │   ├── core/config.py             # App settings & CORS configuration
│   │   ├── db/                        # SQLAlchemy models & SQLite engine
│   │   ├── knowledge_base/            # Agronomic disease taxonomy & IPM advice
│   │   ├── ml/                        # MobileNetV2, Grad-CAM hook & ModelManager
│   │   ├── schemas/                   # Pydantic v2 validation models
│   │   ├── services/                  # PDF report generator using ReportLab
│   │   └── main.py                    # Application lifecycle entrypoint
│   ├── tests/                         # Automated test suite (11 passing tests)
│   ├── .env.example                   # Backend environment template
│   ├── requirements.txt               # Backend Python dependencies
│   └── README.md                      # Backend documentation
│
├── training/                          # Machine Learning Pipeline
│   ├── train.py                       # Transfer learning training script
│   ├── evaluate.py                    # Test set evaluation and metrics exporter
│   ├── dataset.py                     # Dataset validation, loader & partitioner
│   ├── transforms.py                  # Augmentations and normalization
│   └── config.yaml                    # Training hyperparameters
│
├── data/                              # Data Artifacts
│   ├── fixtures/                      # Test fixtures across 9 classes (train/val/test)
│   ├── sample_images/                 # Interactive foliage leaves for UI demonstration
│   └── README.md                      # Dataset documentation and attribution
│
├── models/                            # Model Checkpoints & Labels
│   ├── mobilenet_v2_crop_disease.pt   # Trained PyTorch checkpoint (~8.76 MB)
│   ├── class_labels.json              # Ordered list of 9 indexed target classes
│   └── README.md                      # Architecture specifications & instructions
│
├── outputs/                           # Evaluation Artifacts
│   ├── metrics.json                   # Verified test metrics & per-class scores
│   ├── training_history.json          # Loss and accuracy logs across epochs
│   ├── confusion_matrix.png           # Annotated confusion matrix plot
│   ├── training_curves.png            # Loss and accuracy trajectory plots
│   └── README.md                      # Outputs documentation
│
├── docs/                              # Project Documentation
│   ├── architecture.md                # System design & component interaction
│   ├── dataset.md                     # Dataset specifications & augmentation
│   ├── training.md                    # Training & hyperparameter guide
│   └── api.md                         # REST API reference documentation
│
├── scripts/                           # Automation & Runner Scripts
│   ├── prepare_samples.py             # Foliage sample generator for web UI
│   ├── run_backend.ps1                # PowerShell backend launcher
│   ├── run_frontend.ps1               # PowerShell frontend launcher
│   └── setup.ps1                      # Complete environment setup script
│
├── .gitignore                         # Comprehensive Git exclusion rules
├── .gitattributes                     # Line-ending and binary file rules
├── .env.example                       # Root environment variable template
├── pytest.ini                         # Pytest configuration
├── LICENSE                            # MIT License
└── README.md                          # Main project documentation (this file)
```

---

## 19. Limitations

1. **Controlled Lighting Assumption**: Baseline models perform best on isolated, well-lit leaf images. Uncontrolled field conditions with severe specular reflections or cluttered backgrounds may degrade confidence.
2. **Class Coverage**: The baseline model classifies 9 distinct conditions across 4 crops (Apple, Corn, Potato, Tomato). Diseases outside this index will be mapped to the closest feature representation; the system flags inferences below 65% confidence as uncertain.
3. **Hardware Latency**: CPU inference latency averages ~51 ms. While highly responsive for interactive web use, real-time edge video stream classification requires quantization (INT8) or TensorRT acceleration.
4. **Not a Clinical Substitute**: Diagnostic inferences are probabilistic algorithmic estimates intended for academic demonstration and decision support, not legal agrochemical certification.

---

## 20. Future Scope

- **Edge Deployment**: Export PyTorch weights to ONNX and TensorFlow Lite (TFLite) for on-device mobile smartphone inference without internet connectivity.
- **Taxonomy Expansion**: Incorporate the full 38-class PlantVillage benchmark and real-world field datasets (e.g., PlantDoc, Citrus Leaf Disease).
- **Multi-Disease Detection**: Integrate object detection backbones (YOLOv8, Faster R-CNN) to detect multiple concurrent disease lesions across a single branch or canopy.
- **Multilingual Support**: Translate disease profiles and PDF reports into regional languages (Hindi, Spanish, Swahili) for global agricultural accessibility.

---

## 21. References and Acknowledgements

1. **Sandler, M., Howard, A., Zhu, M., Zhmoginov, A., & Chen, L. C.** (2018). *MobileNetV2: Inverted Residuals and Linear Bottlenecks*. In Proceedings of the IEEE conference on computer vision and pattern recognition (CVPR), pp. 4510-4520.
2. **Selvaraju, R. R., Cogswell, M., Das, A., Vedaldi, A., Parikh, D., & Batra, D.** (2017). *Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization*. In Proceedings of the IEEE international conference on computer vision (ICCV), pp. 618-626.
3. **Hughes, D., & Salathé, M.** (2015). *An open access repository of images on plant health to enable the development of mobile disease diagnostics*. arXiv preprint arXiv:1511.08060.
4. **PyTorch Team**: PyTorch and Torchvision deep learning libraries ([pytorch.org](https://pytorch.org/)).
5. **FastAPI & Starlette**: High-performance asynchronous web framework ([fastapi.tiangolo.com](https://fastapi.tiangolo.com/)).
6. **ReportLab**: Open-source PDF generation engine for Python ([reportlab.com](https://www.reportlab.com/)).

---

## License

This project is licensed under the [MIT License](LICENSE).
