from pydantic import BaseModel
from datetime import date
from app.schemas.employer import Employer

class EmployeeEmployerHistory(BaseModel):
    id: int
    employee_id: int
    employer_id: int
    from_date: date
    to_date: date | None = None
    note: str | None = None

    employer: Employer | None = None

    model_config = {"from_attributes": True}
