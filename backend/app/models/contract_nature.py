from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class ContractNature(Base):
    __tablename__ = "contract_natures"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
