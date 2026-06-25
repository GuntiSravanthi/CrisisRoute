from sqlalchemy.orm import Session

from app.models.shelter import Shelter
from app.utils.geo import haversine_distance


EMERGENCY_CONTACTS = {
    "National Emergency": "112",
    "Disaster Management": "1070",
    "Fire Service": "101",
    "Ambulance": "102",
    "Police": "100",
}


DISASTER_GUIDANCE = {
    "flood": [
        "Move to higher ground immediately.",
        "Avoid walking or driving through floodwaters.",
        "Turn off electricity at the main switch if safe.",
        "Keep emergency kit, documents, and phone charged.",
        "Follow official evacuation orders without delay.",
    ],
    "fire": [
        "Evacuate immediately using nearest safe exit.",
        "Stay low to avoid smoke inhalation.",
        "Do not use elevators during fire emergencies.",
        "Call fire services and provide exact location.",
        "If trapped, seal doors with wet cloth and signal for help.",
    ],
    "landslide": [
        "Move away from slopes and unstable terrain.",
        "Watch for cracks in ground or tilting trees.",
        "Evacuate to flat open areas.",
        "Avoid river valleys below landslide zones.",
        "Stay alert for secondary slides after initial event.",
    ],
    "cyclone": [
        "Stay indoors away from windows.",
        "Secure loose objects and reinforce doors.",
        "Keep battery-powered radio for updates.",
        "Evacuate if in coastal or low-lying areas.",
        "Avoid flooded roads after cyclone passes.",
    ],
    "earthquake": [
        "Drop, Cover, and Hold On during shaking.",
        "Stay away from glass, heavy furniture, and power lines.",
        "If outdoors, move to open area away from buildings.",
        "Check for gas leaks and fire hazards after shaking stops.",
        "Use stairs, never elevators, when evacuating buildings.",
    ],
}


def find_nearest_shelter(db: Session, latitude: float, longitude: float) -> Shelter | None:
    shelters = db.query(Shelter).filter(Shelter.is_active == True).all()
    if not shelters:
        return None

    nearest = min(
        shelters,
        key=lambda s: haversine_distance(latitude, longitude, s.latitude, s.longitude),
    )
    return nearest


def generate_emergency_response(message: str, db: Session, latitude: float | None, longitude: float | None) -> dict:
    msg = message.lower().strip()
    suggestions = [
        "Nearest shelter",
        "Emergency actions during flood",
        "Emergency contacts",
        "What to do during earthquake",
        "Evacuation checklist",
    ]

    if any(word in msg for word in ["contact", "helpline", "phone", "call"]):
        contacts_text = "\n".join([f"• {name}: {number}" for name, number in EMERGENCY_CONTACTS.items()])
        return {
            "reply": f"**Emergency Contacts**\n\n{contacts_text}\n\nDial 112 for immediate national emergency assistance.",
            "suggestions": suggestions,
        }

    if any(word in msg for word in ["shelter", "nearest", "evacuate", "safe place"]):
        if latitude is not None and longitude is not None:
            shelter = find_nearest_shelter(db, latitude, longitude)
            if shelter:
                distance = haversine_distance(latitude, longitude, shelter.latitude, shelter.longitude)
                available = shelter.capacity - shelter.current_occupancy
                return {
                    "reply": (
                        f"**Nearest Shelter: {shelter.name}**\n\n"
                        f"📍 Address: {shelter.address}\n"
                        f"📏 Distance: {distance} km\n"
                        f"👥 Capacity: {shelter.capacity} (Available: {max(0, available)})\n"
                        f"📞 Contact: {shelter.contact_number}\n"
                        f"🏥 Facilities: {shelter.facilities or 'Basic amenities'}"
                    ),
                    "suggestions": suggestions,
                }
        return {
            "reply": "Enable location access or visit the Shelter Locator page to find the nearest evacuation center.",
            "suggestions": suggestions,
        }

    disaster_key = None
    if "flood" in msg:
        disaster_key = "flood"
    elif "fire" in msg:
        disaster_key = "fire"
    elif "landslide" in msg:
        disaster_key = "landslide"
    elif "cyclone" in msg:
        disaster_key = "cyclone"
    elif "earthquake" in msg:
        disaster_key = "earthquake"

    if disaster_key:
        steps = DISASTER_GUIDANCE[disaster_key]
        steps_text = "\n".join([f"{i + 1}. {step}" for i, step in enumerate(steps)])
        return {
            "reply": f"**Emergency Actions During {disaster_key.title()}**\n\n{steps_text}",
            "suggestions": suggestions,
        }

    if "checklist" in msg or "prepare" in msg:
        return {
            "reply": (
                "**Evacuation Checklist**\n\n"
                "1. Grab emergency kit (water, food, medicines)\n"
                "2. Carry ID documents and phone charger\n"
                "3. Wear sturdy shoes and weather-appropriate clothing\n"
                "4. Follow designated evacuation routes\n"
                "5. Inform family of your location\n"
                "6. Avoid flooded or damaged roads\n"
                "7. Register at nearest shelter upon arrival"
            ),
            "suggestions": suggestions,
        }

    return {
        "reply": (
            "I'm your CrisisRoute Emergency Assistant. I can help with:\n\n"
            "• Finding nearest shelters\n"
            "• Disaster-specific safety actions\n"
            "• Emergency contact numbers\n"
            "• Evacuation checklists\n\n"
            "Try asking: 'Nearest shelter' or 'Emergency actions during flood'"
        ),
        "suggestions": suggestions,
    }
