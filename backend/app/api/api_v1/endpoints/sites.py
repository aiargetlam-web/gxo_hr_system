from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.site import SiteDict   # <-- QUI CAMBIATO

router = APIRouter()

@router.get("/", response_model=List[SiteDict])   # <-- QUI CAMBIATO
def get_sites(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
) -> Any:
    """Get all sites."""
    from app.models.site import Site
    return db.query(Site).all()
