from pydantic import BaseModel

class Employer(BaseModel):
    id: int
    name: str
    type: str
    note: str | None = None

    model_config = {"from_attributes": True}
