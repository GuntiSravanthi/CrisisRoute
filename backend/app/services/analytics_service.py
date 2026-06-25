from collections import defaultdict
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.disaster_report import DisasterReport
from app.models.shelter import Shelter
from app.schemas.analytics import AnalyticsResponse


def get_analytics(db: Session) -> AnalyticsResponse:
    reports = db.query(DisasterReport).filter(DisasterReport.status == "active").all()
    shelters = db.query(Shelter).filter(Shelter.is_active == True).all()

    reports_by_type: dict[str, int] = defaultdict(int)
    severity_distribution: dict[str, int] = defaultdict(int)
    monthly_counts: dict[str, int] = defaultdict(int)

    for report in reports:
        dtype = report.disaster_type or "Unclassified"
        reports_by_type[dtype] += 1
        severity = report.severity or "Unknown"
        severity_distribution[severity] += 1
        month_key = report.created_at.strftime("%Y-%m")
        monthly_counts[month_key] += 1

    monthly_reports = [
        {"month": month, "count": count}
        for month, count in sorted(monthly_counts.items())
    ]

    if not monthly_reports:
        current_month = datetime.utcnow().strftime("%Y-%m")
        monthly_reports = [{"month": current_month, "count": 0}]

    return AnalyticsResponse(
        total_reports=len(reports),
        reports_by_type=dict(reports_by_type),
        severity_distribution=dict(severity_distribution),
        monthly_reports=monthly_reports,
        active_shelters=len(shelters),
        total_shelter_capacity=sum(s.capacity for s in shelters),
    )
