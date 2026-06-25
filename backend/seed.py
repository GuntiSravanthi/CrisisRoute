"""Seed database with admin user, sample shelters, and demo reports."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.shelter import Shelter
from app.models.disaster_report import DisasterReport
from app.utils.auth import get_password_hash


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if not db.query(User).filter(User.email == "admin@crisisroute.com").first():
            admin = User(
                email="admin@crisisroute.com",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                phone="9999999999",
                is_admin=True,
            )
            db.add(admin)

        if not db.query(User).filter(User.email == "user@crisisroute.com").first():
            user = User(
                email="user@crisisroute.com",
                full_name="Demo User",
                hashed_password=get_password_hash("user123"),
                phone="9876543210",
                is_admin=False,
            )
            db.add(user)

        db.commit()

        if db.query(Shelter).count() == 0:
            shelters = [
                Shelter(
                    name="Central Emergency Shelter",
                    address="123 Relief Avenue, Mumbai",
                    latitude=19.0760,
                    longitude=72.8777,
                    capacity=500,
                    current_occupancy=120,
                    contact_number="022-12345678",
                    facilities="Medical, Food, Water, Power Backup",
                ),
                Shelter(
                    name="Riverside Safe Zone",
                    address="45 Flood Relief Road, Pune",
                    latitude=18.5204,
                    longitude=73.8567,
                    capacity=300,
                    current_occupancy=45,
                    contact_number="020-87654321",
                    facilities="Food, Water, Temporary Beds",
                ),
                Shelter(
                    name="Highland Refuge Center",
                    address="78 Hilltop Lane, Nashik",
                    latitude=19.9975,
                    longitude=73.7898,
                    capacity=200,
                    current_occupancy=30,
                    contact_number="0253-11223344",
                    facilities="Medical, Sanitation, Communication",
                ),
                Shelter(
                    name="Coastal Cyclone Shelter",
                    address="12 Seafront Road, Chennai",
                    latitude=13.0827,
                    longitude=80.2707,
                    capacity=800,
                    current_occupancy=200,
                    contact_number="044-99887766",
                    facilities="Reinforced Structure, Food, Medical",
                ),
                Shelter(
                    name="Urban Disaster Hub",
                    address="90 Metro Circle, Delhi",
                    latitude=28.6139,
                    longitude=77.2090,
                    capacity=600,
                    current_occupancy=150,
                    contact_number="011-55443322",
                    facilities="Full Emergency Services",
                ),
            ]
            db.add_all(shelters)

        if db.query(DisasterReport).count() == 0:
            demo_user = db.query(User).filter(User.email == "user@crisisroute.com").first()
            if demo_user:
                reports = [
                    DisasterReport(
                        user_id=demo_user.id,
                        title="Urban Flooding - Low Lying Area",
                        description="Heavy rainfall caused waterlogging in residential areas. Multiple houses affected.",
                        latitude=19.0896,
                        longitude=72.8656,
                        location_name="Andheri East, Mumbai",
                        disaster_type="Flood",
                        confidence=0.82,
                        severity="High",
                    ),
                    DisasterReport(
                        user_id=demo_user.id,
                        title="Forest Fire Alert",
                        description="Smoke visible from hillside. Fire spreading toward nearby village.",
                        latitude=18.5362,
                        longitude=73.8451,
                        location_name="Sinhagad, Pune",
                        disaster_type="Fire",
                        confidence=0.78,
                        severity="High",
                    ),
                    DisasterReport(
                        user_id=demo_user.id,
                        title="Road Blocked by Debris",
                        description="Landslide debris blocking main highway. Traffic diverted.",
                        latitude=19.9615,
                        longitude=73.7588,
                        location_name="Trimbakeshwar, Nashik",
                        disaster_type="Landslide",
                        confidence=0.65,
                        severity="Medium",
                    ),
                    DisasterReport(
                        user_id=demo_user.id,
                        title="Cyclone Roof Damage",
                        description="Strong winds damaged rooftops and uprooted trees in coastal area.",
                        latitude=13.0500,
                        longitude=80.2500,
                        location_name="Marina Beach Area, Chennai",
                        disaster_type="Cyclone Damage",
                        confidence=0.71,
                        severity="Medium",
                    ),
                    DisasterReport(
                        user_id=demo_user.id,
                        title="Building Structural Cracks",
                        description="Earth tremors caused visible cracks in apartment building walls.",
                        latitude=28.6304,
                        longitude=77.2177,
                        location_name="Connaught Place, Delhi",
                        disaster_type="Earthquake Damage",
                        confidence=0.58,
                        severity="Medium",
                    ),
                ]
                db.add_all(reports)

        db.commit()
        print("Database seeded successfully!")
        print("Admin: admin@crisisroute.com / admin123")
        print("User:  user@crisisroute.com / user123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
