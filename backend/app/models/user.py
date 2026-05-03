from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)

    phone = Column(String(20))
    address = Column(Text)

    password_hash = Column(String(255), nullable=False)

    # ⭐ NUOVO: ruolo tramite FK
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role")

    # ⭐ Sito
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="SET NULL"), nullable=True)
    site = relationship("Site")

    id_lul = Column(String(100), unique=True, nullable=True)

    is_active = Column(Boolean, default=True)
    first_access = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # HR → siti gestiti
    managed_sites = relationship("Site", secondary="hr_sites")
