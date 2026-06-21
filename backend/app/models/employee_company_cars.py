from sqlalchemy import Column, Integer, Date, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeCompanyCar(Base):
    __tablename__ = "employee_company_cars"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    car_model = Column(String(255), nullable=False)
    plate = Column(String(20))
    from_date = Column(Date, nullable=False)
    to_date = Column(Date)

    benefit_type = Column(String(50))
    payroll_notes = Column(Text)
    note = Column(Text)

    employee = relationship("Employee", back_populates="cars")
