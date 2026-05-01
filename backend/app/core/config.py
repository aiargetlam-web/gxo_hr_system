import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GXO HR System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super_secret_jwt_key_for_development_only_do_not_use_in_prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL")
    UPLOAD_DIR: str = "uploads"

    # Power BI Configuration
    POWERBI_TENANT_ID: str = ""
    POWERBI_CLIENT_ID: str = ""
    POWERBI_CLIENT_SECRET: str = ""
    POWERBI_WORKSPACE_ID: str = ""
    POWERBI_REPORT_ID: str = ""
    POWERBI_DATASET_ID: str = ""
    POWERBI_RLS_ROLE: str = "SiteRole"

    # CORS origins (comma-separated list from .env)
    CORS_ORIGINS: str = ""

    @property
    def cors_origin_list(self) -> List[str]:
        """
        Converts the comma-separated CORS_ORIGINS string into a clean list.
        Example:
        CORS_ORIGINS="https://site1.com,http://localhost:5173"
        → ["https://site1.com", "http://localhost:5173"]
        """
        if not self.CORS_ORIGINS:
            return []
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
