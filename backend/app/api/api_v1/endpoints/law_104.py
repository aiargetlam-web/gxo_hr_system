from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.law_104_type import Law104Type
from app.schemas.law_104_type import Law104Type as Law104TypeSchema

router = APIRouter()

@router.get("/", response_model=list[Law104TypeSchema])
def get_law_104_types(db: Session = Depends(get_db)):
    return db.query(Law104Type).all()
