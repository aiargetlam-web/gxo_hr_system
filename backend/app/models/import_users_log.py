from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ImportUsersLog(Base):
    __tablename__ = "import_users_log"

    id = Column(Integer, primary_key=True, index=True)

    # FIX: users.id → employees.id
    hr_author_id = Column(Integer, ForeignKey("employees.id", ondelete="SET NULL"), nullable=True)

    file_name = Column(String(255), nullable=False)
    rows_processed = Column(Integer, default=0)
    rows_failed = Column(Integer, default=0)
    error_details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # FIX: User → Employee
    author = relationship("Employee")
