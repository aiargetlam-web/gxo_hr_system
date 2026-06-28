from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmploymentStatusType(Base):
    __tablename__ = "employment_status_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    # relazione inversa
    history = relationship("EmployeeStatusHistory", back_populates="status_type")
