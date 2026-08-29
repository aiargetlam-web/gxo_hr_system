from sqlalchemy import Column, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeEmployerHistory(Base):
    __tablename__ = "employee_employer_history"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=False)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    employer = relationship("Employer")
