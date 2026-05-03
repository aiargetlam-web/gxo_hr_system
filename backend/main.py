from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.api_v1.api import api_router

# IMPORTANTE: registra i modelli (User, Role, Site)
# NON popola nulla, serve solo per evitare errori SQLAlchemy
from app.db import base

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTES
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to GXO HR System API"}

@app.get("/debug-cors")
def debug_cors():
    return {
        "raw": settings.CORS_ORIGINS,
        "list": settings.cors_origin_list
    }
