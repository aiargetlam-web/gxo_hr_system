from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

from app.schemas.employee import Employee


# ============================================================
# TICKET TYPES
# ============================================================

class TicketTypeBase(BaseModel):
    name: str
    description: Optional[str] = None
    default_priority: int = 3


class TicketType(TicketTypeBase):
    id: int

    class Config:
        from_attributes = True


# ============================================================
# TICKET MESSAGES
# ============================================================

class TicketMessageBase(BaseModel):
    content: str


class TicketMessageCreate(TicketMessageBase):
    pass


class TicketMessage(TicketMessageBase):
    id: int
    ticket_id: int
    author_id: int
    created_at: datetime
    author: Optional[Employee] = None

    class Config:
        from_attributes = True


# ============================================================
# TICKETS
# ============================================================

class TicketBase(BaseModel):
    type_id: int
    priority: Optional[int] = 3


class TicketCreate(TicketBase):
    content: str  # First message


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[int] = None


class Ticket(TicketBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    type: Optional[TicketType] = None
    user: Optional[Employee] = None
    messages: List[TicketMessage] = []

    class Config:
        from_attributes = True
