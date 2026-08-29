from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db.session import get_db
from app.models.employee_employer_history import EmployeeEmployerHistory
from app.schemas.employee_employer_history import EmployerHistory as EmployerHistorySchema
from app.schemas.employee_employer_history import EmployerHistoryCreate
from app.models.employee import Employee

router = APIRouter()

@router.get("/{employee_id}/employers", response_model=list[EmployerHistorySchema])
def get_employer_history(employee_id: int, db: Session = Depends(get_db)):
    return (
        db.query(EmployeeEmployerHistory)
        .filter(EmployeeEmployerHistory.employee_id == employee_id)
        .order_by(EmployeeEmployerHistory.from_date.desc())
        .all()
    )


@router.post("/{employee_id}/employers", response_model=EmployerHistorySchema)
def add_employer(employee_id: int, payload: EmployerHistoryCreate, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Dipendente non trovato")

    # chiudi datore attuale
    current = (
        db.query(EmployeeEmployerHistory)
        .filter(EmployeeEmployerHistory.employee_id == employee_id,
                EmployeeEmployerHistory.to_date.is_(None))
        .first()
    )

    if current:
        current.to_date = payload.from_date - timedelta(days=1)
        db.add(current)

    new_hist = EmployeeEmployerHistory(
        employee_id=employee_id,
        employer_id=payload.employer_id,
        from_date=payload.from_date,
        note=payload.note
    )

    db.add(new_hist)
    db.commit()
    db.refresh(new_hist)

    return new_hist
