from sqlalchemy import Column, Integer, Date, Boolean, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeBenefit(Base):
    __tablename__ = "employee_benefits"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    benefit_type = Column(String(50), nullable=False)  # MBO, PDR, FLEX, SMARTWORKING
    has_benefit = Column(Boolean, default=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    employee = relationship("Employee", back_populates="benefits")
