from pydantic import BaseModel

class ContractNatureBase(BaseModel):
    id: int
    code: str
    description: str

    model_config = {"from_attributes": True}

class ContractNature(ContractNatureBase):
    pass
