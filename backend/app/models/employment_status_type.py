from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmploymentStatusType(Base):
    __tablename__ = "employment_status_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(String(255))
    is_active = Column(Boolean, default=True)   # ⭐ NUOVA COLONNA

    history = relationship("EmployeeStatusHistory", back_populates="status_type")
