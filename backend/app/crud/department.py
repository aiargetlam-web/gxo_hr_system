from sqlalchemy.orm import Session
from app.models.department import Department

class DepartmentCRUD:
    def get_all(self, db: Session):
        return db.query(Department).all()

department_crud = DepartmentCRUD()
