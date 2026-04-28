from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Activity Log
class ActivityLogBase(BaseModel):
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    ip_address: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    user_id: int
    role: str

class ActivityLog(ActivityLogBase):
    id: int
    user_id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# User History Log
class UserHistoryLogBase(BaseModel):
    field_name: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None

class UserHistoryLogCreate(UserHistoryLogBase):
    target_user_id: int
    modified_by_id: int

class UserHistoryLog(UserHistoryLogBase):
    id: int
    target_user_id: int
    modified_by_id: int
    created_at: datetime

    class Config:
        from_attributes = True
