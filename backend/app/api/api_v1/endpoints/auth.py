from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, EmailStr, field_validator
import re

from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.employee import Employee as EmployeeSchema

router = APIRouter()

# ---------------------------------------------------------
# LOGIN
# ---------------------------------------------------------
@router.post("/login", response_model=Any)
def login_access_token(
    db: Session = Depends(deps.get_db),
    email: str = Body(...),
    password: str = Body(...)
) -> Any:
    from app.models.employee import Employee

    user = db.query(Employee).filter(Employee.email == email).first()

    if not user or not security.verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    if getattr(user, "first_access", False):
        return {
            "requires_password_change": True,
            "message": "Primo accesso: è necessario cambiare la password."
        }

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ---------------------------------------------------------
# UTENTE LOGGATO
# ---------------------------------------------------------
@router.get("/me", response_model=EmployeeSchema)
def read_current_user(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    from app.models.employee import Employee

    user = (
        db.query(Employee)
        .options(
            joinedload(Employee.current_site),
            joinedload(Employee.role)
        )
        .filter(Employee.id == current_user.id)
        .first()
    )
    return user


# ---------------------------------------------------------
# FORGOT PASSWORD
# ---------------------------------------------------------
class ForgotPassword(BaseModel):
    email: EmailStr


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPassword,
    db: Session = Depends(deps.get_db)
) -> Any:
    from app.models.employee import Employee

    user = db.query(Employee).filter(Employee.email == data.email).first()
    if user:
        print(
            f"DEBUG: Reset password email sent to {user.email} "
            f"with reset token: FAKE_RESET_TOKEN"
        )

    return {"message": "If the email is registered, a password reset link has been sent."}


# ---------------------------------------------------------
# RESET PASSWORD
# ---------------------------------------------------------
class ResetPassword(BaseModel):
    token: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('La password deve contenere almeno 8 caratteri')
        if not re.search(r"[A-Z]", v):
            raise ValueError('La password deve contenere almeno una lettera maiuscola')
        if not re.search(r"[a-z]", v):
            raise ValueError('La password deve contenere almeno una lettera minuscola')
        if not re.search(r"\d", v):
            raise ValueError('La password deve contenere almeno un numero')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('La password deve contenere almeno un carattere speciale')
        return v


@router.post("/reset-password")
def reset_password(
    data: ResetPassword,
    db: Session = Depends(deps.get_db)
) -> Any:
    from app.models.employee import Employee

    if data.token != "FAKE_RESET_TOKEN":
        raise HTTPException(status_code=400, detail="Invalid token")

    user = db.query(Employee).filter(Employee.id == 1).first()
    if user:
        user.password_hash = security.get_password_hash(data.new_password)
        db.commit()
        return {"message": "Password updated successfully"}

    raise HTTPException(status_code=404, detail="User not found")


# ---------------------------------------------------------
# CAMBIO PASSWORD PRIMO ACCESSO
# ---------------------------------------------------------
class ChangePassword(BaseModel):
    email: EmailStr
    old_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('La password deve contenere almeno 8 caratteri')
        if not re.search(r"[A-Z]", v):
            raise ValueError('La password deve contenere almeno una lettera maiuscola')
        if not re.search(r"[a-z]", v):
            raise ValueError('La password deve contenere almeno una lettera minuscola')
        if not re.search(r"\d", v):
            raise ValueError('La password deve contenere almeno un numero')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('La password deve contenere almeno un carattere speciale')
        return v


@router.post("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(deps.get_db)
) -> Any:
    from app.models.employee import Employee

    user = db.query(Employee).filter(Employee.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not security.verify_password(data.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Old password is incorrect")

    user.password_hash = security.get_password_hash(data.new_password)
    user.first_access = False

    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Password changed successfully"}
