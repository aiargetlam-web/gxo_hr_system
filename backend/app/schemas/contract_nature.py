from pydantic import BaseModel

class ContractNature(BaseModel):
    id: int
    code: str
    description: str

    model_config = {"from_attributes": True}
