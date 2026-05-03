import csv
import io
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.api import deps
from app.models.user import User
from app.models.site import HRSite
from app.models.import_users_log import ImportUsersLog
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.core.audit import log_activity, log_user_history

router = APIRouter()

# ============================================================
# GET CURRENT USER
# ============================================================

@router.get("/me", response_model=UserSchema)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    return current_user


# ============================================================
# GET USERS (ADMIN = totale, HR = solo i propri siti)
# ============================================================

@router.get("/", response_model=List[UserSchema])
def get_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    search_string: Optional[str] = None,
    is_active: Optional[bool] = None
) -> Any:

    # ADMIN → accesso totale
    if current_user.role and current_user.role.name == "admin":
        query = (
            db.query(User)
            .options(
                joinedload(User.role),
                joinedload(User.site)
            )
        )

    # HR → accesso limitato ai propri siti
    elif current_user.role and current_user.role.name == "hr":
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        ]
        if not hr_site_ids:
            return []

        query = (
            db.query(User)
            .options(
                joinedload(User.role),
                joinedload(User.site)
            )
            .filter(User.site_id.in_(hr_site_ids))
        )

    # ALTRI RUOLI → vietato
    else:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    # Filtri opzionali
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


# ============================================================
# CREATE USER
# ============================================================

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:

    # ADMIN → accesso totale
    if current_user.role and current_user.role.name == "admin":
        pass

    # HR → solo i propri siti
    elif current_user.role and current_user.role.name == "hr":
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        ]
        if user_in.site_id not in hr_site_ids:
            raise HTTPException(status_code=403, detail="Non puoi creare utenti in siti che non gestisci.")

    else:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    # Email duplicata
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="The user with this email already exists in the system.")

    # Creazione utente
    db_obj = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password or "Password123!"),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone,
        address=user_in.address,
        role_id=user_in.role_id,
        site_id=user_in.site_id,
        id_lul=user_in.id_lul,
        is_active=True,
        first_access=True
    )

    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    log_activity(db, current_user, "Create User", "User", db_obj.id)

    return db_obj


# ============================================================
# TOGGLE STATUS
# ============================================================

@router.patch("/{id}/toggle-status", response_model=UserSchema)
def toggle_user_status(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    is_active: bool = Query(...),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:

    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ADMIN → accesso totale
    if current_user.role and current_user.role.name == "admin":
        pass

    # HR → solo i propri siti
    elif current_user.role and current_user.role.name == "hr":
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        ]
        if user.site_id not in hr_site_ids:
            raise HTTPException(status_code=403, detail="Non hai i permessi per gestire questo utente.")

    else:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    old_status = user.is_active
    user.is_active = is_active

    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(db, current_user, "Toggle User Status", "User", user.id)
    log_user_history(db, user.id, current_user.id, "is_active", old_status, is_active)

    return user


# ============================================================
# RESET PASSWORD
# ============================================================

@router.patch("/{id}/reset-password", response_model=UserSchema)
def reset_password(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user)
):

    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ADMIN → accesso totale
    if current_user.role and current_user.role.name == "admin":
        pass

    # HR → solo i propri siti
    elif current_user.role and current_user.role.name == "hr":
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        ]
        if user.site_id not in hr_site_ids:
            raise HTTPException(status_code=403, detail="Non hai i permessi per questo utente.")

    else:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    new_password = "Password123!"
    user.password_hash = get_password_hash(new_password)
    user.first_access = True

    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(db, current_user, "Reset Password", "User", user.id)
    log_user_history(db, user.id, current_user.id, "password_reset", None, "Password123!")

    return user


# ============================================================
# IMPORT CSV
# ============================================================

@router.post("/import")
def import_users(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:

    # ADMIN → accesso totale
    if current_user.role and current_user.role.name == "admin":
        pass

    # HR → solo i propri siti
    elif current_user.role and current_user.role.name == "hr":
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        ]
    else:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    content = file.file.read().decode('utf-8')
    csv_reader = csv.DictReader(io.StringIO(content))

    rows_processed = 0
    rows_failed = 0
    error_details = []

    for row in csv_reader:
        try:
            site_id = int(row.get('site_id')) if row.get('site_id') else None

            if current_user.role.name == "hr" and site_id not in hr_site_ids:
                raise ValueError(f"Sito {site_id} non autorizzato.")

            db_obj = User(
                email=row.get('email'),
                password_hash=get_password_hash(row.get('password', 'Password123!')),
                first_name=row.get('first_name'),
                last_name=row.get('last_name'),
                role_id=None,
                site_id=site_id,
                id_lul=row.get('id_lul'),
                is_active=True,
                first_access=True
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


# ============================================================
# UPDATE USER
# ============================================================

@router.patch("/{id}", response_model=UserSchema)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:

    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ADMIN → accesso totale
    if current_user.role and current_user.role.name == "admin":
        pass

    # HR → solo i propri siti
    elif current_user.role and current_user.role.name == "hr":
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        ]
        if user.site_id not in hr_site_ids:
            raise HTTPException(status_code=403, detail="Non hai i permessi per modificare questo utente.")

    else:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    # Aggiorna i campi
    if user_in.first_name is not None:
        user.first_name = user_in.first_name

    if user_in.last_name is not None:
        user.last_name = user_in.last_name   # FIX QUI

    if user_in.email is not None:
        user.email = user_in.email

    if user_in.role_id is not None:
        user.role_id = user_in.role_id

    if user_in.site_id is not None:
        user.site_id = user_in.site_id

    if user_in.id_lul is not None:
        user.id_lul = user_in.id_lul

    if user_in.phone is not None:
        user.phone = user_in.phone

    if user_in.address is not None:
        user.address = user_in.address

    if user_in.password is not None:
        user.password_hash = get_password_hash(user_in.password)
        user.first_access = True

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
