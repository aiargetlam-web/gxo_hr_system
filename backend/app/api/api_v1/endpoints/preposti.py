from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.employee import Employee as EmployeeSchema
from app.models.employee import Employee

router = APIRouter(prefix="/preposti", tags=["Preposti"])

@router.get("/", response_model=list[EmployeeSchema])
def get_preposti(
    site_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    return (
        db.query(Employee)
        .filter(
            Employee.preposto == True,
            Employee.current_site_id == site_id
        )
        .order_by(Employee.last_name)
        .all()
    )
