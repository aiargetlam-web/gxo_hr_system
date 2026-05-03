from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.role import Role
from app.schemas.role import Role as RoleSchema

router = APIRouter()

# ============================================================
# GET ALL ROLES
# ============================================================

@router.get("/", response_model=list[RoleSchema])
def get_roles(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    roles = db.query(Role).order_by(Role.id).all()
    return roles


# ============================================================
# GET SINGLE ROLE
# ============================================================

@router.get("/{role_id}", response_model=RoleSchema)
def get_role(
    role_id: int,
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_user)
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role
