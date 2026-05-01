import os
import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api import deps
from app.models.board import BoardFile, BoardFileSite
from app.models.site import HRSite
from app.models.user import User
from app.schemas.board import BoardFile as BoardFileSchema
from app.core.config import settings
from app.core.audit import log_activity

router = APIRouter()

@router.get("/", response_model=List[BoardFileSchema])
def get_board_files(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    query = db.query(BoardFile).join(BoardFileSite)
    
    if current_user.role == "user":
        if not current_user.site_id:
            return []
        query = query.filter(BoardFileSite.site_id == current_user.site_id)

    elif current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        if not hr_site_ids:
            return []
        query = query.filter(BoardFileSite.site_id.in_(hr_site_ids))
        
    return query.group_by(BoardFile.id).order_by(BoardFile.upload_date.desc()).all()

@router.post("/upload", response_model=BoardFileSchema)
def upload_board_file(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    site_ids: str = Form(...),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    
    # Salvataggio file
    import uuid
    safe_filename = f"board_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_obj = BoardFile(
        file_name=file.filename,
        file_path=file_path,
        hr_author_id=current_user.id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # 🔹 Gestione robusta dei site_ids
    if isinstance(site_ids, list):
        site_ids_list = [int(s) for s in site_ids if str(s).isdigit()]
    else:
        site_ids_list = [int(sid.strip()) for sid in site_ids.split(",") if sid.strip().isdigit()]

    # Inserimento nella tabella pivot
    for sid in site_ids_list:
        db.add(BoardFileSite(file_id=db_obj.id, site_id=sid))

    db.commit()
    db.refresh(db_obj)

    log_activity(db, current_user, "Upload Board File", "BoardFile", db_obj.id)

    return db_obj

@router.get("/{id}/download")
def download_board_file(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    board_file = db.query(BoardFile).filter(BoardFile.id == id).first()
    if not board_file:
        raise HTTPException(status_code=404, detail="File not found")
        
    if current_user.role == "user":
        if not current_user.site_id:
            raise HTTPException(status_code=403, detail="Non hai un sito assegnato.")
        is_visible = db.query(BoardFileSite).filter(
            BoardFileSite.file_id == id,
            BoardFileSite.site_id == current_user.site_id
        ).first()
        if not is_visible:
            raise HTTPException(status_code=403, detail="File non visibile per il tuo sito.")
            
    elif current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        is_visible = db.query(BoardFileSite).filter(
            BoardFileSite.file_id == id,
            BoardFileSite.site_id.in_(hr_site_ids)
        ).first()
        if not is_visible:
            raise HTTPException(status_code=403, detail="File non visibile per i siti da te gestiti.")
            
    if not os.path.exists(board_file.file_path):
        raise HTTPException(status_code=404, detail="Physical file not found on server")
        
    return FileResponse(
        path=board_file.file_path,
        filename=board_file.file_name,
        media_type='application/octet-stream'
    )
