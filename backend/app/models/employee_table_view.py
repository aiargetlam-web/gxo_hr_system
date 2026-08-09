from sqlalchemy import Column, Integer, String, JSON, DateTime, func
from app.db.base_class import Base

class EmployeeTableView(Base):
    __tablename__ = "employee_table_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    columns = Column(JSON, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
