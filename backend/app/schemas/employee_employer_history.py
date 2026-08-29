from datetime import date
from typing import Optional
from pydantic import BaseModel

from app.schemas.employer import Employer


# Base per CREATE
class EmployerHistoryBase(BaseModel):
    employer_id: int
    from_date: date
    note: Optional[str] = None


# CREATE
class EmployerHistoryCreate(EmployerHistoryBase):
    pass


# READ
class EmployerHistory(EmployerHistoryBase):
    id: int
    employee_id: int
    to_date: Optional[date] = None
    employer: Optional[Employer] = None

    model_config = {"from_attributes": True}
