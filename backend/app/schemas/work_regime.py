from pydantic import BaseModel

class WorkRegimeBase(BaseModel):
    id: int
    code: str
    description: str | None = None

    model_config = {"from_attributes": True}

class WorkRegime(WorkRegimeBase):
    pass
