from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.site import HRSite
from app.schemas.user import User as UserSchema
from app.schemas.site import HRSiteAssign
from app.core.audit import log_activity
from app.models.audit import ActivityLog, UserHistoryLog
from app.schemas.audit import ActivityLog as ActivityLogSchema, UserHistoryLog as UserHistoryLogSchema

router = APIRouter()

@router.get("/hr-users", response_model=List[UserSchema])
def get_hr_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    """Get all HR users (Admin only)."""
    return db.query(User).filter(User.role == "hr").all()

@router.put("/hr-sites/{hr_id}")
def assign_hr_sites(
    *,
    db: Session = Depends(deps.get_db),
    hr_id: int,
    assignment: HRSiteAssign,
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    """Assign sites to an HR user (Admin only)."""
    hr_user = db.query(User).filter(User.id == hr_id, User.role == "hr").first()
    if not hr_user:
        raise HTTPException(status_code=404, detail="HR User not found")
        
    # Rimuovi assegnazioni precedenti
    db.query(HRSite).filter(HRSite.hr_id == hr_id).delete()
    
    # Aggiungi nuove assegnazioni
    for sid in assignment.site_ids:
        db.add(HRSite(hr_id=hr_id, site_id=sid))
        
    db.commit()

    log_activity(db, current_user, "Assign HR Sites", "User", hr_id)

    return {"message": "Sites assigned successfully"}

@router.get("/activity-logs", response_model=List[ActivityLogSchema])
def get_activity_logs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    """Get all activity logs (Admin only)."""
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).all()

@router.get("/user-history", response_model=List[UserHistoryLogSchema])
def get_user_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    """Get user history logs (Admin only)."""
    return db.query(UserHistoryLog).order_by(UserHistoryLog.created_at.desc()).all()
