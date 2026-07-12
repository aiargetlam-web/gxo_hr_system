from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.contract_nature import ContractNature as ContractNatureSchema

router = APIRouter(prefix="/contract-natures", tags=["Contract Natures"])

@router.get("/", response_model=list[ContractNatureSchema])
def get_contract_natures(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.contract_nature import ContractNature
    return db.query(ContractNature).order_by(ContractNature.id).all()
