from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    # Anagrafica
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20))
    fiscal_code = Column(String(20), unique=True)
    gender = Column(String(10))
    birth_date = Column(Date)
    birth_place = Column(String(255))

    # Indirizzo
    address_street = Column(String(255))
    address_city = Column(String(100))
    address_cap = Column(String(10))

    # LUL — nome colonna corretto come nel DB
    id_lul = Column(String(100), unique=True)

    # Password — mancava nel modello
    password_hash = Column(String(255), nullable=False)

    # Stato lavorativo attuale
    is_active = Column(Boolean, default=True)
    first_access = Column(Boolean, default=True)

    # Sito attuale
    current_site_id = Column(Integer, ForeignKey("sites.id", ondelete="SET NULL"))
    from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Site(Base):
    __tablename__ = "sites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    # ⭐ RELAZIONE INVERTITA (fondamentale)
    employees = relationship("Employee", back_populates="current_site")


class HRSite(Base):
    __tablename__ = "hr_sites"

    hr_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), primary_key=True)
    site_id = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), primary_key=True)

    # Ruolo
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = relationship("Role", back_populates="employees")

    # Date assunzione/cessazione
    hire_date = Column(Date)
    termination_date = Column(Date)

    # Categoria protetta / svantaggiato
    is_protected_category = Column(Boolean, default=False)
    is_disadvantaged = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # RELAZIONI HR
    contracts = relationship("EmployeeContract", back_populates="employee")
    cost_centers = relationship("EmployeeCostCenter", back_populates="employee")

    departments = relationship(
        "EmployeeDepartment",
        back_populates="employee",
        foreign_keys="EmployeeDepartment.employee_id"
    )

    salaries = relationship("EmployeeSalary", back_populates="employee")
    cars = relationship("EmployeeCompanyCar", back_populates="employee")
    enac_courses = relationship("EmployeeEnacCourse", back_populates="employee")
    enac_approvals = relationship("EmployeeEnacApproval", back_populates="employee")
    status_history = relationship("EmployeeStatusHistory", back_populates="employee")
    site_history = relationship("EmployeeSiteHistory", back_populates="employee")
    benefits = relationship("EmployeeBenefit", back_populates="employee")
