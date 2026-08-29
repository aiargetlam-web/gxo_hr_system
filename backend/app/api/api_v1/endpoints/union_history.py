from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.session import get_db
from app.models.employee_union_history import EmployeeUnionHistory
from app.schemas.employee_union_history import UnionHistory as UnionHistorySchema
from app.schemas.employee_union_history import UnionHistoryCreate
from app.models.employee import Employee

router = APIRouter()

@router.get("/{employee_id}/unions", response_model=list[UnionHistorySchema])
def get_union_history(employee_id: int, db: Session = Depends(get_db)):
    return (
        db.query(EmployeeUnionHistory)
        .filter(EmployeeUnionHistory.employee_id == employee_id)
        .order_by(EmployeeUnionHistory.from_date.desc())
        .all()
    )


@router.post("/{employee_id}/unions", response_model=UnionHistorySchema)
def add_union(employee_id: int, payload: UnionHistoryCreate, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    current = (
        db.query(EmployeeUnionHistory)
        .filter(EmployeeUnionHistory.employee_id == employee_id,
                EmployeeUnionHistory.to_date.is_(None))
        .first()
    )

    if current:
        current.to_date = payload.from_date - timedelta(days=1)
        db.add(current)

    new_hist = EmployeeUnionHistory(
        employee_id=employee_id,
        union_id=payload.union_id,
        from_date=payload.from_date,
        note=payload.note
    )

    db.add(new_hist)
    db.commit()
    db.refresh(new_hist)

    return new_hist
