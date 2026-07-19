from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.cost_center import CostCenter as CostCenterSchema

router = APIRouter(tags=["Cost Centers"])

@router.get("/", response_model=list[CostCenterSchema])
def get_cost_centers(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.cost_center import CostCenter
    return db.query(CostCenter).order_by(CostCenter.id).all()
