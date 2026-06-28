from sqlalchemy import Column, Integer, Date, Numeric, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class EmployeeContract(Base):
    __tablename__ = "employee_contracts"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)

    work_regime_id = Column(Integer, ForeignKey("work_regimes.id"), nullable=False)
    contract_nature_id = Column(Integer, ForeignKey("contract_natures.id"), nullable=False)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date)

    weekly_hours = Column(Numeric(5,2))
    fte = Column(Numeric(4,2), nullable=False)
    time_band = Column(String(50))
    shift_type = Column(String(20))
    note = Column(String)

    employee = relationship("Employee", back_populates="contracts")

    # 🔥 RELAZIONI MANCANTI (DEVONO ESSERCI)
    work_regime = relationship("WorkRegime")
    contract_nature = relationship("ContractNature")
