from pydantic import BaseModel

class DepartmentBase(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}

class Department(DepartmentBase):
    pass
