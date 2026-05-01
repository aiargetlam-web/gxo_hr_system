import os
import shutil
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
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

# ---------------------------------------------------------
# GET LISTA FILE (con filtro attivi/disattivi)
# ---------------------------------------------------------
@router.get("/", response_model=List[BoardFileSchema])
def get_board_files(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    active: Optional[bool] = Query(default=True)
) -> Any:
    """
    Ritorna i file filtrati per ruolo e stato attivo/disattivo.
    """
    query = db.query(BoardFile).join(BoardFileSite)

    # filtro attivi/disattivi
    if active is not None:
        query = query.filter(BoardFile.is_active == active)

    # USER → solo file attivi del proprio sito
    if current_user.role == "user":
        if not current_user.site_id:
            return []
        query = query.filter(BoardFileSite.site_id == current_user.site_id)

    # HR → solo file dei siti che gestisce
    elif current_user.role == "hr":
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id)
        ]
        if not hr_site_ids:
            return []
        query = query.filter(BoardFileSite.site_id.in_(hr_site_ids))

    # ADMIN → vede tutto

    return (
        query.group_by(BoardFile.id)
        .order_by(BoardFile.upload_date.desc())
        .all()
    )


# ---------------------------------------------------------
# UPLOAD FILE
# ---------------------------------------------------------
@router.post("/upload", response_model=BoardFileSchema)
def upload_board_file(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    site_ids: str = Form(...),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:

    import uuid
    safe_filename = f"board_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db_obj = BoardFile(
        file_name=file.filename,
        file_path=file_path,
        hr_author_id=current_user.id,
        is_active=True
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    # parsing site_ids: "1,2,3"
    site_ids_list = [
        int(s.strip()) for s in site_ids.split(",") if s.strip().isdigit()
    ]

    for sid in site_ids_list:
        db.add(BoardFileSite(file_id=db_obj.id, site_id=sid))

    db.commit()
    db.refresh(db_obj)

    log_activity(db, current_user, "Upload Board File", "BoardFile", db_obj.id)

    return db_obj


# ---------------------------------------------------------
# GET DETTAGLI FILE (siti associati)
# ---------------------------------------------------------
@router.get("/{id}", response_model=dict)
def get_board_file_details(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:

    board_file = db.query(BoardFile).filter(BoardFile.id == id).first()
    if not board_file:
        raise HTTPException(status_code=404, detail="File non trovato")

    site_ids = [
        s.site_id
        for s in db.query(BoardFileSite).filter(BoardFileSite.file_id == id).all()
    ]

    return {
        "id": board_file.id,
        "file_name": board_file.file_name,
        "sites": site_ids
    }


# ---------------------------------------------------------
# PATCH STATO (attiva/disattiva)
# ---------------------------------------------------------
@router.patch("/{id}/status")
def update_board_file_status(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    is_active: bool = Form(...),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:

    board_file = db.query(BoardFile).filter(BoardFile.id == id).first()
    if not board_file:
        raise HTTPException(status_code=404, detail="File non trovato")

    board_file.is_active = is_active
    db.commit()
    db.refresh(board_file)

    log_activity(db, current_user, "Update Board File Status", "BoardFile", board_file.id)

    return {"status": "ok", "is_active": board_file.is_active}


# ---------------------------------------------------------
# PATCH SITI ASSOCIATI
# ---------------------------------------------------------
@router.patch("/{id}/sites")
def update_board_file_sites(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    site_ids: str = Form(...),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:

    board_file = db.query(BoardFile).filter(BoardFile.id == id).first()
    if not board_file:
        raise HTTPException(status_code=404, detail="File non trovato")

    site_ids_list = [
        int(s.strip()) for s in site_ids.split(",") if s.strip().isdigit()
    ]

    # rimuove associazioni precedenti
    db.query(BoardFileSite).filter(BoardFileSite.file_id == id).delete()

    # aggiunge nuove
    for sid in site_ids_list:
        db.add(BoardFileSite(file_id=id, site_id=sid))

    db.commit()

    log_activity(db, current_user, "Update Board File Sites", "BoardFile", board_file.id)

    return {"status": "ok", "sites": site_ids_list}


# ---------------------------------------------------------
# DOWNLOAD FILE
# ---------------------------------------------------------
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

    # utenti normali non possono scaricare file disattivati
    if current_user.role == "user" and not board_file.is_active:
        raise HTTPException(status_code=403, detail="File non più disponibile.")

    # controllo visibilità per ruolo
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
        hr_site_ids = [
            s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id)
        ]
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
        media_type="application/octet-stream"
    )
