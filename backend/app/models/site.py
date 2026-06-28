from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    # ⭐ RELAZIONE INVERTITA (fondamentale)
    employees = relationship("Employee", back_populates="current_site")


class HRSite(Base):
    __tablename__ = "hr_sites"

    hr_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), primary_key=True)
