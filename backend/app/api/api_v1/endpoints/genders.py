from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.gender import Gender as GenderSchema

router = APIRouter(tags=["Genders"])

@router.get("/", response_model=list[GenderSchema])
def get_genders(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.gender import Gender
    return db.query(Gender).order_by(Gender.id).all()
