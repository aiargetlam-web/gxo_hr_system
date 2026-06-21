/* ============================
   ROLE
============================ */
export interface Role {
  id: number;
  name: string;
  description?: string;
}

/* ============================
   SITE
============================ */
export interface Site {
  id: number;
  name: string;
}

/* ============================
   HR MODULES (STORICO)
============================ */
export interface Contract {
  id: number;
  work_regime_id: number;
  contract_nature_id: number;
  from_date: string;
  to_date?: string | null;
  weekly_hours?: number;
  fte: number;
  time_band?: string;
  shift_type?: string;
  note?: string;
}

export interface Salary {
  id: number;
  ral_amount: number;
  from_date: string;
  to_date?: string | null;
  note?: string;
}

export interface Department {
  id: number;
  department_id: number;
  manager_employee_id?: number | null;
  from_date: string;
  to_date?: string | null;
  note?: string;
}

export interface CostCenter {
  id: number;
  cost_center_id: number;
  weight_percent: number;
  from_date: string;
  to_date?: string | null;
  note?: string;
}

export interface CompanyCar {
  id: number;
  car_model: string;
  plate?: string;
  from_date: string;
  to_date?: string | null;
  benefit_type?: string;
  payroll_notes?: string;
  note?: string;
}

export interface SiteHistory {
  id: number;
  site_id: number;
  from_date: string;
  to_date?: string | null;
  note?: string;
}

export interface StatusHistory {
  id: number;
  status_type_id: number;
  from_date: string;
  to_date?: string | null;
  note?: string;
}

/* ============================
   HR MODULES (CREATE)
============================ */
export interface ContractCreate {
  work_regime_id: number;
  contract_nature_id: number;
  from_date: string;
  weekly_hours?: number;
  fte: number;
  time_band?: string;
  shift_type?: string;
  note?: string;
}

export interface CostCenterCreate {
  cost_center_id: number;
  weight_percent: number;
  from_date: string;
  note?: string;
}

export interface DepartmentCreate {
  department_id: number;
  manager_employee_id?: number;
  from_date: string;
  note?: string;
}

export interface SalaryCreate {
  ral_amount: number;
  from_date: string;
  note?: string;
}

export interface SiteAssignmentCreate {
  site_id: number;
  from_date: string;
  note?: string;
}

export interface BenefitCreate {
  benefit_type: string;
  has_benefit: boolean;
  from_date: string;
  note?: string;
}

export interface CompanyCarCreate {
  car_model: string;
  plate?: string;
  from_date: string;
  benefit_type?: string;
  payroll_notes?: string;
  note?: string;
}

/* ============================
   HR MODULES (UPDATE)
============================ */
export interface ContractUpdate {
  work_regime_id?: number;
  contract_nature_id?: number;
  weekly_hours?: number;
  fte?: number;
  time_band?: string;
  shift_type?: string;
  note?: string;
}

export interface SalaryUpdate {
  ral_amount?: number;
  note?: string;
}

export interface DepartmentUpdate {
  department_id?: number;
  manager_employee_id?: number | null;
  note?: string;
}

export interface CostCenterUpdate {
  id: number;
  cost_center_id?: number;
  weight_percent?: number;
  note?: string;
}

export interface SiteUpdate {
  site_id?: number;
  note?: string;
}

export interface StatusUpdate {
  status_type_id?: number;
  note?: string;
}

export interface CompanyCarUpdate {
  car_model?: string;
  plate?: string;
  benefit_type?: string;
  payroll_notes?: string;
  note?: string;
}

/* ============================
   EMPLOYEE BASE
============================ */
export interface Employee {
  id: number;

  first_name: string;
  last_name: string;
  email: string;
  phone?: string;

  fiscal_code?: string;
  gender?: string;
  birth_date?: string;
  birth_place?: string;

  address_street?: string;
  address_city?: string;
  address_cap?: string;

  lul_id?: string;

  role_id: number;
  role?: Role;

  current_site_id: number;
  site?: Site;

  hire_date?: string;
  termination_date?: string;

  is_protected_category: boolean;
  is_disadvantaged: boolean;

  is_active: boolean;
  first_access: boolean;

  created_at: string;
  updated_at: string;

  /* ============================
     DATI ATTUALI HR
  ============================ */
  current_contract?: Contract | null;
  current_salary?: Salary | null;
  current_department?: Department | null;
  current_cost_centers?: CostCenter[] | null;
  current_company_car?: CompanyCar | null;
  current_site?: SiteHistory | null;
  current_status?: StatusHistory | null;
}

/* ============================
   EMPLOYEE CREATE
============================ */
export interface EmployeeCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;

  fiscal_code?: string;
  gender?: string;
  birth_date?: string;
  birth_place?: string;

  address_street?: string;
  address_city?: string;
  address_cap?: string;

  lul_id?: string;

  role_id: number;
  current_site_id: number;

  hire_date?: string;
  termination_date?: string;

  is_protected_category: boolean;
  is_disadvantaged: boolean;

  contract: ContractCreate;
  cost_centers: CostCenterCreate[];
  department: DepartmentCreate;
  salary: SalaryCreate;
  site_history: SiteAssignmentCreate;
  benefits: BenefitCreate[];
  company_car?: CompanyCarCreate;
}

/* ============================
   AUTH
============================ */
export interface EmployeeAuth {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
}

/* ============================
   EMPLOYEE FULL (DETTAGLIO)
============================ */
export interface EmployeeFull {
  id: number;
  first_name: string;
  last_name: string;
  email: string;

  role_id: number;
  role_name?: string;

  id_lul?: string | null;

  site_id?: number | null;
  site_name?: string | null;

  department?: string | null;
  contract?: string | null;
  status?: string | null;

  is_active?: boolean;
}

/* ============================
   BOARD FILE
============================ */
export interface BoardFile {
  id: number;
  file_name: string;
  upload_date: string;
  is_active: boolean;
  sites: { id: number; name: string }[];
}
