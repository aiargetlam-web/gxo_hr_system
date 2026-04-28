import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Any
from app.api import deps
from app.models.user import User
from app.models.communication import Communication
from app.models.ticket import Ticket
from app.models.board import BoardFile, BoardFileSite
from app.models.audit import ActivityLog, UserHistoryLog
from app.models.site import HRSite

router = APIRouter()

def get_csv_response(headers: list, rows: list, filename: str):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    
    output.seek(0)
    response = StreamingResponse(iter([output.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={filename}.csv"
    return response

@router.get("/users")
def export_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    query = db.query(User)
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        query = query.filter(User.site_id.in_(hr_site_ids))
    
    users = query.all()
    headers = ["ID", "First Name", "Last Name", "Email", "Role", "Site ID", "ID LUL", "Active", "Created At"]
    rows = [[u.id, u.first_name, u.last_name, u.email, u.role, u.site_id, u.id_lul, u.is_active, u.created_at] for u in users]
    
    return get_csv_response(headers, rows, "users_export")

@router.get("/communications")
def export_communications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    query = db.query(Communication).join(User)
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        query = query.filter(User.site_id.in_(hr_site_ids))
        
    comms = query.all()
    headers = ["ID", "User Email", "Type ID", "Status", "Priority", "Created At"]
    rows = [[c.id, c.user.email if c.user else '', c.type_id, c.status, c.priority, c.created_at] for c in comms]
    
    return get_csv_response(headers, rows, "communications_export")

@router.get("/tickets")
def export_tickets(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    query = db.query(Ticket).join(User)
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        query = query.filter(User.site_id.in_(hr_site_ids))
        
    tickets = query.all()
    headers = ["ID", "User Email", "Type ID", "Status", "Priority", "Created At"]
    rows = [[t.id, t.user.email if t.user else '', t.type_id, t.status, t.priority, t.created_at] for t in tickets]
    
    return get_csv_response(headers, rows, "tickets_export")

@router.get("/board")
def export_board(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_hr_user)
) -> Any:
    query = db.query(BoardFile).join(BoardFileSite)
    if current_user.role == "hr":
        hr_site_ids = [s.site_id for s in db.query(HRSite).filter(HRSite.hr_id == current_user.id).all()]
        query = query.filter(BoardFileSite.site_id.in_(hr_site_ids))
        
    files = query.group_by(BoardFile.id).all()
    headers = ["ID", "File Name", "Author ID", "Upload Date"]
    rows = [[f.id, f.file_name, f.hr_author_id, f.upload_date] for f in files]
    
    return get_csv_response(headers, rows, "board_export")

@router.get("/activity-logs")
def export_activity_logs(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    logs = db.query(ActivityLog).all()
    headers = ["ID", "User ID", "Role", "Action", "Entity Type", "Entity ID", "IP Address", "Created At"]
    rows = [[l.id, l.user_id, l.role, l.action, l.entity_type, l.entity_id, l.ip_address, l.created_at] for l in logs]
    return get_csv_response(headers, rows, "activity_logs_export")

@router.get("/user-history")
def export_user_history(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user)
) -> Any:
    logs = db.query(UserHistoryLog).all()
    headers = ["ID", "Target User ID", "Field", "Old Value", "New Value", "Modified By ID", "Created At"]
    rows = [[l.id, l.target_user_id, l.field_name, l.old_value, l.new_value, l.modified_by_id, l.created_at] for l in logs]
    return get_csv_response(headers, rows, "user_history_export")
