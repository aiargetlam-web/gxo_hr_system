from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.site import Site

class BoardFileBase(BaseModel):
    pass

class BoardFileCreate(BoardFileBase):
    site_ids: List[int]

class BoardFile(BoardFileBase):
    id: int
    file_name: str
    file_path: str
    hr_author_id: Optional[int] = None
    upload_date: datetime
    is_active: bool
    sites: List[Site] = []   # ⭐ ORA CORRETTO

    class Config:
        from_attributes = True
