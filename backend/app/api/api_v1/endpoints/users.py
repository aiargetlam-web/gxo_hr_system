import csv
import io
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.site import HRSite
from app.models.import_users_log import ImportUsersLog
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.core.audit import log_activity, log_user_history
from sqlalchemy import or_

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """Get current user."""
    return current_user

@router.get("/", response_model=List[UserSchema])
def get_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_hr_user),
    search_string: Optional[str] = None,
    is_active: Optional[bool] = None
) -> Any:
    """Get list of users (filtered by HR sites)."""
    query = db.query(User)
    
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        if not hr_site_ids:
            return []
        query = query.filter(User.site_id.in_(hr_site_ids))
        
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
        
    if search_string:
        query = query.filter(
            or_(
                User.first_name.ilike(f"%{search_string}%"),
                User.last_name.ilike(f"%{search_string}%"),
                User.email.ilike(f"%{search_string}%"),
                User.id_lul.ilike(f"%{search_string}%")
            )
        )
        
    return query.all()

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    """Create new user."""
    # HR can only create users for their sites
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        if user_in.site_id not in hr_site_ids:
            raise HTTPException(status_code=403, detail="Non puoi creare utenti in siti che non gestisci.")
            
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system.")
        
    db_obj = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        role=user_in.role or "user",
        site_id=user_in.site_id,
        id_lul=user_in.id_lul,
        is_active=True
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # Audit Log
    log_activity(db, current_user, "Create User", "User", db_obj.id)

    return db_obj

@router.patch("/{id}/toggle-status", response_model=UserSchema)
def toggle_user_status(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    is_active: bool = Query(..., description="Set user active status"),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    """Deactivate or activate a user."""
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        if user.site_id not in hr_site_ids:
            raise HTTPException(status_code=403, detail="Non hai i permessi per gestire questo utente.")
            
    old_status = user.is_active
    user.is_active = is_active
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit Logs
    log_activity(db, current_user, "Toggle User Status", "User", user.id)
    log_user_history(db, user.id, current_user.id, "is_active", old_status, is_active)

    return user

@router.post("/import")
def import_users(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    """Import users from CSV (columns: first_name, last_name, email, role, site_id, id_lul, password)."""
    
    content = file.file.read().decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(content))
    
    rows_processed = 0
    rows_failed = 0
    error_details = []
    
    hr_site_ids = []
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
    
    for row in csv_reader:
        try:
            site_id = int(row.get('site_id')) if row.get('site_id') else None
            
            if current_user.role == "hr" and site_id not in hr_site_ids:
                raise ValueError(f"Sito {site_id} non autorizzato.")
                
            db_obj = User(
                email=row.get('email'),
                password_hash=get_password_hash(row.get('password', 'Password123!')),
                first_name=row.get('first_name'),
                last_name=row.get('last_name'),
                role=row.get('role', 'user'),
                site_id=site_id,
                id_lul=row.get('id_lul'),
                is_active=True
            )
            db.add(db_obj)
            rows_processed += 1
        except Exception as e:
            rows_failed += 1
            error_details.append(f"Errore su riga {row.get('email', 'Sconosciuto')}: {str(e)}")
            
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Errore fatale salvataggio DB: {str(e)}")
        
    log = ImportUsersLog(
        hr_author_id=current_user.id,
        file_name=file.filename,
        rows_processed=rows_processed,
        rows_failed=rows_failed,
        error_details="; ".join(error_details)
    )
    db.add(log)
    db.commit()
    
    return {
        "message": "Import completed",
        "rows_processed": rows_processed,
        "rows_failed": rows_failed,
        "errors": error_details
    }
