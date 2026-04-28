from typing import Optional
from pydantic import BaseModel

class SiteBase(BaseModel):
    name: str

class SiteCreate(SiteBase):
    pass

class Site(SiteBase):
    id: int

    class Config:
        from_attributes = True

class HRSiteAssign(BaseModel):
    site_ids: list[int]
