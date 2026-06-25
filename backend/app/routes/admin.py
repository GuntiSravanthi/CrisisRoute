from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.disaster_report import DisasterReport
from app.models.shelter import Shelter
from app.models.user import User
from app.schemas.disaster import DisasterReportResponse
from app.schemas.shelter import ShelterCreate, ShelterResponse, ShelterUpdate
from app.services.analytics_service import get_analytics
from app.utils.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


def _serialize_report(report: DisasterReport, db: Session) -> DisasterReportResponse:
    user = db.query(User).filter(User.id == report.user_id).first()
    from app.schemas.disaster import DisasterReportResponse as DRR

    data = DRR.model_validate(report)
    data.reporter_name = user.full_name if user else "Unknown"
    return data


@router.get("/reports", response_model=list[DisasterReportResponse])
def admin_list_reports(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    reports = db.query(DisasterReport).order_by(DisasterReport.created_at.desc()).all()
    return [_serialize_report(r, db) for r in reports]


@router.delete("/reports/{report_id}")
def admin_delete_report(report_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    report = db.query(DisasterReport).filter(DisasterReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = "removed"
    db.commit()
    return {"message": "Report marked as removed"}


@router.get("/shelters", response_model=list[ShelterResponse])
def admin_list_shelters(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    shelters = db.query(Shelter).order_by(Shelter.created_at.desc()).all()
    return [ShelterResponse.model_validate(s) for s in shelters]


@router.post("/shelters", response_model=ShelterResponse, status_code=201)
def admin_create_shelter(
    shelter_data: ShelterCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    shelter = Shelter(**shelter_data.model_dump())
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return ShelterResponse.model_validate(shelter)


@router.put("/shelters/{shelter_id}", response_model=ShelterResponse)
def admin_update_shelter(
    shelter_id: int,
    shelter_data: ShelterUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")

    for field, value in shelter_data.model_dump(exclude_unset=True).items():
        setattr(shelter, field, value)

    db.commit()
    db.refresh(shelter)
    return ShelterResponse.model_validate(shelter)


@router.get("/analytics")
def admin_analytics(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return get_analytics(db)


@router.get("/users/count")
def admin_user_count(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    count = db.query(User).count()
    return {"total_users": count}
