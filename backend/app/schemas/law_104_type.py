from pydantic import BaseModel

class Law104Type(BaseModel):
    id: int
    code: str
    description: str

    model_config = {"from_attributes": True}
