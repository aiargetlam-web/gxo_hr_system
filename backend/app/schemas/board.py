from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Schema base (vuoto, ma utile per estensioni future)
class BoardFileBase(BaseModel):
    pass

# Schema per la creazione (upload)
class BoardFileCreate(BoardFileBase):
    site_ids: List[int]

# Schema restituito dal backend
class BoardFile(BoardFileBase):
    id: int
    file_name: str
    file_path: str
    hr_author_id: Optional[int] = None
    upload_date: datetime
    is_active: bool
    sites: List[int] = []   # lista di ID dei siti, NON oggetti Site

    class Config:
        from_attributes = True
