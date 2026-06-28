from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    # FIX: users.id → employees.id
    user_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    role = Column(String(50), nullable=False)
    action = Column(String(255), nullable=False)
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # FIX: User → Employee
    user = relationship("Employee")


class UserHistoryLog(Base):
    __tablename__ = "user_history_logs"

    id = Column(Integer, primary_key=True, index=True)

    # FIX: users.id → employees.id
    target_user_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    field_name = Column(String(100), nullable=False)
    old_value = Column(Text)
    new_value = Column(Text)

    # FIX: users.id → employees.id
    modified_by_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # FIX: User → Employee
    target_user = relationship("Employee", foreign_keys=[target_user_id])
    modified_by = relationship("Employee", foreign_keys=[modified_by_id])
