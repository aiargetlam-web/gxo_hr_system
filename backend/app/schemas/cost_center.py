from pydantic import BaseModel

class CostCenterBase(BaseModel):
    id: int
    code: str
    description: str

    model_config = {"from_attributes": True}

class CostCenter(CostCenterBase):
    pass
