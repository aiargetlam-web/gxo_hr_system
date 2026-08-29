from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class Law104Type(Base):
    __tablename__ = "law_104_types"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), nullable=False)
    description = Column(String(200), nullable=False)
