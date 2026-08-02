from sqlalchemy import Column, Integer, String
from database import Base

class CCNLLevel(Base):
    __tablename__ = "ccnl_levels"

    id = Column(Integer, primary_key=True)
    code = Column(String(10), nullable=False)
    description = Column(String(100), nullable=False)
