from pydantic import BaseModel, Field
from datetime import datetime


class ShelterCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    address: str = Field(min_length=5, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    capacity: int = Field(gt=0)
    contact_number: str = Field(min_length=5, max_length=20)
    facilities: str | None = None


class ShelterUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    capacity: int | None = None
    current_occupancy: int | None = None
    contact_number: str | None = None
    facilities: str | None = None
    is_active: bool | None = None


class ShelterResponse(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    contact_number: str
    facilities: str | None
    is_active: bool
    created_at: datetime
    distance_km: float | None = None

    class Config:
        from_attributes = True
