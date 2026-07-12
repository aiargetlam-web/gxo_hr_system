from sqlalchemy.orm import Session
from app.models.contract_nature import ContractNature

class ContractNatureCRUD:
    def get_all(self, db: Session):
        return db.query(ContractNature).all()

contract_nature_crud = ContractNatureCRUD()
