import api from "./api";
import {
  EmployeeCreate,
  Employee,
  EmployeeFull,
  ContractCreate,
  SalaryCreate,
  DepartmentCreate,
  CostCenterCreate,
  SiteAssignmentCreate,
  CompanyCarCreate,
} from "../types";

export const employeeService = {
  // ============================
  // GET LISTA DIPENDENTI (FULL)
  // ============================
  getAll: async (): Promise<EmployeeFull[]> => {
    const res = await api.get("/api/v1/employees");
    return res.data;
  },

  // ============================
  // GET DETTAGLIO COMPLETO DIPENDENTE
  // ============================
  getById: async (id: number): Promise<EmployeeFull> => {
    const res = await api.get(`/api/v1/employees/${id}`);
    return res.data;
  },

  // ============================
  // CREATE DIPENDENTE (WIZARD)
  // ============================
  createEmployee: async (data: EmployeeCreate): Promise<EmployeeFull> => {
    const res = await api.post("/api/v1/employees", data);
    return res.data;
  },

  // ============================
  // UPDATE ANAGRAFICA DIPENDENTE
  // ============================
  updateEmployee: async (id: number, data: any): Promise<EmployeeFull> => {
    const res = await api.put(`/api/v1/employees/${id}`, data);
    return res.data;
  },

  // ============================
  // CONTRATTO (storico)
  // ============================
  addContract: async (employeeId: number, data: ContractCreate) => {
    const res = await api.post(
      `/api/v1/employees/${employeeId}/contracts`,
      data
    );
    return res.data;
  },

  // ============================
  // RAL (storico)
  // ============================
  addSalary: async (employeeId: number, data: SalaryCreate) => {
    const res = await api.post(
      `/api/v1/employees/${employeeId}/salaries`,
      data
    );
    return res.data;
  },

  // ============================
  // REPARTO (storico)
  // ============================
  addDepartment: async (employeeId: number, data: DepartmentCreate) => {
    const res = await api.post(
      `/api/v1/employees/${employeeId}/departments`,
      data
    );
    return res.data;
  },

  // ============================
  // COST CENTER (storico)
  // ============================
  addCostCenter: async (employeeId: number, data: CostCenterCreate) => {
    const res = await api.post(
      `/api/v1/employees/${employeeId}/cost-centers`,
      data
    );
    return res.data;
  },

  // ============================
  // CAMBIO SITO (storico)
  // ============================
  changeSite: async (employeeId: number, data: SiteAssignmentCreate) => {
    const res = await api.post(
      `/api/v1/employees/${employeeId}/sites`,
      data
    );
    return res.data;
  },

  // ============================
  // STATO LAVORATIVO (storico)
  // ============================
  changeStatus: async (
    employeeId: number,
    statusTypeId: number,
    fromDate: string,
    note?: string
  ) => {
    const res = await api.post(
      `/api/v1/employees/${employeeId}/status`,
      {
        status_type_id: statusTypeId,
        from_date: fromDate,
        note,
      }
    );
    return res.data;
  },

  // ============================
  // AUTO AZIENDALE (storico)
  // ============================
  addCompanyCar: async (employeeId: number, data: CompanyCarCreate) => {
    const res = await api.post(
      `/api/v1/employees/${employeeId}/company-cars`,
      data
    );
    return res.data;
  },

  // ============================
  // MENU A TENDINA – VALORI DA DB
  // ============================
  getWorkRegimes: async () => {
    const res = await api.get("/api/v1/work-regimes");
    return res.data;
  },

  getContractNatures: async () => {
    const res = await api.get("/api/v1/contract-natures");
    return res.data;
  },

  getCostCenters: async () => {
    const res = await api.get("/api/v1/cost-centers");
    return res.data;
  },

  getDepartments: async () => {
    const res = await api.get("/api/v1/departments");
    return res.data;
  },

  getSites: async () => {
    const res = await api.get("/api/v1/sites");
    return res.data;
  },

  getPreposti: async () => {
    const res = await api.get("/api/v1/employees/preposti");
    return res.data;
  },

  getAllRoles: async () => {
    const res = await api.get("/api/v1/roles");
    return res.data;
  },
};
