from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.department import Department as DepartmentSchema
from app.models.department import Department

router = APIRouter()

@router.get("/", response_model=list[DepartmentSchema])
def get_departments(
    site_id: int,  # <-- OBBLIGATORIO
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user),
):
    departments = (
        db.query(Department)
        .filter(Department.site_id == site_id)
        .order_by(Department.id)
        .all()
    )

    return departments
