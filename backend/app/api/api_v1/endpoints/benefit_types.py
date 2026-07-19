from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.benefit_type import BenefitType as BenefitTypeSchema

router = APIRouter(tags=["Benefit Types"])

@router.get("/", response_model=list[BenefitTypeSchema])
def get_benefit_types(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.benefit_type import BenefitType
    return db.query(BenefitType).order_by(BenefitType.id).all()
