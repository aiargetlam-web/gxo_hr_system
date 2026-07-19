from pydantic import BaseModel

class BenefitType(BaseModel):
    id: int
    code: str
    description: str

    class Config:
        orm_mode = True
