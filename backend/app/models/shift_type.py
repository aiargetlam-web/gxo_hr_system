from sqlalchemy import Column, Integer, String, Text
from app.db.base_class import Base

class ShiftType(Base):
    __tablename__ = "shift_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    description = Column(Text)

