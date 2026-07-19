from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class Gender(Base):
    __tablename__ = "genders"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False)
    description = Column(String(50), nullable=False)
