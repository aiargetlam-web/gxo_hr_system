from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app import models
from app.api import deps

# Import diretto dei modelli Pydantic (così NON serve __init__.py)
from app.schemas.employee_table_views import (
    EmployeeTableView,
    EmployeeTableViewCreate,
    EmployeeTableViewUpdate
)

router = APIRouter()

# ============================================================
# GET — tutte le viste dell’utente
# ============================================================
@router.get("/employee-table-views/{user_id}", response_model=List[EmployeeTableView])
def get_employee_table_views(
    user_id: int,
    db: Session = Depends(deps.get_db)
):
    views = db.query(models.EmployeeTableView).filter(models.EmployeeTableView.user_id == user_id).all()
    return views


# ============================================================
# POST — crea una nuova vista
# ============================================================
@router.post("/employee-table-views", response_model=EmployeeTableView)
def create_employee_table_view(
    payload: EmployeeTableViewCreate,
    db: Session = Depends(deps.get_db)
):
    new_view = models.EmployeeTableView(
        user_id=payload.user_id,
        name=payload.name,
        columns=payload.columns
    )
    db.add(new_view)
    db.commit()
    db.refresh(new_view)
    return new_view


# ============================================================
# PUT — aggiorna una vista esistente
# ============================================================
@router.put("/employee-table-views/{view_id}", response_model=EmployeeTableView)
def update_employee_table_view(
    view_id: int,
    payload: EmployeeTableViewUpdate,
    db: Session = Depends(deps.get_db)
):
    view = db.query(models.EmployeeTableView).filter(models.EmployeeTableView.id == view_id).first()

    if not view:
        raise HTTPException(status_code=404, detail="Vista non trovata")

    view.name = payload.name
    view.columns = payload.columns

    db.commit()
    db.refresh(view)
    return view


# ============================================================
# DELETE — elimina una vista
# ============================================================
@router.delete("/employee-table-views/{view_id}")
def delete_employee_table_view(
    view_id: int,
    db: Session = Depends(deps.get_db)
):
    view = db.query(models.EmployeeTableView).filter(models.EmployeeTableView.id == view_id).first()

    if not view:
        raise HTTPException(status_code=404, detail="Vista non trovata")

    db.delete(view)
    db.commit()

    return {"detail": "Vista eliminata correttamente"}
