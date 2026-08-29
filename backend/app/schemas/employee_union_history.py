from pydantic import BaseModel
from datetime import date
from app.schemas.union import Union

class EmployeeUnionHistory(BaseModel):
    id: int
    employee_id: int
    union_id: int
    from_date: date
    to_date: date | None = None
    note: str | None = None

    union: Union | None = None

    model_config = {"from_attributes": True}
