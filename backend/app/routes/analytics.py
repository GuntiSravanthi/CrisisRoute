from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.analytics import AnalyticsResponse, ChatRequest, ChatResponse
from app.services.analytics_service import get_analytics
from app.services.emergency_assistant import generate_emergency_response
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Analytics & Assistant"])


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(db: Session = Depends(get_db)):
    return get_analytics(db)


@router.post("/assistant/chat", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    result = generate_emergency_response(request.message, db, request.latitude, request.longitude)
    return ChatResponse(**result)
