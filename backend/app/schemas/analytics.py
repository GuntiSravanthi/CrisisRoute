from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    latitude: float | None = None
    longitude: float | None = None


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str]


class AnalyticsResponse(BaseModel):
    total_reports: int
    reports_by_type: dict[str, int]
    severity_distribution: dict[str, int]
    monthly_reports: list[dict]
    active_shelters: int
    total_shelter_capacity: int
