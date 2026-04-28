from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.ticket import Ticket, TicketType, TicketMessage
from app.models.user import User
from app.schemas.ticket import Ticket as TicketSchema, TicketCreate, TicketUpdate, TicketType as TicketTypeSchema, TicketMessage as TicketMessageSchema, TicketMessageCreate

router = APIRouter()

@router.get("/types", response_model=List[TicketTypeSchema])
def get_ticket_types(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get all ticket types."""
    types = db.query(TicketType).all()
    return types

@router.get("/", response_model=List[TicketSchema])
def get_tickets(
    db: Session = Depends(deps.get_db),
    status: Optional[str] = None,
    priority: Optional[int] = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get tickets based on user role and filters."""
    query = db.query(Ticket).join(User, Ticket.user_id == User.id)
    
    if current_user.role == "user":
        query = query.filter(Ticket.user_id == current_user.id)
    elif current_user.role == "hr":
        from app.models.site import HRSite
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        if hr_site_ids:
            query = query.filter(User.site_id.in_(hr_site_ids))
        else:
            return [] # Se non ha siti, non vede nulla
        
    if status:
        query = query.filter(Ticket.status == status)
    if priority:
        query = query.filter(Ticket.priority == priority)
        
    return query.order_by(Ticket.created_at.desc()).all()

@router.post("/", response_model=TicketSchema)
def create_ticket(
    *,
    db: Session = Depends(deps.get_db),
    ticket_in: TicketCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Create new ticket."""
    ctype = db.query(TicketType).filter(TicketType.id == ticket_in.type_id).first()
    if not ctype:
        raise HTTPException(status_code=404, detail="Ticket Type not found")
        
    db_obj = Ticket(
        user_id=current_user.id,
        type_id=ticket_in.type_id,
        priority=ticket_in.priority or ctype.default_priority
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    
    # Add initial message
    msg = TicketMessage(
        ticket_id=db_obj.id,
        author_id=current_user.id,
        content=ticket_in.content
    )
    db.add(msg)
    db.commit()
    db.refresh(db_obj) # refresh to get messages
    
    return db_obj

@router.get("/{id}", response_model=TicketSchema)
def get_ticket(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get specific ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "user" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return ticket

@router.patch("/{id}", response_model=TicketSchema)
def update_ticket(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    ticket_in: TicketUpdate,
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    """Update ticket (HR only)."""
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if ticket_in.status:
        ticket.status = ticket_in.status
    if ticket_in.priority is not None:
        ticket.priority = ticket_in.priority
        
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.post("/{id}/messages", response_model=TicketMessageSchema)
def create_ticket_message(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    msg_in: TicketMessageCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Add a message to a ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "user" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    msg = TicketMessage(
        ticket_id=ticket.id,
        author_id=current_user.id,
        content=msg_in.content
    )
    db.add(msg)
    
    # If a user replies, we might want to change status to "open" or "waiting"
    if current_user.role == "user":
        ticket.status = "open"
    else:
        ticket.status = "waiting" # Waiting for user reply
        
    db.commit()
    db.refresh(msg)
    return msg
