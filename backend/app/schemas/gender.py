from pydantic import BaseModel

class Gender(BaseModel):
    id: int
    code: str
    description: str

    class Config:
        orm_mode = True
