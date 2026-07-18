from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    # ============================
    # ANAGRAFICA
    # ============================
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20))
    fiscal_code = Column(String(20), unique=True)
    gender = Column(String(10))
    birth_date = Column(Date)
    birth_place = Column(String(255))

    # ============================
    # INDIRIZZO
    # ============================
    address_street = Column(String(255))
    address_city = Column(String(100))
    address_cap = Column(String(10))

    # ============================
    # LUL
    # ============================
    id_lul = Column(String(100), unique=True)

    # ============================
    # PASSWORD HASH
    # ============================
    password_hash = Column(String(255), nullable=False)

    # ============================
    # STATO LAVORATIVO
    # ============================
    is_active = Column(Boolean, default=True)
    first_access = Column(Boolean, default=True)

    # ============================
    # SITO ATTUALE (UNICO VALORE)
    # ============================
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="SET NULL"))
    site = relationship("Site", back_populates="employees")

    # ============================
    # RUOLO
    # ============================
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    role = relationship("Role", back_populates="employees")

    # ============================
    # DATE ASSUNZIONE / CESSAZIONE
    # ============================
    hire_date = Column(Date)
    termination_date = Column(Date)

    # ============================
    # CATEGORIE SPECIALI
    # ============================
    is_protected_category = Column(Boolean, default=False)
    is_disadvantaged = Column(Boolean, default=False)

    # ============================
    # TIMESTAMPS
    # ============================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # ============================
    # RELAZIONI HR (history tables)
    # ============================

    # Contratti
    contracts = relationship("EmployeeContract", back_populates="employee")

    # Cost centers
    cost_centers = relationship("EmployeeCostCenter", back_populates="employee")

    # Reparti
    departments = relationship(
        "EmployeeDepartment",
        back_populates="employee",
        foreign_keys="EmployeeDepartment.employee_id"
    )

    # RAL
    salaries = relationship("EmployeeSalary", back_populates="employee")

    # Auto aziendali
    cars = relationship("EmployeeCompanyCar", back_populates="employee")

    # ENAC
    enac_courses = relationship("EmployeeEnacCourse", back_populates="employee")
    enac_approvals = relationship("EmployeeEnacApproval", back_populates="employee")

    # Stato lavorativo (history)
    status_history = relationship("EmployeeStatusHistory", back_populates="employee")

    # Siti (history)
    site_history = relationship("EmployeeSiteHistory", back_populates="employee")

    # Benefit
    benefits = relationship("EmployeeBenefit", back_populates="employee")

    # ============================
    # PREPOSTO
    # ============================
    preposto = Column(Boolean, default=False)
