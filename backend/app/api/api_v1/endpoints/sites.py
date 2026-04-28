from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.site import Site
from app.schemas.site import Site as SiteSchema
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[SiteSchema])
def get_sites(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get all sites."""
    return db.query(Site).all()
