from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.user import User

# Communication Types
class CommunicationTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    requires_attachment: bool = False
    default_priority: str = 'medium'

class CommunicationType(CommunicationTypeBase):
    id: int

    class Config:
        from_attributes = True

# Communication Attachments
class CommunicationAttachmentBase(BaseModel):
    file_path: str
    file_name: str

class CommunicationAttachment(CommunicationAttachmentBase):
    id: int
    communication_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Communication Messages
class CommunicationMessageBase(BaseModel):
    content: str

class CommunicationMessageCreate(CommunicationMessageBase):
    pass

class CommunicationMessage(CommunicationMessageBase):
    id: int
    communication_id: int
    author_id: int
    created_at: datetime
    author: Optional[User] = None

    class Config:
        from_attributes = True

# Communications
class CommunicationBase(BaseModel):
    type_id: int
    notes: Optional[str] = None
    priority: Optional[str] = 'medium'

class CommunicationCreate(CommunicationBase):
    pass

class CommunicationUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

class Communication(CommunicationBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    type: Optional[CommunicationType] = None
    user: Optional[User] = None
    attachments: List[CommunicationAttachment] = []
    messages: List[CommunicationMessage] = []

    class Config:
        from_attributes = True
