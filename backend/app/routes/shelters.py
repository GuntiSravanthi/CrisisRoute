from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.shelter import Shelter
from app.schemas.shelter import ShelterCreate, ShelterResponse, ShelterUpdate
from app.utils.auth import get_current_admin, get_current_user
from app.utils.geo import haversine_distance

router = APIRouter(prefix="/api/shelters", tags=["Shelters"])


@router.get("", response_model=list[ShelterResponse])
def list_shelters(
    latitude: float | None = None,
    longitude: float | None = None,
    db: Session = Depends(get_db),
):
    shelters = db.query(Shelter).filter(Shelter.is_active == True).all()
    results = []

    for shelter in shelters:
        data = ShelterResponse.model_validate(shelter)
        if latitude is not None and longitude is not None:
            data.distance_km = haversine_distance(latitude, longitude, shelter.latitude, shelter.longitude)
        results.append(data)

    if latitude is not None and longitude is not None:
        results.sort(key=lambda s: s.distance_km or float("inf"))

    return results


@router.get("/{shelter_id}", response_model=ShelterResponse)
def get_shelter(shelter_id: int, db: Session = Depends(get_db)):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    return ShelterResponse.model_validate(shelter)


@router.post("", response_model=ShelterResponse, status_code=201)
def create_shelter(
    shelter_data: ShelterCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    shelter = Shelter(**shelter_data.model_dump())
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return ShelterResponse.model_validate(shelter)


@router.put("/{shelter_id}", response_model=ShelterResponse)
def update_shelter(
    shelter_id: int,
    shelter_data: ShelterUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    for field, value in shelter_data.model_dump(exclude_unset=True).items():
        setattr(shelter, field, value)

    db.commit()
    db.refresh(shelter)
    return ShelterResponse.model_validate(shelter)


@router.delete("/{shelter_id}")
def delete_shelter(
    shelter_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    shelter.is_active = False
    db.commit()
    return {"message": "Shelter deactivated successfully"}
