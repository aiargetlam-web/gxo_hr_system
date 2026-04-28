from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from pydantic import BaseModel, EmailStr, field_validator
import re

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    Using email as username.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
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
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.id, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

class ForgotPassword(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPassword,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Simulate forgot password flow. In a real app this sends an email with a reset token.
    """
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        # Simulate generating token and sending email
        print(f"DEBUG: Reset password email sent to {user.email} with reset token: FAKE_RESET_TOKEN")
    
    return {"message": "If the email is registered, a password reset link has been sent."}

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
    """
    Simulate reset password using token.
    """
    # In a real app, you would verify the token here
    if data.token != "FAKE_RESET_TOKEN":
        raise HTTPException(status_code=400, detail="Invalid token")
        
    # We would need the user email or ID from the token. Assuming ID 1 for simulation.
    user = db.query(User).filter(User.id == 1).first()
    if user:
        user.password_hash = security.get_password_hash(data.new_password)
        db.commit()
        return {"message": "Password updated successfully"}
    
    raise HTTPException(status_code=404, detail="User not found")
