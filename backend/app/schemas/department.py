from pydantic import BaseModel

class DepartmentBase(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}

class Department(DepartmentBase):
    pass
