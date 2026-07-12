from typing import Optional, List
from pydantic import BaseModel

# ---------------------------------------------------------
# BASE PER CRUD / CREAZIONE
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
# READ (OUTPUT PER CRUD)
# ---------------------------------------------------------

class Site(SiteBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# HR: DIZIONARIO (MENU A TENDINA)
# ---------------------------------------------------------

class SiteDict(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------
# HR: ASSEGNAZIONE SITI MULTIPLI
# ---------------------------------------------------------

class HRSiteAssign(BaseModel):
    site_ids: List[int]
