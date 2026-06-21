from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

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

    lul_id: Optional[str] = None

    role_id: Optional[int] = None
    current_site_id: Optional[int] = None

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
    current_site_id: int

    contract: ContractCreate
    cost_centers: List[CostCenterAssignmentCreate]
    department: DepartmentAssignmentCreate
    salary: SalaryCreate
    site_history: SiteAssignmentCreate
    benefits: List[BenefitCreate]

    company_car: Optional[CompanyCarCreate] = None


# ---------------------------------------------------------
# OUTPUT DAL DB
# ---------------------------------------------------------

class EmployeeInDBBase(EmployeeBase):
    id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# OUTPUT COMPLETO (CON DATI ATTUALI)
# ---------------------------------------------------------

class Employee(EmployeeInDBBase):
    is_active: bool
    first_access: bool
    created_at: datetime
    updated_at: datetime

    # Dati attuali HR
    current_contract: Optional[ContractUpdate] = None
    current_salary: Optional[SalaryUpdate] = None
    current_department: Optional[DepartmentUpdate] = None
    current_site: Optional[SiteUpdate] = None
    current_status: Optional[StatusUpdate] = None
    current_company_car: Optional[CompanyCarUpdate] = None
    current_cost_centers: Optional[List[CostCenterUpdate]] = None

    class Config:
        from_attributes = True
