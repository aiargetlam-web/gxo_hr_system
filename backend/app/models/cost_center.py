from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class CostCenter(Base):
    __tablename__ = "cost_centers"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=False)

    employees = relationship("EmployeeCostCenter", back_populates="cost_center")
