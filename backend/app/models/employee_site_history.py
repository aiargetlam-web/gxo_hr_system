from sqlalchemy import Column, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeSiteHistory(Base):
    __tablename__ = "employee_sites_history"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    site_id = Column(Integer, ForeignKey("sites.id"), nullable=False)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    employee = relationship("Employee", back_populates="site_history")
    site = relationship("Site")
