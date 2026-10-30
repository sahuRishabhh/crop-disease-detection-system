# Crop Disease Detection System — Frontend Client

A responsive web application built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite** for foliar disease detection, Grad-CAM visual explanation, diagnostic history inspection, and agronomic reporting.

---

## 1. Features & User Experience

- **Interactive Disease Diagnosis (`/detect`)**:
  - Drag-and-drop or file browser upload for leaf images (JPEG, PNG, WEBP).
  - Quick-pick curated sample leaf images for instant demo testing.
  - Interactive Grad-CAM attention heatmap viewer with 3 visual modes: **Overlay**, **Original Foliage**, and **Split-Screen Comparison**.
  - Top-5 prediction confidence distribution bar chart.
  - Comprehensive agronomic disease profile: pathogen classification, verified visual symptoms, cultural preventative practices, and Integrated Pest Management (IPM) recommendations.
  - One-click PDF pathology report generation and direct download.
- **Diagnostics Dashboard (`/dashboard`)**:
  - Live aggregated KPIs: Total diagnoses, healthy vs. diseased ratio, and average model latency.
  - Interactive charts powered by **Recharts**: Class frequency distribution and host crop breakdown.
- **Historical Audit Log (`/history`)**:
  - Paginated table of all historical predictions stored in SQLite.
  - Crop filter and individual record inspection.
  - Historical PDF report re-generation and record deletion.
- **Methodology & Architecture (`/methodology`)**:
  - Academic overview of the convolutional architecture (MobileNetV2), transfer learning strategy, ImageNet normalization, and mathematical formulation of Grad-CAM.
- **Responsive Layout**: Designed for desktop and mobile foliage inspection in the field.

---

## 2. Technology Stack

- **Framework**: React 19.3
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Data Visualization**: Recharts
- **Build Tool**: Vite 8.3

---

## 3. Directory Layout

```
frontend/
├── public/                    # Static favicon and vector SVG icons
├── src/
│   ├── assets/                # App illustration assets
│   ├── components/            # Reusable UI widgets
│   │   ├── Footer.tsx         # Academic disclaimers and footer links
│   │   ├── GradCamViewer.tsx  # Heatmap opacity slider and split-view viewer
│   │   ├── Navbar.tsx         # Main navigation bar
│   │   └── TopPredictionsChart.tsx # Recharts probability distribution
│   ├── pages/                 # Route views
│   │   ├── ContactPage.tsx    # Feedback & research contact form
│   │   ├── DashboardPage.tsx  # Analytics KPI charts
│   │   ├── DetectPage.tsx     # Primary inference & Grad-CAM viewer
│   │   ├── HistoryPage.tsx    # Paginated prediction history
│   │   ├── HomePage.tsx       # Landing page & workflow highlights
│   │   └── MethodologyPage.tsx# Deep learning methodology & model math
│   ├── services/
│   │   └── api.ts             # Typed Axios/Fetch client for backend endpoints
│   ├── types/                 # TypeScript interfaces (Prediction, History, etc.)
│   ├── App.css
│   ├── App.tsx                # Client-side router configuration
│   ├── index.css              # Global styles and Tailwind imports
│   └── main.tsx               # React DOM entrypoint
├── .env.example               # Frontend environment template
├── index.html                 # HTML template
├── package.json               # NPM package definitions
├── tsconfig.json              # TypeScript compilation configuration
└── vite.config.ts             # Vite configuration with API reverse proxy
```

---

## 4. Environment Variables

Create `.env` or `.env.local` if custom backend endpoint is required:

```bash
VITE_API_URL=/api
```

During development, Vite proxies requests from `/api` to `http://127.0.0.1:8000`.

---

## 5. Development & Production Commands

```powershell
# Install dependencies
npm install

# Start Vite hot-reloading development server
npm run dev

# Run Oxlint / TypeScript type checking
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
