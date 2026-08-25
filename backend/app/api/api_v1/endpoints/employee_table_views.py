from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# ⭐ Import diretto del MODELLO SQLAlchemy (come fanno gli altri endpoint)
from app.models.employee_table_view import EmployeeTableView

from app.api import deps

# ⭐ Import degli SCHEMI Pydantic
from app.schemas.employee_table_view import (
    EmployeeTableView as EmployeeTableViewSchema,
    EmployeeTableViewCreate,
    EmployeeTableViewUpdate,
)

router = APIRouter()

# ============================================================
# GET — tutte le viste dell’utente
# ============================================================
@router.get("/{user_id}", response_model=List[EmployeeTableViewSchema])
def get_employee_table_views(
    user_id: int,
    db: Session = Depends(deps.get_db),
):
    views = (
        db.query(EmployeeTableView)
        .filter(EmployeeTableView.user_id == user_id)
        .all()
    )

    # ⭐ VISTA DI DEFAULT SE NON ESISTONO VISTE SALVATE
    if not views:
        default_view = EmployeeTableViewSchema(
            id=0,
            user_id=user_id,
            name="Default",
            columns=[
                "avatar",
                "name",
                "email",
                "phone",
                "fiscal_code",
                "protected",
                "disadvantaged",
                "role",
                "department",
                "site",
                "contract",
                "status",
                "ral",
                "car",
                "hire_date",
                "termination_date"
            ]
        )
        return [default_view]

    return views


# ============================================================
# POST — crea una nuova vista
# ============================================================
@router.post("", response_model=EmployeeTableViewSchema)
def create_employee_table_view(
    payload: EmployeeTableViewCreate,
    db: Session = Depends(deps.get_db),
):
    new_view = EmployeeTableView(
        user_id=payload.user_id,
        name=payload.name,
        columns=payload.columns,
    )
    db.add(new_view)
    db.commit()
    db.refresh(new_view)
    return new_view


# ============================================================
# PUT — aggiorna una vista esistente
# ============================================================
@router.put("/{view_id}", response_model=EmployeeTableViewSchema)
def update_employee_table_view(
    view_id: int,
    payload: EmployeeTableViewUpdate,
    db: Session = Depends(deps.get_db),
):
    view = (
        db.query(EmployeeTableView)
        .filter(EmployeeTableView.id == view_id)
        .first()
    )

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
@router.delete("/{view_id}")
def delete_employee_table_view(
    view_id: int,
    db: Session = Depends(deps.get_db),
):
    view = (
        db.query(EmployeeTableView)
        .filter(EmployeeTableView.id == view_id)
        .first()
    )

    if not view:
        raise HTTPException(status_code=404, detail="Vista non trovata")

    db.delete(view)
    db.commit()

    return {"detail": "Vista eliminata correttamente"}
