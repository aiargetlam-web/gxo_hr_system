from sqlalchemy import Column, Integer, String, Text, Boolean, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class CommunicationType(Base):
    __tablename__ = "communication_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    requires_attachment = Column(Boolean, default=False)
    default_priority = Column(Enum('low', 'medium', 'high', 'daily', 'weekly', 'monthly'), default='medium')

class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type_id = Column(Integer, ForeignKey("communication_types.id"), nullable=False)
    status = Column(Enum('unread', 'in_progress', 'closed'), default='unread')
    priority = Column(Enum('low', 'medium', 'high', 'daily', 'weekly', 'monthly'), default='medium')
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    type = relationship("CommunicationType")
    attachments = relationship("CommunicationAttachment", back_populates="communication", cascade="all, delete-orphan")
    messages = relationship("CommunicationMessage", back_populates="communication", cascade="all, delete-orphan")

class CommunicationMessage(Base):
    __tablename__ = "communication_messages"

    id = Column(Integer, primary_key=True, index=True)
    communication_id = Column(Integer, ForeignKey("communications.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    communication = relationship("Communication", back_populates="messages")
    author = relationship("User")

class CommunicationAttachment(Base):
    __tablename__ = "communication_attachments"

    id = Column(Integer, primary_key=True, index=True)
    communication_id = Column(Integer, ForeignKey("communications.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    communication = relationship("Communication", back_populates="attachments")
