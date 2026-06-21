from sqlalchemy import Column, Integer, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeEnacApproval(Base):
    __tablename__ = "employee_enac_approvals"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    request_date = Column(Date, nullable=False)
    approval_date = Column(Date)
    is_first_approval = Column(Boolean, default=False)
    note = Column(Text)

    employee = relationship("Employee", back_populates="enac_approvals")
