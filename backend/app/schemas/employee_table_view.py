from pydantic import BaseModel
from typing import List

class EmployeeTableViewBase(BaseModel):
    name: str
    columns: List[str]

class EmployeeTableViewCreate(EmployeeTableViewBase):
    user_id: int

class EmployeeTableViewUpdate(EmployeeTableViewBase):
    pass

class EmployeeTableView(EmployeeTableViewBase):
    id: int
    user_id: int

    model_config = {
        "from_attributes": True
    }
