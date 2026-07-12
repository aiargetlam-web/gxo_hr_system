from sqlalchemy.orm import Session
from app.models.site import Site

class SiteCRUD:
    def get_all(self, db: Session):
        return db.query(Site).all()

site_crud = SiteCRUD()
