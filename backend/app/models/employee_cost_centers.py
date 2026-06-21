from sqlalchemy import Column, Integer, Date, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeCostCenter(Base):
    __tablename__ = "employee_cost_centers"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    cost_center_id = Column(Integer, ForeignKey("cost_centers.id"), nullable=False)

    weight_percent = Column(Numeric(5,2), nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    employee = relationship("Employee", back_populates="cost_centers")
    cost_center = relationship("CostCenter")
