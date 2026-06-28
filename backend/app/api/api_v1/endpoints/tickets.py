from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.ticket import (
    Ticket as TicketSchema,
    TicketCreate,
    TicketUpdate,
    TicketType as TicketTypeSchema,
    TicketMessage as TicketMessageSchema,
    TicketMessageCreate
)

router = APIRouter()

@router.get("/types", response_model=List[TicketTypeSchema])
def get_ticket_types(
    db: Session = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
) -> Any:
    """Get all ticket types."""
    from app.models.ticket import TicketType
    return db.query(TicketType).all()


@router.get("/", response_model=List[TicketSchema])
def get_tickets(
    db: Session = Depends(deps.get_db),
    status: Optional[str] = None,
    priority: Optional[int] = None,
    current_user = Depends(deps.get_current_user)
) -> Any:
    """Get tickets based on user role and filters."""
    from app.models.ticket import Ticket
    from app.models.employee import Employee
    from app.models.site import HRSite

    query = db.query(Ticket).join(Employee, Ticket.user_id == Employee.id)

    if current_user.role == "user":
        query = query.filter(Ticket.user_id == current_user.id)

    elif current_user.role == "hr":
        hr_site_ids = [
            s.site_id
            for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()
        ]
        if hr_site_ids:
            query = query.filter(Employee.current_site_id.in_(hr_site_ids))
        else:
            return []

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
    current_user = Depends(deps.get_current_user)
) -> Any:
    """Create new ticket."""
    from app.models.ticket import Ticket, TicketType, TicketMessage

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

    msg = TicketMessage(
        ticket_id=db_obj.id,
        author_id=current_user.id,
        content=ticket_in.content
    )
    db.add(msg)
    db.commit()
    db.refresh(db_obj)

    return db_obj


@router.get("/{id}", response_model=TicketSchema)
def get_ticket(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user = Depends(deps.get_current_user)
) -> Any:
    """Get specific ticket."""
    from app.models.ticket import Ticket

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
    current_user = Depends(deps.get_current_user)
) -> Any:
    """Update ticket (HR only)."""
    from app.models.ticket import Ticket

    if current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Not enough permissions")

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
    current_user = Depends(deps.get_current_user)
) -> Any:
    """Add a message to a ticket."""
    from app.models.ticket import Ticket, TicketMessage

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

    if current_user.role == "user":
        ticket.status = "open"
    else:
        ticket.status = "waiting"

    db.commit()
    db.refresh(msg)
    return msg
