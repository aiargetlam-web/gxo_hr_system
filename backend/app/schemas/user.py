from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.schemas.role import Role
from app.schemas.site import SiteOut

# ---------------------------------------------------------
# BASE (campi comuni, usato da Create/Update/DB)
# ---------------------------------------------------------
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    id_lul: Optional[str] = None
    role_id: Optional[int] = None
    site_id: Optional[int] = None


# ---------------------------------------------------------
# CREATE (tutti obbligatori)
# ---------------------------------------------------------
class UserCreate(UserBase):
    email: EmailStr
    first_name: str
    last_name: str
    phone: str
    address: str
    id_lul: str
    role_id: int
    site_id: int
    password: str = "Password123!"


# ---------------------------------------------------------
# UPDATE (tutti opzionali)
# ---------------------------------------------------------
class UserUpdate(UserBase):
    password: Optional[str] = None


# ---------------------------------------------------------
# BASE PER LETTURA DAL DB (richiesto dal backend)
# ---------------------------------------------------------
class UserInDBBase(UserBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# OUTPUT COMPLETO (usato dagli endpoint)
# ---------------------------------------------------------
class User(UserInDBBase):
    is_active: bool
    first_access: bool
    created_at: datetime
    updated_at: datetime

    # Relazioni
    role: Optional[Role] = None
    site: Optional[SiteOut] = None

    class Config:
        from_attributes = True
