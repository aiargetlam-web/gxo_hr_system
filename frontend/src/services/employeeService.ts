import api from "./api";
import { EmployeeFull } from "../types";

/* ============================================================
   GET LISTA DIPENDENTI (FULL)
============================================================ */

export const getEmployeesFull = async (): Promise<EmployeeFull[]> => {
  const response = await api.get("/api/v1/employees/employees");
  return response.data;
};

/* ============================================================
   GET DIPENDENTE SINGOLO (FULL)
============================================================ */

export const getEmployee = async (employeeId: number): Promise<EmployeeFull> => {
  const response = await api.get(`/api/v1/employees/${employeeId}`);
  return response.data;
};

/* ============================================================
   CREATE EMPLOYEE
============================================================ */

export const createEmployee = async (formData: any) => {
  const payload = {
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: formData.email,
    phone: formData.phone,
    fiscal_code: formData.fiscal_code,
    gender: formData.gender,
    birth_date: formData.birth_date,
    birth_place: formData.birth_place,
    address_street: formData.address_street,
    address_city: formData.address_city,
    address_cap: formData.address_cap,

    id_lul: formData.id_lul,

    role_id: formData.role_id,
    hire_date: formData.hire_date,
    termination_date: formData.termination_date,
    is_protected_category: formData.is_protected_category,
    is_disadvantaged: formData.is_disadvantaged,

    site_history: {
      site_id: formData.site_history.site_id,
      from_date: formData.site_history.from_date,
      note: formData.site_history.note,
    },

    contract: {
      work_regime_id: formData.contract.work_regime_id,
      contract_nature_id: formData.contract.contract_nature_id,
      from_date: formData.contract.from_date,
      weekly_hours: formData.contract.weekly_hours,
      fte: formData.contract.fte,
      time_band: formData.contract.time_band,
      shift_type: formData.contract.shift_type,
      note: formData.contract.note,
    },

    cost_centers: formData.cost_centers.map((cc: any) => ({
      cost_center_id: cc.cost_center_id,
      weight_percent: cc.weight_percent,
      from_date: cc.from_date,
      note: cc.note,
    })),

    department: {
      department_id: formData.department.department_id,
      manager_employee_id: formData.department.manager_employee_id,
      from_date: formData.department.from_date,
      note: formData.department.note,
    },

    salary: {
      ral_amount: formData.salary.ral_amount,
      from_date: formData.salary.from_date,
      note: formData.salary.note,
    },

    benefits: formData.benefits.map((b: any) => ({
      benefit_type: b.benefit_type,
      has_benefit: b.has_benefit,
      from_date: b.from_date,
      note: b.note,
    })),

    company_car: formData.company_car
      ? {
          car_model: formData.company_car.car_model,
          plate: formData.company_car.plate,
          from_date: formData.company_car.from_date,
          benefit_type: formData.company_car.benefit_type,
          payroll_notes: formData.company_car.payroll_notes,
          note: formData.company_car.note,
        }
      : null,
  };

  const response = await api.post("/api/v1/employees", payload);
  return response.data;
};

/* ============================================================
   CAMBIO SITO
============================================================ */

export const changeEmployeeSite = async (employeeId: number, data: any) => {
  const payload = {
    site_id: data.site_id,
    from_date: data.from_date,
    note: data.note,
  };

  const response = await api.post(`/api/v1/employees/${employeeId}/sites`, payload);
  return response.data;
};

/* ============================================================
   NUOVO CONTRATTO
============================================================ */

export const addContract = async (employeeId: number, data: any) => {
  const response = await api.post(`/api/v1/employees/${employeeId}/contracts`, data);
  return response.data;
};

/* ============================================================
   NUOVO COST CENTER
============================================================ */

export const addCostCenter = async (employeeId: number, data: any) => {
  const response = await api.post(`/api/v1/employees/${employeeId}/cost-centers`, data);
  return response.data;
};

/* ============================================================
   NUOVO REPARTO
============================================================ */

export const addDepartment = async (employeeId: number, data: any) => {
  const response = await api.post(`/api/v1/employees/${employeeId}/departments`, data);
  return response.data;
};

/* ============================================================
   NUOVA RAL
============================================================ */

export const addSalary = async (employeeId: number, data: any) => {
  const response = await api.post(`/api/v1/employees/${employeeId}/salaries`, data);
  return response.data;
};

/* ============================================================
   NUOVA AUTO AZIENDALE
============================================================ */

export const addCompanyCar = async (employeeId: number, data: any) => {
  const response = await api.post(`/api/v1/employees/${employeeId}/company-cars`, data);
  return response.data;
};

/* ============================================================
   GET PREPOSTI PER SITO
============================================================ */

export const getPrepostiBySite = async (siteId: number) => {
  const response = await api.get(`/api/v1/employees/preposti?site_id=${siteId}`);
  return response.data;
};

/* ============================================================
   GET REPARTI PER SITO
============================================================ */

export const getDepartmentsBySite = async (siteId: number) => {
  const response = await api.get(`/api/v1/departments?site_id=${siteId}`);
  return response.data;
};

/* ============================================================
   STORICI
============================================================ */

export const getEmployeeContracts = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/contracts`);
  return response.data;
};

export const getEmployeeCostCenters = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/cost-centers`);
  return response.data;
};

export const getEmployeeDepartments = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/departments`);
  return response.data;
};

export const getEmployeeSalaries = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/salaries`);
  return response.data;
};

export const getEmployeeCompanyCars = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/company-cars`);
  return response.data;
};

export const getEmployeeSites = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/sites`);
  return response.data;
};

export const getEmployeeStatusHistory = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/status`);
  return response.data;
};

/* ============================================================
   STATO ATTUALE
============================================================ */

export const getEmployeeCurrentStatus = async (employeeId: number) => {
  const response = await api.get(`/api/v1/employees/${employeeId}/current`);
  return response.data;
};

/* ============================================================
   EXPORT OGGETTO
============================================================ */

export const employeeService = {
  getEmployeesFull,
  getEmployee,
  createEmployee,
  changeEmployeeSite,
  addContract,
  addCostCenter,
  addDepartment,
  addSalary,
  addCompanyCar,
  getPrepostiBySite,
  getDepartmentsBySite,
  getEmployeeContracts,
  getEmployeeCostCenters,
  getEmployeeDepartments,
  getEmployeeSalaries,
  getEmployeeCompanyCars,
  getEmployeeSites,
  getEmployeeStatusHistory,
  getEmployeeCurrentStatus,
};
