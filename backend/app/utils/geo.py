import math


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two coordinates."""
    radius = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(radius * c, 2)


def get_severity_from_confidence(confidence: float) -> str:
    if confidence >= 0.75:
        return "High"
    if confidence >= 0.45:
        return "Medium"
    return "Low"


def get_marker_color(severity: str | None) -> str:
    mapping = {"High": "red", "Medium": "orange", "Low": "yellow"}
    return mapping.get(severity or "Low", "yellow")
