from sqlalchemy import Column, Integer, Date, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeSalary(Base):
    __tablename__ = "employee_salaries"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    ral_amount = Column(Numeric(10,2), nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    employee = relationship("Employee", back_populates="salaries")
