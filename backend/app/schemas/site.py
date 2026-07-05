from typing import Optional, List
from pydantic import BaseModel

# ---------------------------------------------------------
# BASE
# ---------------------------------------------------------

class SiteBase(BaseModel):
    name: str
    address: Optional[str] = None


# ---------------------------------------------------------
# CREATE
# ---------------------------------------------------------

class SiteCreate(SiteBase):
    pass


# ---------------------------------------------------------
# READ (OUTPUT)
# ---------------------------------------------------------

class Site(SiteBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# HR: ASSEGNAZIONE SITI MULTIPLI
# ---------------------------------------------------------

class HRSiteAssign(BaseModel):
    site_ids: List[int]
