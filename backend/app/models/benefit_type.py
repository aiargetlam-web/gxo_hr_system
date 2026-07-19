from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class BenefitType(Base):
    __tablename__ = "benefit_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(String(100), nullable=False)
