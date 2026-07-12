from pydantic import BaseModel

class WorkRegime(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
