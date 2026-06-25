# CrisisRoute – AI-Powered Disaster Assistance & Evacuation Platform

**CrisisRoute** is a full-stack AIML final-year project that helps citizens during floods, fires, landslides, cyclones, and earthquakes. It combines disaster reporting, AI image classification, interactive maps, shelter locator, emergency guidance, analytics, and PDF report generation.

---

## Project Highlights (Interview-Friendly)

| Area | Technology | What It Demonstrates |
|------|------------|---------------------|
| Frontend | React + Vite + Tailwind | Modern SPA, responsive dark UI |
| Backend | FastAPI + Python | REST API, JWT auth, file uploads |
| Database | PostgreSQL | Relational data, SQLAlchemy ORM |
| AI/ML | PyTorch + OpenCV | Transfer learning, image classification |
| Maps | Leaflet + OpenStreetMap | Geo visualization, markers |
| Analytics | Recharts | Dashboards, charts |
| Reports | ReportLab | PDF generation |

---

## Folder Structure

```
CrisisRoute/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py             # Application entry point
│   │   ├── config.py           # Environment settings
│   │   ├── database.py         # SQLAlchemy setup
│   │   ├── models/             # DB models (User, Report, Shelter)
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── ai/                 # PyTorch predictor
│   │   └── utils/              # Auth, geo, file helpers
│   ├── seed.py                 # Database seed script
│   ├── requirements.txt
│   └── .env.example
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/              # All application pages
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth context
│   │   └── services/           # Axios API client
│   ├── package.json
│   └── vite.config.js
├── ai_model/                   # ML model scripts
│   ├── create_model.py         # Create demo model (no dataset needed)
│   ├── train.py                # Train on custom dataset
│   ├── predict.py              # CLI prediction
│   ├── saved_model/            # Saved PyTorch weights
│   └── dataset/                # Dataset structure guide
├── database/
│   └── init.sql                # PostgreSQL setup script
└── README.md
```

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Git** (optional)

---

## Setup Guide

### Step 1: Clone / Open Project

```bash
cd CrisisRoute
```

### Step 2: PostgreSQL Database

Create the database:

```bash
psql -U postgres -f database/init.sql
```

Or manually:

```sql
CREATE DATABASE crisisroute;
```

### Step 3: Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env    # Windows
# cp .env.example .env    # Linux/Mac
```

Edit `.env` if your PostgreSQL credentials differ:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crisisroute
```

### Step 4: Create AI Model

```bash
cd ../ai_model
python create_model.py
```

This creates `ai_model/saved_model/disaster_classifier.pt` using MobileNetV2 transfer learning.

### Step 5: Seed Database

```bash
cd ../backend
python seed.py
```

**Demo Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@crisisroute.com | admin123 |
| User | user@crisisroute.com | user123 |

### Step 6: Frontend Setup

```bash
cd ../frontend
npm install
```

---

## Run Commands

Open **two terminals**:

**Terminal 1 – Backend:**
```bash
cd backend
venv\Scripts\activate          # Windows
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs

---

## Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Project overview |
| Login | `/login` | JWT authentication |
| Register | `/register` | User registration |
| Dashboard | `/dashboard` | User overview & quick actions |
| Report Disaster | `/report` | Submit disaster with image + location |
| AI Detection | `/detect` | Standalone image classification |
| Hazard Map | `/map` | OpenStreetMap with severity markers |
| Shelter Locator | `/shelters` | Nearest shelters with distance |
| Emergency Assistant | `/assistant` | AI-guided emergency help |
| Analytics | `/analytics` | Recharts dashboards |
| My Reports | `/reports` | PDF download |
| Admin Dashboard | `/admin` | Manage reports & shelters |

---

## AI Model Details

### Architecture
- **Base Model:** MobileNetV2 (ImageNet pretrained)
- **Transfer Learning:** Frozen feature extractor + custom classifier head
- **Enhancement:** OpenCV visual feature heuristics (color, edges, saturation)

### Classes (5)
1. Flood
2. Fire
3. Landslide
4. Cyclone Damage
5. Earthquake Damage

### Output
- Disaster Type
- Confidence Score (0–1)
- Severity Level (High ≥75%, Medium ≥45%, Low <45%)

### Train Custom Model

```bash
cd ai_model
python train.py --data_dir ./dataset --epochs 10
```

See `ai_model/dataset/README.md` for dataset structure.

### CLI Prediction

```bash
python predict.py --image path/to/disaster.jpg
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login (JWT) |
| GET | `/api/auth/me` | User profile |
| POST | `/api/reports` | Create disaster report |
| GET | `/api/reports` | List active reports |
| POST | `/api/reports/detect` | AI image detection |
| GET | `/api/reports/{id}/pdf` | Download PDF |
| GET | `/api/shelters` | List shelters (with distance) |
| POST | `/api/assistant/chat` | Emergency assistant |
| GET | `/api/analytics` | Analytics data |
| GET | `/api/admin/reports` | Admin: all reports |
| DELETE | `/api/admin/reports/{id}` | Admin: remove report |

---

## Map Marker Colors

| Color | Severity |
|-------|----------|
| 🔴 Red | High Risk |
| 🟠 Orange | Medium Risk |
| 🟡 Yellow | Low Risk |
| 🟢 Green | Shelters |

---

## Interview Talking Points

1. **Problem:** Citizens lack a unified platform to report disasters and find help during emergencies.
2. **Solution:** CrisisRoute integrates reporting, AI detection, maps, shelters, and guidance.
3. **AI Approach:** Transfer learning with MobileNetV2 — efficient for mobile/edge deployment.
4. **Full Stack:** React frontend ↔ FastAPI REST API ↔ PostgreSQL database.
5. **Security:** JWT authentication, role-based admin access.
6. **Scalability Path:** Can add real LLM API, SMS alerts, government API integration.

---

## Tech Stack Summary

```
Frontend:  React.js, Vite, Tailwind CSS, React Router, Axios, Recharts, React Leaflet
Backend:   FastAPI, Python, SQLAlchemy, JWT, ReportLab
Database:  PostgreSQL
AI:        PyTorch, OpenCV, MobileNetV2
Maps:      OpenStreetMap, Leaflet
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check PostgreSQL is running and `DATABASE_URL` in `.env` |
| Model not found | Run `python ai_model/create_model.py` |
| CORS error | Ensure backend runs on port 8000, frontend on 5173 |
| bcrypt error | `pip install bcrypt==4.2.1` |
| Leaflet map blank | Check internet connection (OSM tiles) |

---

## License

Educational project for AIML engineering students.

**Built with ❤️ for disaster preparedness and community safety.**
