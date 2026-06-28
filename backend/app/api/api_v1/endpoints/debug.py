from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/cors")
def debug_cors():
    return {
        "raw": settings.CORS_ORIGINS,
        "parsed": settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else []
    }
