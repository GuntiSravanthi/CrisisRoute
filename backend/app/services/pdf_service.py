import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.models.disaster_report import DisasterReport


def generate_disaster_pdf(report: DisasterReport, reporter_name: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    elements = []

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Heading1"],
        fontSize=22,
        textColor=colors.HexColor("#DC2626"),
        spaceAfter=20,
    )
    elements.append(Paragraph("CRISISROUTE - Disaster Report", title_style))
    elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    data = [
        ["Report ID", str(report.id)],
        ["Title", report.title],
        ["Reporter", reporter_name],
        ["Location", report.location_name],
        ["Coordinates", f"{report.latitude:.4f}, {report.longitude:.4f}"],
        ["Disaster Type", report.disaster_type or "Pending Analysis"],
        ["Confidence", f"{(report.confidence or 0) * 100:.1f}%"],
        ["Severity", report.severity or "Unknown"],
        ["Status", report.status],
        ["Reported At", report.created_at.strftime("%Y-%m-%d %H:%M")],
    ]

    table = Table(data, colWidths=[2 * inch, 4 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#1E293B")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
        ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#F8FAFC")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("<b>Description</b>", styles["Heading2"]))
    elements.append(Paragraph(report.description.replace("\n", "<br/>"), styles["Normal"]))
    elements.append(Spacer(1, 0.5 * inch))

    footer_style = ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.grey)
    elements.append(Paragraph("CrisisRoute - AI-Powered Disaster Assistance Platform", footer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
