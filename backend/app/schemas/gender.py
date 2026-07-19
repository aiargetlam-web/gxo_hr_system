from pydantic import BaseModel

class Gender(BaseModel):
    id: int
    code: str
    description: str

    model_config = {"from_attributes": True}
