from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)
    site = relationship("Site")


    employees = relationship("EmployeeDepartment", back_populates="department")
