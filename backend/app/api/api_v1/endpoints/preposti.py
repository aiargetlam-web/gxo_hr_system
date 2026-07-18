from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.employee import Employee as EmployeeSchema

router = APIRouter(prefix="/employees/preposti", tags=["Preposti"])

@router.get("/", response_model=list[EmployeeSchema])
def get_preposti(
    site_id: int,   # <-- il frontend deve passare il sito selezionato
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.employee import Employee

    return (
        db.query(Employee)
        .filter(
            Employee.preposto == True,
            Employee.current_site_id == site_id
        )
        .all()
    )
