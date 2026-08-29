from sqlalchemy import Column, Integer, String, Text
from app.db.base_class import Base

class Union(Base):
    __tablename__ = "unions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    note = Column(Text)
