from datetime import date
from typing import Optional
from pydantic import BaseModel

from app.schemas.union import Union


# Base per CREATE
class UnionHistoryBase(BaseModel):
    union_id: int
    from_date: date
    note: Optional[str] = None


# CREATE
class UnionHistoryCreate(UnionHistoryBase):
    pass


# READ
class UnionHistory(UnionHistoryBase):
    id: int
    employee_id: int
    to_date: Optional[date] = None
    union: Optional[Union] = None

    model_config = {"from_attributes": True}
