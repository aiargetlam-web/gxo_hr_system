from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
import re
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    id_lul: Optional[str] = None
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str
    role: Optional[str] = 'user'
    site_id: Optional[int] = None

    @field_validator('password')
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

class UserUpdate(UserBase):
    password: Optional[str] = None
    site_id: Optional[int] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
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

class UserInDBBase(UserBase):
    id: int
    role: str
    site_id: Optional[int] = None
    id_lul: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass
