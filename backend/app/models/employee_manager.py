from sqlalchemy import Column, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeManager(Base):
    __tablename__ = "employee_managers"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=True)
    note = Column(Text)

    employee = relationship("Employee", foreign_keys=[employee_id], backref="manager_history")
    manager = relationship("Employee", foreign_keys=[manager_id])
