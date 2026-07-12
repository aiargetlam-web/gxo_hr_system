from pydantic import BaseModel

class ContractNature(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
