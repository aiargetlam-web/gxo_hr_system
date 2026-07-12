from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.employee import Employee as EmployeeSchema

router = APIRouter(prefix="/employees/preposti", tags=["Preposti"])

@router.get("/", response_model=list[EmployeeSchema])
def get_preposti(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.employee import Employee

    # Adatta i role_id ai tuoi ruoli reali
    return db.query(Employee).filter(Employee.role_id.in_([2, 3])).all()
