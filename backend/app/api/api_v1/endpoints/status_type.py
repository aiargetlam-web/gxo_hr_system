from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.employment_status_type import EmploymentStatusType

router = APIRouter(tags=["Employment Status Types"])

@router.get("/employment-status-types")
def list_status_types(db: Session = Depends(get_db)):
    return db.query(EmploymentStatusType).all()
