from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class BoardFileSite(Base):
    __tablename__ = "board_file_sites"

    file_id = Column(Integer, ForeignKey("board_files.id", ondelete="CASCADE"), primary_key=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), primary_key=True)

class BoardFile(Base):
    __tablename__ = "board_files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    hr_author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    author = relationship("User")
    sites = relationship("Site", secondary="board_file_sites")
