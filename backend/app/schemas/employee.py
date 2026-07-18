from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

# ---------------------------------------------------------
# ROLE SCHEMA
# ---------------------------------------------------------

class Role(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------
# SOTTO-SCHEMI HR (READ)
# ---------------------------------------------------------

class Contract(BaseModel):
    id: int
    work_regime_id: int
    contract_nature_id: int
    from_date: date
    to_date: Optional[date] = None
    weekly_hours: Optional[float] = None
    fte: Optional[float] = None
    time_band: Optional[str] = None
    shift_type: Optional[str] = None
    note: Optional[str] = None

    model_config = {"from_attributes": True}


class CostCenter(BaseModel):
    id: int
    cost_center_id: int
    weight_percent: float
    from_date: date
    to_date: Optional[date] = None
    note: Optional[str] = None

    model_config = {"from_attributes": True}


class Department(BaseModel):
    id: int
    department_id: int
    manager_employee_id: Optional[int]
    from_date: date
    to_date: Optional[date] = None
    note: Optional[str] = None

    model_config = {"from_attributes": True}


class Salary(BaseModel):
    id: int
    ral_amount: float
    from_date: date
    to_date: Optional[date] = None
    note: Optional[str] = None

    model_config = {"from_attributes": True}


class SiteHistory(BaseModel):
    id: int
    site_id: int
    from_date: date
    to_date: Optional[date] = None
    note: Optional[str] = None

    model_config = {"from_attributes": True}


class CompanyCar(BaseModel):
    id: int
    car_model: str
    plate: Optional[str]
    from_date: date
    to_date: Optional[date] = None
    benefit_type: Optional[str]
    payroll_notes: Optional[str]
    note: Optional[str]

    model_config = {"from_attributes": True}


class Status(BaseModel):
    id: int
    status_type_id: int
    from_date: date
    to_date: Optional[date] = None
    note: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------
# SOTTO-SCHEMI HR (CREATE)
# ---------------------------------------------------------

class ContractCreate(BaseModel):
    work_regime_id: int
    contract_nature_id: int
    from_date: date
    weekly_hours: Optional[float] = None
    fte: float
    time_band: Optional[str] = None
    shift_type: Optional[str] = None
    note: Optional[str] = None


class CostCenterAssignmentCreate(BaseModel):
    cost_center_id: int
    weight_percent: float
    from_date: date
    note: Optional[str] = None


class DepartmentAssignmentCreate(BaseModel):
    department_id: int
    manager_employee_id: Optional[int] = None
    from_date: date
    note: Optional[str] = None


class SalaryCreate(BaseModel):
    ral_amount: float
    from_date: date
    note: Optional[str] = None


class SiteAssignmentCreate(BaseModel):
    site_id: int
    from_date: date
    note: Optional[str] = None


class BenefitCreate(BaseModel):
    benefit_type: str
    has_benefit: bool
    from_date: date
    note: Optional[str] = None


class CompanyCarCreate(BaseModel):
    car_model: str
    plate: Optional[str] = None
    from_date: date
    benefit_type: Optional[str] = None
    payroll_notes: Optional[str] = None
    note: Optional[str] = None


# ---------------------------------------------------------
# SOTTO-SCHEMI HR (UPDATE)
# ---------------------------------------------------------

class ContractUpdate(BaseModel):
    work_regime_id: Optional[int] = None
    contract_nature_id: Optional[int] = None
    weekly_hours: Optional[float] = None
    fte: Optional[float] = None
    time_band: Optional[str] = None
    shift_type: Optional[str] = None
    note: Optional[str] = None


class SalaryUpdate(BaseModel):
    ral_amount: Optional[float] = None
    note: Optional[str] = None


class DepartmentUpdate(BaseModel):
    department_id: Optional[int] = None
    manager_employee_id: Optional[int] = None
    note: Optional[str] = None


class CostCenterUpdate(BaseModel):
    id: int
    cost_center_id: Optional[int] = None
    weight_percent: Optional[float] = None
    note: Optional[str] = None


class SiteUpdate(BaseModel):
    site_id: Optional[int] = None
    note: Optional[str] = None


class StatusUpdate(BaseModel):
    status_type_id: Optional[int] = None
    note: Optional[str] = None


class CompanyCarUpdate(BaseModel):
    car_model: Optional[str] = None
    plate: Optional[str] = None
    benefit_type: Optional[str] = None
    payroll_notes: Optional[str] = None
    note: Optional[str] = None


# ---------------------------------------------------------
# BASE
# ---------------------------------------------------------

class EmployeeBase(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

    fiscal_code: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[date] = None
    birth_place: Optional[str] = None

    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_cap: Optional[str] = None

    id_lul: Optional[str] = None

    role_id: Optional[int] = None

    # 🔥 SITO ATTUALE DEL DIPENDENTE
    site_id: Optional[int] = None

    hire_date: Optional[date] = None
    termination_date: Optional[date] = None

    is_protected_category: bool = False
    is_disadvantaged: bool = False


# ---------------------------------------------------------
# UPDATE ANAGRAFICA
# ---------------------------------------------------------

class EmployeeUpdate(EmployeeBase):
    pass


# ---------------------------------------------------------
# CREATE DIPENDENTE
# ---------------------------------------------------------

class EmployeeCreate(EmployeeBase):
    email: EmailStr
    first_name: str
    last_name: str
    role_id: int

    # 🔥 Il sito attuale viene preso da site_history.site_id
    # NON serve site_id qui

    contract: ContractCreate
    cost_centers: List[CostCenterAssignmentCreate]
    department: DepartmentAssignmentCreate
    salary: SalaryCreate
    site_history: SiteAssignmentCreate
    benefits: List[BenefitCreate]

    company_car: Optional[CompanyCarCreate] = None


# ---------------------------------------------------------
# OUTPUT DAL DB (BASE)
# ---------------------------------------------------------

class EmployeeInDBBase(EmployeeBase):
    id: int

    model_config = {"from_attributes": True}


# ---------------------------------------------------------
# OUTPUT COMPLETO (CON DATI ATTUALI)
# ---------------------------------------------------------

class Employee(EmployeeInDBBase):
    is_active: bool
    first_access: bool
    created_at: datetime
    updated_at: datetime

    role: Optional[Role] = None

    # 🔥 SITO ATTUALE DEL DIPENDENTE
    site_id: Optional[int] = None

    # 🔥 VALORI ATTUALI (history tables)
    site: Optional[SiteHistory] = None
    department: Optional[Department] = None
    cost_centers: Optional[List[CostCenter]] = None
    contract: Optional[Contract] = None
    salary: Optional[Salary] = None
    company_car: Optional[CompanyCar] = None
    status: Optional[Status] = None

    model_config = {"from_attributes": True}
