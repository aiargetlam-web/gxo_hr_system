from sqlalchemy.orm import Session
from app.models.work_regime import WorkRegime

class WorkRegimeCRUD:
    def get_all(self, db: Session):
        return db.query(WorkRegime).all()

work_regime_crud = WorkRegimeCRUD()
