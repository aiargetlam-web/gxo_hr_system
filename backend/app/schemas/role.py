from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    description: str | None = None

class Role(RoleBase):
    id: int

    class Config:
        orm_mode = True
