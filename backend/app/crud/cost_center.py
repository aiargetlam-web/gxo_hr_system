from sqlalchemy.orm import Session
from app.models.cost_center import CostCenter

class CostCenterCRUD:
    def get_all(self, db: Session):
        return db.query(CostCenter).all()

cost_center_crud = CostCenterCRUD()
