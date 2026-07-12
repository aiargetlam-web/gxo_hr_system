from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.work_regime import WorkRegime as WorkRegimeSchema

router = APIRouter(prefix="/work-regimes", tags=["Work Regimes"])

@router.get("/", response_model=list[WorkRegimeSchema])
def get_work_regimes(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.work_regime import WorkRegime
    return db.query(WorkRegime).order_by(WorkRegime.id).all()
