from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.shift_type import ShiftType

router = APIRouter(tags=["Shift Types"])

@router.get("")
def list_shift_types(db: Session = Depends(get_db)):
    return db.query(ShiftType).all()
