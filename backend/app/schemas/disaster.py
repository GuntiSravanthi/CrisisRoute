from pydantic import BaseModel, Field
from datetime import datetime


class DisasterReportCreate(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    location_name: str = Field(min_length=2, max_length=255)


class DisasterReportResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    latitude: float
    longitude: float
    location_name: str
    image_path: str | None
    disaster_type: str | None
    confidence: float | None
    severity: str | None
    status: str
    created_at: datetime
    reporter_name: str | None = None

    class Config:
        from_attributes = True


class AIPredictionResponse(BaseModel):
    disaster_type: str
    confidence: float
    severity: str
    all_predictions: dict[str, float]
