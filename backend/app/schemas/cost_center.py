from pydantic import BaseModel

class CostCenterBase(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
