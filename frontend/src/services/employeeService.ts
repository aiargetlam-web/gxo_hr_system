import api from "./api";

// ============================================================
// GET LISTA DIPENDENTI
// ============================================================

export const getEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

// ============================================================
// GET DIPENDENTE SINGOLO
// ============================================================

export const getEmployee = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}`);
  return response.data;
};

// ============================================================
// CREATE EMPLOYEE (CORRETTO)
// ============================================================

export const createEmployee = async (formData) => {
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

    // 🔥 CORRETTO
    id_lul: formData.id_lul,

    role_id: formData.role_id,
    hire_date: formData.hire_date,
    termination_date: formData.termination_date,
    is_protected_category: formData.is_protected_category,
    is_disadvantaged: formData.is_disadvantaged,

    // 🔥 SITO ATTUALE = site_history.site_id
    site_history: {
      site_id: formData.site_history.site_id,
      from_date: formData.site_history.from_date,
      note: formData.site_history.note,
    },

    // CONTRATTO
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

    // COST CENTER
    cost_centers: formData.cost_centers.map((cc) => ({
      cost_center_id: cc.cost_center_id,
      weight_percent: cc.weight_percent,
      from_date: cc.from_date,
      note: cc.note,
    })),

    // REPARTO
    department: {
      department_id: formData.department.department_id,
      manager_employee_id: formData.department.manager_employee_id,
      from_date: formData.department.from_date,
      note: formData.department.note,
    },

    // RAL
    salary: {
      ral_amount: formData.salary.ral_amount,
      from_date: formData.salary.from_date,
      note: formData.salary.note,
    },

    // BENEFIT
    benefits: formData.benefits.map((b) => ({
      benefit_type: b.benefit_type,
      has_benefit: b.has_benefit,
      from_date: b.from_date,
      note: b.note,
    })),

    // AUTO AZIENDALE
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

  const response = await api.post("/employees", payload);
  return response.data;
};

// ============================================================
// CAMBIO SITO (CORRETTO)
// ============================================================

export const changeEmployeeSite = async (employeeId, data) => {
  const payload = {
    site_id: data.site_id,
    from_date: data.from_date,
    note: data.note,
  };

  const response = await api.post(`/employees/${employeeId}/sites`, payload);
  return response.data;
};

// ============================================================
// NUOVO CONTRATTO
// ============================================================

export const addContract = async (employeeId, data) => {
  const response = await api.post(`/employees/${employeeId}/contracts`, data);
  return response.data;
};

// ============================================================
// NUOVO COST CENTER
// ============================================================

export const addCostCenter = async (employeeId, data) => {
  const response = await api.post(`/employees/${employeeId}/cost-centers`, data);
  return response.data;
};

// ============================================================
// NUOVO REPARTO
// ============================================================

export const addDepartment = async (employeeId, data) => {
  const response = await api.post(`/employees/${employeeId}/departments`, data);
  return response.data;
};

// ============================================================
// NUOVA RAL
// ============================================================

export const addSalary = async (employeeId, data) => {
  const response = await api.post(`/employees/${employeeId}/salaries`, data);
  return response.data;
};

// ============================================================
// NUOVA AUTO AZIENDALE
// ============================================================

export const addCompanyCar = async (employeeId, data) => {
  const response = await api.post(`/employees/${employeeId}/company-cars`, data);
  return response.data;
};

// ============================================================
// GET PREPOSTI PER SITO (CORRETTO)
// ============================================================

export const getPrepostiBySite = async (siteId) => {
  const response = await api.get(`/employees/preposti?site_id=${siteId}`);
  return response.data;
};

// ============================================================
// GET REPARTI PER SITO (CORRETTO)
// ============================================================

export const getDepartmentsBySite = async (siteId) => {
  const response = await api.get(`/departments?site_id=${siteId}`);
  return response.data;
};

// ============================================================
// STORICI
// ============================================================

export const getEmployeeContracts = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/contracts`);
  return response.data;
};

export const getEmployeeCostCenters = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/cost-centers`);
  return response.data;
};

export const getEmployeeDepartments = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/departments`);
  return response.data;
};

export const getEmployeeSalaries = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/salaries`);
  return response.data;
};

export const getEmployeeCompanyCars = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/company-cars`);
  return response.data;
};

export const getEmployeeSites = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/sites`);
  return response.data;
};

export const getEmployeeStatusHistory = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/status`);
  return response.data;
};

// ============================================================
// STATO ATTUALE
// ============================================================

export const getEmployeeCurrentStatus = async (employeeId) => {
  const response = await api.get(`/employees/${employeeId}/current`);
  return response.data;
};
