import os
import shutil
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api import deps
from app.models.communication import Communication, CommunicationType, CommunicationAttachment, CommunicationMessage
from app.models.user import User
from app.schemas.communication import Communication as CommunicationSchema, CommunicationCreate, CommunicationUpdate, CommunicationType as CommunicationTypeSchema, CommunicationMessage as CommunicationMessageSchema, CommunicationMessageCreate
from app.core.config import settings

router = APIRouter()

@router.get("/types", response_model=List[CommunicationTypeSchema])
def get_communication_types(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get all communication types."""
    types = db.query(CommunicationType).all()
    return types

@router.get("/", response_model=List[CommunicationSchema])
def get_communications(
    db: Session = Depends(deps.get_db),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get communications based on user role and filters."""
    query = db.query(Communication).join(User, Communication.user_id == User.id)
    
    if current_user.role == "user":
        query = query.filter(Communication.user_id == current_user.id)
    elif current_user.role == "hr":
        from app.models.site import HRSite
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        if hr_site_ids:
            query = query.filter(User.site_id.in_(hr_site_ids))
        else:
            return [] # Se non ha siti, non vede nulla
        
    if status:
        query = query.filter(Communication.status == status)
    if priority:
        query = query.filter(Communication.priority == priority)
        
    return query.order_by(Communication.created_at.desc()).all()

@router.post("/", response_model=CommunicationSchema)
def create_communication(
    *,
    db: Session = Depends(deps.get_db),
    communication_in: CommunicationCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Create new communication."""
    ctype = db.query(CommunicationType).filter(CommunicationType.id == communication_in.type_id).first()
    if not ctype:
        raise HTTPException(status_code=404, detail="Communication Type not found")
        
    db_obj = Communication(
        user_id=current_user.id,
        type_id=communication_in.type_id,
        notes=communication_in.notes,
        priority=communication_in.priority or ctype.default_priority
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/{id}", response_model=CommunicationSchema)
def get_communication(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get specific communication."""
    comm = db.query(Communication).filter(Communication.id == id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
    if current_user.role == "user" and comm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return comm

@router.patch("/{id}", response_model=CommunicationSchema)
def update_communication(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    communication_in: CommunicationUpdate,
    current_user: User = Depends(deps.get_current_hr_user) # Only HR can update status/priority generally
) -> Any:
    """Update communication (HR only)."""
    comm = db.query(Communication).filter(Communication.id == id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
        
    if communication_in.status:
        comm.status = communication_in.status
    if communication_in.priority:
        comm.priority = communication_in.priority
    if communication_in.notes is not None:
        comm.notes = communication_in.notes
        
    db.add(comm)
    db.commit()
    db.refresh(comm)
    return comm

@router.post("/{id}/attachments")
def upload_attachment(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Upload attachment to a communication."""
    comm = db.query(Communication).filter(Communication.id == id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
    if current_user.role == "user" and comm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    safe_filename = f"comm_{id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    attachment = CommunicationAttachment(
        communication_id=id,
        file_path=file_path,
        file_name=file.filename
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return {"id": attachment.id, "filename": attachment.file_name}

@router.get("/{id}/messages", response_model=List[CommunicationMessageSchema])
def get_communication_messages(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Get messages for a communication."""
    comm = db.query(Communication).filter(Communication.id == id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
        
    if current_user.role == "user" and comm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return db.query(CommunicationMessage).filter(CommunicationMessage.communication_id == id).order_by(CommunicationMessage.created_at.asc()).all()

@router.post("/{id}/messages", response_model=CommunicationMessageSchema)
def create_communication_message(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    message_in: CommunicationMessageCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """Add a message to a communication."""
    comm = db.query(Communication).filter(Communication.id == id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
        
    if current_user.role == "user" and comm.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db_obj = CommunicationMessage(
        communication_id=id,
        author_id=current_user.id,
        content=message_in.content
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
