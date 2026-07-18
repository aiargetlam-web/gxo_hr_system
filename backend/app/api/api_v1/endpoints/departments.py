from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.department import Department as DepartmentSchema

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("/", response_model=list[DepartmentSchema])
def get_departments(
    site_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.department import Department
    return (
        db.query(Department)
        .filter(Department.site_id == site_id)
        .order_by(Department.id)
        .all()
    )