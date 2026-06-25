import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import get_settings

settings = get_settings()


def ensure_upload_dir() -> Path:
    upload_path = Path(settings.upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


async def save_upload_file(file: UploadFile) -> str:
    upload_path = ensure_upload_dir()
    extension = Path(file.filename or "image.jpg").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp", ".bmp"}:
        extension = ".jpg"
    filename = f"{uuid.uuid4().hex}{extension}"
    file_path = upload_path / filename

    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return str(file_path)
