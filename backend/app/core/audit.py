from sqlalchemy.orm import Session
from app.models.audit import ActivityLog, UserHistoryLog
from app.models.user import User

def log_activity(db: Session, user: User, action: str, entity_type: str = None, entity_id: int = None, ip_address: str = None):
    """Log an action performed by an HR or Admin user."""
    log = ActivityLog(
        user_id=user.id,
        role=user.role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        ip_address=ip_address
    )
    db.add(log)
    db.commit()

def log_user_history(db: Session, target_user_id: int, modified_by_id: int, field_name: str, old_value: str, new_value: str):
    """Log a change to a user's sensitive data."""
    if str(old_value) == str(new_value):
        return # Skip if no real change

    log = UserHistoryLog(
        target_user_id=target_user_id,
        modified_by_id=modified_by_id,
        field_name=field_name,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None
    )
    db.add(log)
    db.commit()
