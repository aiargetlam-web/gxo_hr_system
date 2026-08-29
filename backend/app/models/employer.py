from sqlalchemy import Column, Integer, String, Text
from app.db.base_class import Base

class Employer(Base):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # GXO, AGENZIA, COOPERATIVA
    note = Column(Text)
