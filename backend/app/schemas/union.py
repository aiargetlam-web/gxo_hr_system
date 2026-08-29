from pydantic import BaseModel

class Union(BaseModel):
    id: int
    name: str
    note: str | None = None

    model_config = {"from_attributes": True}
