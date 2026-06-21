from sqlalchemy import Column, Integer, Date, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeEnacCourse(Base):
    __tablename__ = "employee_enac_courses"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    course_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    is_first_course = Column(Boolean, default=False)
    note = Column(Text)

    employee = relationship("Employee", back_populates="enac_courses")
