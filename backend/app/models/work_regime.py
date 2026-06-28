from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class WorkRegime(Base):
    __tablename__ = "work_regimes"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
