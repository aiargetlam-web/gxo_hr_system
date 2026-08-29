from sqlalchemy import Column, Integer, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeUnionHistory(Base):
    __tablename__ = "employee_union_history"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    union_id = Column(Integer, ForeignKey("unions.id"), nullable=False)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date)
    note = Column(Text)

    union = relationship("Union")
