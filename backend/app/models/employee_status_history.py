from sqlalchemy import Column, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeStatusHistory(Base):
    __tablename__ = "employee_status_history"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    status_type_id = Column(Integer, ForeignKey("employment_status_types.id"), nullable=False)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    employee = relationship("Employee", back_populates="status_history")
    status_type = relationship("EmploymentStatusType")
