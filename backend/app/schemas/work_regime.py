from pydantic import BaseModel

class WorkRegime(BaseModel):
    id: int
    code: str
    description: str

    model_config = {"from_attributes": True}
