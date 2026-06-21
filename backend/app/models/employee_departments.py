from sqlalchemy import Column, Integer, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeDepartment(Base):
    __tablename__ = "employee_departments"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    manager_employee_id = Column(Integer, ForeignKey("employees.id"))

    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    employee = relationship("Employee", back_populates="departments")
    department = relationship("Department")
    manager = relationship("Employee", foreign_keys=[manager_employee_id])
