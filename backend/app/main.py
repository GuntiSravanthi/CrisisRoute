import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import Base, engine
from app.routes import auth, reports, shelters, analytics, admin
from app.utils.file_handler import ensure_upload_dir

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_upload_dir()
    os.makedirs(os.path.dirname(settings.model_path), exist_ok=True)
    yield


app = FastAPI(
    title="CrisisRoute API",
    description="AI-Powered Disaster Assistance & Evacuation Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_path = ensure_upload_dir()
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")

app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(shelters.router)
app.include_router(analytics.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "name": "CrisisRoute API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
