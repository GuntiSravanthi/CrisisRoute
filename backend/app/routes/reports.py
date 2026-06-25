from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.disaster_report import DisasterReport
from app.models.user import User
from app.schemas.disaster import AIPredictionResponse, DisasterReportResponse
from app.ai.predictor import get_predictor
from app.services.pdf_service import generate_disaster_pdf
from app.utils.auth import get_current_user
from app.utils.file_handler import save_upload_file

router = APIRouter(prefix="/api/reports", tags=["Disaster Reports"])
settings = get_settings()


def _serialize_report(report: DisasterReport, db: Session) -> DisasterReportResponse:
    user = db.query(User).filter(User.id == report.user_id).first()
    data = DisasterReportResponse.model_validate(report)
    data.reporter_name = user.full_name if user else "Unknown"
    return data


@router.post("", response_model=DisasterReportResponse, status_code=201)
async def create_report(
    title: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: str = Form(...),
    image: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image_path = None
    disaster_type = None
    confidence = None
    severity = None

    if image and image.filename:
        image_path = await save_upload_file(image)
        try:
            predictor = get_predictor(settings.model_path)
            prediction = predictor.predict(image_path)
            disaster_type = prediction["disaster_type"]
            confidence = prediction["confidence"]
            severity = prediction["severity"]
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Image analysis failed: {str(exc)}")

    report = DisasterReport(
        user_id=current_user.id,
        title=title,
        description=description,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name,
        image_path=image_path,
        disaster_type=disaster_type,
        confidence=confidence,
        severity=severity,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return _serialize_report(report, db)


@router.get("", response_model=list[DisasterReportResponse])
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(DisasterReport).filter(DisasterReport.status == "active").order_by(DisasterReport.created_at.desc()).all()
    return [_serialize_report(r, db) for r in reports]


@router.get("/my", response_model=list[DisasterReportResponse])
def my_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = (
        db.query(DisasterReport)
        .filter(DisasterReport.user_id == current_user.id)
        .order_by(DisasterReport.created_at.desc())
        .all()
    )
    return [_serialize_report(r, db) for r in reports]


@router.get("/{report_id}", response_model=DisasterReportResponse)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(DisasterReport).filter(DisasterReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return _serialize_report(report, db)


@router.post("/detect", response_model=AIPredictionResponse)
async def detect_disaster(image: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No image provided")

    image_path = await save_upload_file(image)
    try:
        predictor = get_predictor(settings.model_path)
        prediction = predictor.predict(image_path)
        return AIPredictionResponse(**prediction)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Detection failed: {str(exc)}")


@router.get("/{report_id}/pdf")
def download_report_pdf(report_id: int, db: Session = Depends(get_db)):
    report = db.query(DisasterReport).filter(DisasterReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    user = db.query(User).filter(User.id == report.user_id).first()
    reporter_name = user.full_name if user else "Unknown"
    pdf_bytes = generate_disaster_pdf(report, reporter_name)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=crisisroute_report_{report_id}.pdf"},
    )
