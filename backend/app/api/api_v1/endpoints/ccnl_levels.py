from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from models.ccnl_level import CCNLLevel

router = APIRouter(prefix="/ccnl-levels", tags=["CCNL Levels"])

@router.get("/")
def get_ccnl_levels(db: Session = Depends(get_db)):
    levels = db.query(CCNLLevel).order_by(CCNLLevel.id).all()
    return [
        {
            "id": lvl.id,
            "code": lvl.code,
            "description": lvl.description
        }
        for lvl in levels
    ]
