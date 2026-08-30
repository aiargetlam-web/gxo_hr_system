import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import api from "../../services/api";
import { siteService } from "../../services/siteService";
import { costCenterService } from "../../services/costCenterService";
import { contractService } from "../../services/contractService";
import { benefitService } from "../../services/benefitService";
import { genderService } from "../../services/genderService";
import { roleService } from "../../services/roleService";
import { getDepartmentsBySite, getPrepostiBySite } from "../../services/employeeService";
import { CCNLLevel } from "../../types";
import { EmployeeFull } from "../../types";

interface EmployeeEditModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  employeeId: number | null;
}

/* ============================================================
   TIPI FORM
============================================================ */

type SiteHistory = {
  id?: number;
  site_id: number | null;
  from_date: string;
  note: string;
};

type ContractForm = {
  id?: number;
  work_regime_id: number | null;
  contract_nature_id: number | null;
  from_date: string;
  to_date: string | null;
  weekly_hours: string;
  fte: string;
  time_band: string;
  shift_type_id: number | null;
  note: string;
  level_ccnl_id: number | null;
  employer_id: number | null;
  employer_from_date: string;
  employer_note: string;
};

type DepartmentForm = {
  id?: number;
  department_id: number | null;
  manager_employee_id: number | null;
  from_date: string;
  note: string;
};

type SalaryForm = {
  id?: number;
  ral_amount: string;
  from_date: string;
  note: string;
};

type CostCenterRow = {
  id?: number;
  cost_center_id: number | null;
  weight_percent: string;
  from_date: string;
  note: string;
};

type BenefitRow = {
  id?: number;
  benefit_type_id: number | null;
  has_benefit: boolean;
  from_date: string;
  note: string;
};

type CompanyCarForm = {
  id?: number;
  car_model: string;
  plate: string;
  from_date: string;
  note: string;
};

type EnacCourseForm = {
  id?: number;
  course_date: string;
  expiry_date: string;
  is_first_course: boolean;
  note: string;
};

type EnacApprovalForm = {
  id?: number;
  request_date: string;
  approval_date: string;
  is_first_approval: boolean;
  note: string;
};

type StatusRow = {
  id?: number;
  status_type_id: number | null;
  from_date: string;
  note: string;
};

type EmployeeEditForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  fiscal_code: string;
  gender: string;
  birth_date: string;
  birth_place: string;
  address_street: string;
  address_city: string;
  address_cap: string;
  id_lul: string;
  role_id: number | null;
  hire_date: string;
  termination_date: string | null;
  is_protected_category: boolean;
  is_disadvantaged: boolean;
  has_law_104: boolean;
  law_104_type: number | null;
  law_104_note: string;
  protected_percentage: number | null;
  protected_type: string | null;
  site_history: SiteHistory;
  contract: ContractForm;
  cost_centers: CostCenterRow[];
  department: DepartmentForm;
  salary: SalaryForm;
  benefits: BenefitRow[];
  company_car: CompanyCarForm | null;
  enac_courses: EnacCourseForm[];
  enac_approvals: EnacApprovalForm[];
  status_history: StatusRow[];
};

/* ============================================================
   COMPONENTE
============================================================ */

const EmployeeEditModal = ({ open, onClose, employeeId, onUpdated }: EmployeeEditModalProps) => {
  const [activeSection, setActiveSection] = useState("anagrafica");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<EmployeeEditForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    fiscal_code: "",
    gender: "",
    birth_date: "",
    birth_place: "",
    address_street: "",
    address_city: "",
    address_cap: "",
    id_lul: "",
    role_id: null,
    hire_date: "",
    termination_date: null,
    is_protected_category: false,
    is_disadvantaged: false,
    has_law_104: false,
    law_104_type: null,
    law_104_note: "",
    protected_percentage: null,
    protected_type: null,

    site_history: {
      id: undefined,
      site_id: null,
      from_date: "",
      note: "",
    },

    contract: {
      id: undefined,
      work_regime_id: null,
      contract_nature_id: null,
      from_date: "",
      to_date: null,
      weekly_hours: "",
      fte: "",
      time_band: "",
      shift_type_id: null,
      note: "",
      level_ccnl_id: null,
    },

    cost_centers: [],
    department: {
      id: undefined,
      department_id: null,
      manager_employee_id: null,
      from_date: "",
      note: "",
    },

    salary: {
      id: undefined,
      ral_amount: "",
      from_date: "",
      note: "",
    },

    benefits: [],
    company_car: null,
    enac_courses: [],
    enac_approvals: [],
    status_history: [],
  });

  const [sites, setSites] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [preposti, setPreposti] = useState<any[]>([]);
  const [workRegimes, setWorkRegimes] = useState<any[]>([]);
  const [contractNatures, setContractNatures] = useState<any[]>([]);
  const [costCentersOptions, setCostCentersOptions] = useState<any[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);
  const [ccnlLevels, setCcnlLevels] = useState<CCNLLevel[]>([]);
  const [statusTypes, setStatusTypes] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);


/* ============================================================
   LOAD DATA (EMPLOYEE + DIZIONARI)
============================================================ */

useEffect(() => {
  if (!open || !employeeId) return;

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        sitesRes,
        workRegRes,
        contractNatRes,
        costCentersRes,
        benefitRes,
        gendersRes,
        rolesRes,
        shiftTypesRes,
        ccnlLevelsRes,
        statusTypesRes,
        employeeRes,
        employersRes
      ] = await Promise.all([
        siteService.getSites(),
        contractService.getWorkRegimes(),
        contractService.getContractNatures(),
        costCenterService.getCostCenters(),
        benefitService.getBenefitTypes(),
        genderService.getGenders(),
        roleService.getRoles(),
        contractService.getShiftTypes(),
        api.get("/api/v1/ccnl-levels"),
        api.get("/api/v1/employment-status-types"),
        api.get(`/api/v1/employees/${employeeId}`),
        api.get("/api/v1/employers")
      ]);

      const emp = employeeRes.data;

      /* ============================================================
         MAPPING CORRETTO DEI DATI ATTUALI
      ============================================================= */

      setFormData({
        first_name: emp.first_name ?? "",
        last_name: emp.last_name ?? "",
        email: emp.email ?? "",
        phone: emp.phone ?? "",
        fiscal_code: emp.fiscal_code ?? "",
        gender: emp.gender ?? "",
        birth_date: emp.birth_date ?? "",
        birth_place: emp.birth_place ?? "",
        address_street: emp.address_street ?? "",
        address_city: emp.address_city ?? "",
        address_cap: emp.address_cap ?? "",
        id_lul: emp.id_lul ?? "",
        role_id: emp.role?.id ?? null,
        hire_date: emp.hire_date ?? "",
        termination_date: emp.termination_date ?? null,
        is_protected_category: emp.is_protected_category ?? false,
        is_disadvantaged: emp.is_disadvantaged ?? false,
        has_law_104: emp.has_law_104 ?? false,
        law_104_type: emp.law_104_type ?? null,
        law_104_note: emp.law_104_note ?? "",
        protected_percentage: emp.protected_percentage ?? null,
        protected_type: emp.protected_type ?? null,

        site_history: {
          id: emp.site_history?.id,
          site_id: emp.site_history?.site_id ?? emp.site?.id ?? null,
          from_date: emp.site_history?.from_date ?? "",
          note: emp.site_history?.note ?? "",
        },

        contract: {
          id: emp.contract?.id,
          work_regime_id: emp.contract?.work_regime_id ?? null,
          contract_nature_id: emp.contract?.contract_nature_id ?? null,
          shift_type_id: emp.contract?.shift_type_id ?? null,
          from_date: emp.contract?.from_date ?? "",
          to_date: emp.contract?.to_date ?? null,
          weekly_hours: emp.contract?.weekly_hours?.toString() ?? "",
          fte: emp.contract?.fte?.toString() ?? "",
          time_band: emp.contract?.time_band ?? "",
          note: emp.contract?.note ?? "",
          level_ccnl_id: emp.contract?.level_ccnl_id ?? null,
        },

        cost_centers: (emp.cost_centers ?? []).map((cc: any) => ({
          id: cc.id,
          cost_center_id: cc.cost_center_id,
          weight_percent: cc.weight_percent?.toString() ?? "",
          from_date: cc.from_date ?? "",
          note: cc.note ?? "",
        })),

        department: {
          id: emp.department?.id,
          department_id: emp.department?.department_id ?? null,
          manager_employee_id: emp.department?.manager_employee_id ?? null,
          from_date: emp.department?.from_date ?? "",
          note: emp.department?.note ?? "",
        },

        salary: {
          id: emp.salary?.id,
          ral_amount: emp.salary?.ral_amount?.toString() ?? "",
          from_date: emp.salary?.from_date ?? "",
          note: emp.salary?.note ?? "",
        },

        benefits: (emp.benefits ?? []).map((b: any) => ({
          id: b.id,
          benefit_type_id: b.benefit_type_id,
          has_benefit: b.has_benefit,
          from_date: b.from_date ?? "",
          note: b.note ?? "",
        })),

        company_car: emp.company_car
          ? {
              id: emp.company_car.id,
              car_model: emp.company_car.car_model ?? "",
              plate: emp.company_car.plate ?? "",
              from_date: emp.company_car.from_date ?? "",
              note: emp.company_car.note ?? "",
            }
          : null,

        enac_courses: (emp.enac_courses ?? []).map((c: any) => ({
          id: c.id,
          course_date: c.course_date ?? "",
          expiry_date: c.expiry_date ?? "",
          is_first_course: c.is_first_course ?? false,
          note: c.note ?? "",
        })),

        enac_approvals: (emp.enac_approvals ?? []).map((a: any) => ({
          id: a.id,
          request_date: a.request_date ?? "",
          approval_date: a.approval_date ?? "",
          is_first_approval: a.is_first_approval ?? false,
          note: a.note ?? "",
        })),

        status_history: (emp.status_history ?? []).map((s: any) => ({
          id: s.id,
          status_type_id: s.status_type_id ?? null,
          from_date: s.from_date ?? "",
          note: s.note ?? "",
        })),
      });

      setSites(sitesRes);
      setWorkRegimes(workRegRes);
      setContractNatures(contractNatRes);
      setCostCentersOptions(costCentersRes);
      setBenefitTypes(benefitRes);
      setGenders(gendersRes);
      setRoles(rolesRes);
      setShiftTypes(shiftTypesRes);
      setCcnlLevels(ccnlLevelsRes.data);
      setStatusTypes(statusTypesRes.data);
      setEmployers(employersRes.data);

      if (emp.site?.id) {
        const [depsRes, prepostiRes] = await Promise.all([
          getDepartmentsBySite(emp.site.id),
          getPrepostiBySite(emp.site.id),
        ]);
        setDepartments(depsRes);
        setPreposti(prepostiRes);
      }
    } catch (err) {
      console.error("Errore caricamento dati modifica dipendente:", err);
    }

    setLoading(false);
  };

  loadAll();
}, [open, employeeId]);
/* ============================================================
   HANDLER CAMPI
============================================================ */

const handleChange = (field: keyof EmployeeEditForm, value: any) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};

const handleNestedChange = (
  section: keyof EmployeeEditForm,
  field: string,
  value: any
) => {
  setFormData((prev: any) => ({
    ...prev,
    [section]: { ...(prev[section] || {}), [field]: value },
  }));
};

const handleArrayChange = (
  section: keyof EmployeeEditForm,
  index: number,
  field: string,
  value: any
) => {
  setFormData((prev: any) => {
    const arr = Array.isArray(prev[section]) ? [...prev[section]] : [];
    arr[index] = { ...arr[index], [field]: value };
    return { ...prev, [section]: arr };
  });
};

const setCompanyCar = (field: keyof CompanyCarForm, value: any) => {
  setFormData((prev) => ({
    ...prev,
    company_car: {
      ...(prev.company_car || {
        id: undefined,
        car_model: "",
        plate: "",
        from_date: "",
        note: "",
      }),
      [field]: value,
    },
  }));
};

/* ============================================================
   CAMBIO SITO → CARICA REPARTI E PREPOSTI
============================================================ */

const handleSiteChange = async (siteId: number | null) => {
  setFormData((prev) => ({
    ...prev,
    site_history: { ...prev.site_history, site_id: siteId },
  }));

  if (!siteId) {
    setDepartments([]);
    setPreposti([]);
    return;
  }

  try {
    const [depsRes, prepostiRes] = await Promise.all([
      getDepartmentsBySite(siteId),
      getPrepostiBySite(siteId),
    ]);
    setDepartments(depsRes);
    setPreposti(prepostiRes);
  } catch (err) {
    console.error("Errore caricamento reparti/preposti:", err);
  }
};

/* ============================================================
   REFRESH DIPENDENTE DOPO SALVATAGGIO
============================================================ */

const refreshEmployee = async () => {
  if (!employeeId) return;
  const updated = await api.get(`/api/v1/employees/${employeeId}`);
  onUpdated();
};

/* ============================================================
   SALVATAGGI PER SEZIONE (CORRETTIVI)
============================================================ */

const saveAnagrafica = async () => {
  try {
    setSaving(true);

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
      has_law_104: formData.has_law_104,
      law_104_type: formData.law_104_type,
      law_104_note: formData.law_104_note,
      protected_percentage: formData.protected_percentage,
      protected_type: formData.protected_type,
    };

    await api.put(`/api/v1/employees/${employeeId}`, payload);

    await refreshEmployee();
    alert("Anagrafica aggiornata con successo!");
  } catch (err) {
    console.error("Errore salvataggio anagrafica:", err);
    alert("Errore durante il salvataggio dell'anagrafica");
  } finally {
    setSaving(false);
  }
};

const saveSite = async () => {
  try {
    setSaving(true);

    const payload = {
      site_id: formData.site_history.site_id,
      from_date: formData.site_history.from_date,
      note: formData.site_history.note,
    };

    if (formData.site_history.id) {
      await api.put(
        `/api/v1/employees/${employeeId}/sites/${formData.site_history.id}`,
        payload
      );
    } else {
      await api.put(`/api/v1/employees/${employeeId}/sites/current`, payload);
    }

    await refreshEmployee();
    alert("Sito aggiornato con successo!");
  } catch (err) {
    console.error("Errore salvataggio sito:", err);
    alert("Errore durante il salvataggio del sito");
  } finally {
    setSaving(false);
  }
};

const saveContract = async () => {
  try {
    setSaving(true);

    const payload = {
      work_regime_id: formData.contract.work_regime_id,
      contract_nature_id: formData.contract.contract_nature_id,
      from_date: formData.contract.from_date,
      to_date: formData.contract.to_date,
      weekly_hours: Number(formData.contract.weekly_hours || 0),
      fte: Number(formData.contract.fte || 0),
      time_band: formData.contract.time_band,
      shift_type_id: formData.contract.shift_type_id,
      note: formData.contract.note,
      level_ccnl_id: formData.contract.level_ccnl_id,
    };

    if (formData.contract.id) {
      await api.put(
        `/api/v1/employees/${employeeId}/contracts/${formData.contract.id}`,
        payload
      );
    } else {
      await api.put(`/api/v1/employees/${employeeId}/contracts/current`, payload);
    }

    await refreshEmployee();
    alert("Contratto aggiornato con successo!");
  } catch (err) {
    console.error("Errore salvataggio contratto:", err);
    alert("Errore durante il salvataggio del contratto");
  } finally {
    setSaving(false);
  }
};

const saveCostCenters = async () => {
  try {
    setSaving(true);

    for (const cc of formData.cost_centers) {
      const payload = {
        cost_center_id: cc.cost_center_id,
        weight_percent: Number(cc.weight_percent || 0),
        from_date: cc.from_date,
        note: cc.note,
      };

      if (cc.id) {
        await api.put(
          `/api/v1/employees/${employeeId}/cost-centers/${cc.id}`,
          payload
        );
      } else {
        await api.put(
          `/api/v1/employees/${employeeId}/cost-centers/current`,
          payload
        );
      }
    }

    await refreshEmployee();
    alert("Cost center aggiornati con successo!");
  } catch (err) {
    console.error("Errore salvataggio cost center:", err);
    alert("Errore durante il salvataggio dei cost center");
  } finally {
    setSaving(false);
  }
};

const saveDepartment = async () => {
  try {
    setSaving(true);

    const payload = {
      department_id: formData.department.department_id,
      manager_employee_id: formData.department.manager_employee_id,
      from_date: formData.department.from_date,
      note: formData.department.note,
    };

    if (formData.department.id) {
      await api.put(
        `/api/v1/employees/${employeeId}/departments/${formData.department.id}`,
        payload
      );
    } else {
      await api.put(
        `/api/v1/employees/${employeeId}/departments/current`,
        payload
      );
    }

    await refreshEmployee();
    alert("Reparto aggiornato con successo!");
  } catch (err) {
    console.error("Errore salvataggio reparto:", err);
    alert("Errore durante il salvataggio del reparto");
  } finally {
    setSaving(false);
  }
};

const saveSalary = async () => {
  try {
    setSaving(true);

    const payload = {
      ral_amount: Number(formData.salary.ral_amount || 0),
      from_date: formData.salary.from_date,
      note: formData.salary.note,
    };

    if (formData.salary.id) {
      await api.put(
        `/api/v1/employees/${employeeId}/salaries/${formData.salary.id}`,
        payload
      );
    } else {
      await api.put(
        `/api/v1/employees/${employeeId}/salaries/current`,
        payload
      );
    }

    await refreshEmployee();
    alert("RAL aggiornata con successo!");
  } catch (err) {
    console.error("Errore salvataggio RAL:", err);
    alert("Errore durante il salvataggio della RAL");
  } finally {
    setSaving(false);
  }
};

const saveBenefits = async () => {
  try {
    setSaving(true);

    for (const b of formData.benefits) {
      const payload = {
        benefit_type_id: b.benefit_type_id,
        has_benefit: b.has_benefit,
        from_date: b.from_date,
        note: b.note,
      };

      if (b.id) {
        await api.put(
          `/api/v1/employees/${employeeId}/benefits/${b.id}`,
          payload
        );
      } else {
        await api.put(
          `/api/v1/employees/${employeeId}/benefits/current`,
          payload
        );
      }
    }

    await refreshEmployee();
    alert("Benefit aggiornati con successo!");
  } catch (err) {
    console.error("Errore salvataggio benefit:", err);
    alert("Errore durante il salvataggio dei benefit");
  } finally {
    setSaving(false);
  }
};

const saveCompanyCar = async () => {
  if (!formData.company_car) {
    alert("Nessuna auto aziendale da salvare");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      car_model: formData.company_car.car_model,
      plate: formData.company_car.plate,
      from_date: formData.company_car.from_date,
      note: formData.company_car.note,
    };

    if (formData.company_car.id) {
      await api.put(
        `/api/v1/employees/${employeeId}/company-cars/${formData.company_car.id}`,
        payload
      );
    } else {
      await api.put(
        `/api/v1/employees/${employeeId}/company-cars/current`,
        payload
      );
    }

    await refreshEmployee();
    alert("Auto aziendale aggiornata con successo!");
  } catch (err) {
    console.error("Errore salvataggio auto aziendale:", err);
    alert("Errore durante il salvataggio dell'auto aziendale");
  } finally {
    setSaving(false);
  }
};

const saveEnacCourses = async () => {
  try {
    setSaving(true);

    for (const c of formData.enac_courses) {
      const payload = {
        course_date: c.course_date,
        expiry_date: c.expiry_date,
        is_first_course: c.is_first_course,
        note: c.note,
      };

      if (c.id) {
        await api.put(
          `/api/v1/employees/${employeeId}/enac-courses/${c.id}`,
          payload
        );
      } else {
        await api.put(
          `/api/v1/employees/${employeeId}/enac-courses/current`,
          payload
        );
      }
    }

    await refreshEmployee();
    alert("Corsi ENAC aggiornati con successo!");
  } catch (err) {
    console.error("Errore salvataggio corsi ENAC:", err);
    alert("Errore durante il salvataggio dei corsi ENAC");
  } finally {
    setSaving(false);
  }
};

const saveEnacApprovals = async () => {
  try {
    setSaving(true);

    for (const a of formData.enac_approvals) {
      const payload = {
        request_date: a.request_date,
        approval_date: a.approval_date,
        is_first_approval: a.is_first_approval,
        note: a.note,
      };

      if (a.id) {
        await api.put(
          `/api/v1/employees/${employeeId}/enac-approvals/${a.id}`,
          payload
        );
      } else {
        await api.put(
          `/api/v1/employees/${employeeId}/enac-approvals/current`,
          payload
        );
      }
    }

    await refreshEmployee();
    alert("Approvazioni ENAC aggiornate con successo!");
  } catch (err) {
    console.error("Errore salvataggio approvazioni ENAC:", err);
    alert("Errore durante il salvataggio delle approvazioni ENAC");
  } finally {
    setSaving(false);
  }
};

const saveStatus = async () => {
  try {
    setSaving(true);

    const payload = {
      hire_date: formData.hire_date,
      termination_date: formData.termination_date,
      id_lul: formData.id_lul,
      role_id: formData.role_id,
      is_disadvantaged: formData.is_disadvantaged,
      is_protected_category: formData.is_protected_category,
      protected_type: formData.protected_type,
      protected_percentage: formData.protected_percentage,
      has_law_104: formData.has_law_104,
      law_104_type: formData.law_104_type,
      law_104_note: formData.law_104_note,
    };

    await api.put(`/api/v1/employees/${employeeId}`, payload);

    await refreshEmployee();
    alert("Status aggiornato con successo!");
  } catch (err) {
    console.error("Errore salvataggio status:", err);
    alert("Errore durante il salvataggio dello status");
  } finally {
    setSaving(false);
  }
};

/* ============================================================
   RENDER SECTION
============================================================ */

const renderSection = () => {
  switch (activeSection) {

    /* ============================================================
       STEP 0 — ANAGRAFICA
    ============================================================ */
    case "anagrafica":
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Anagrafica
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Nome *" value={formData.first_name}
                  onChange={(e) => handleChange("first_name", e.target.value)} />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Cognome *" value={formData.last_name}
                  onChange={(e) => handleChange("last_name", e.target.value)} />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Email *" value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)} />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Telefono" value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)} />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Codice fiscale" value={formData.fiscal_code}
                  onChange={(e) => handleChange("fiscal_code", e.target.value)} />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Genere *</InputLabel>
                  <Select value={formData.gender ?? ""} label="Genere *"
                    onChange={(e) => handleChange("gender", e.target.value)}>
                    <MenuItem value="">Seleziona</MenuItem>
                    {genders.map((g) => (
                      <MenuItem key={g.id} value={g.code}>{g.description}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth type="date" label="Data di nascita"
                  InputLabelProps={{ shrink: true }}
                  value={formData.birth_date ?? ""}
                  onChange={(e) => handleChange("birth_date", e.target.value)} />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Luogo di nascita" value={formData.birth_place}
                  onChange={(e) => handleChange("birth_place", e.target.value)} />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Indirizzo" value={formData.address_street}
                  onChange={(e) => handleChange("address_street", e.target.value)} />
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth label="Città" value={formData.address_city}
                  onChange={(e) => handleChange("address_city", e.target.value)} />
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth label="CAP" value={formData.address_cap}
                  onChange={(e) => handleChange("address_cap", e.target.value)} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button variant="contained" color="primary"
                onClick={saveAnagrafica} disabled={saving}>
                {saving ? "Salvataggio..." : "Salva anagrafica"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );


    /* ============================================================
       STEP 1 — CONTRATTO
    ============================================================ */
    case "contratto":
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contratto
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Regime di lavoro *</InputLabel>
                  <Select
                    value={
                      formData.contract.work_regime_id !== null
                        ? String(formData.contract.work_regime_id)
                        : ""
                    }
                    label="Regime di lavoro *"
                    onChange={(e) =>
                      handleNestedChange(
                        "contract",
                        "work_regime_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">Seleziona</MenuItem>
                    {workRegimes.map((wr) => (
                      <MenuItem key={wr.id} value={String(wr.id)}>
                        {wr.description || wr.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Natura contratto *</InputLabel>
                  <Select
                    value={
                      formData.contract.contract_nature_id !== null
                        ? String(formData.contract.contract_nature_id)
                        : ""
                    }
                    label="Natura contratto *"
                    onChange={(e) =>
                      handleNestedChange(
                        "contract",
                        "contract_nature_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">Seleziona</MenuItem>
                    {contractNatures.map((cn) => (
                      <MenuItem key={cn.id} value={String(cn.id)}>
                        {cn.description || cn.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data inizio contratto *"
                  InputLabelProps={{ shrink: true }}
                  value={formData.contract.from_date ?? ""}
                  onChange={(e) =>
                    handleNestedChange("contract", "from_date", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Scadenza contratto"
                  InputLabelProps={{ shrink: true }}
                  value={formData.contract.to_date ?? ""}
                  onChange={(e) =>
                    handleNestedChange("contract", "to_date", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Ore settimanali"
                  value={formData.contract.weekly_hours}
                  onChange={(e) =>
                    handleNestedChange("contract", "weekly_hours", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="FTE"
                  value={formData.contract.fte}
                  onChange={(e) =>
                    handleNestedChange("contract", "fte", e.target.value)
                  }
                  InputProps={{ inputProps: { step: "0.01" } }}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Livello CCNL</InputLabel>
                  <Select
                    value={
                      formData.contract.level_ccnl_id !== null
                        ? String(formData.contract.level_ccnl_id)
                        : ""
                    }
                    label="Livello CCNL"
                    onChange={(e) =>
                      handleNestedChange(
                        "contract",
                        "level_ccnl_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">
                      <em>Seleziona</em>
                    </MenuItem>

                    {ccnlLevels.map((lvl) => (
                      <MenuItem key={lvl.id} value={String(lvl.id)}>
                        {lvl.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Fascia oraria"
                  value={formData.contract.time_band}
                  onChange={(e) =>
                    handleNestedChange("contract", "time_band", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipologia turno *</InputLabel>
                  <Select
                    value={
                      formData.contract.shift_type_id !== null
                        ? String(formData.contract.shift_type_id)
                        : ""
                    }
                    label="Tipologia turno *"
                    onChange={(e) =>
                      handleNestedChange(
                        "contract",
                        "shift_type_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">
                      <em>Seleziona</em>
                    </MenuItem>

                    {shiftTypes.map((st) => (
                      <MenuItem key={st.id} value={String(st.id)}>
                        {st.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Note contratto"
                  value={formData.contract.note}
                  onChange={(e) =>
                    handleNestedChange("contract", "note", e.target.value)
                  }
                />
              </Grid>

              {/* DATORE DI LAVORO */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Datore di lavoro</Typography>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Datore *</InputLabel>
                  <Select
                    value={formData.contract.employer_id ?? ""}
                    label="Datore *"
                    onChange={(e) =>
                      handleNestedChange(
                        "contract",
                        "employer_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">Seleziona</MenuItem>
                    {employers.map((emp: any) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth type="date" label="Dal"
                  InputLabelProps={{ shrink: true }}
                  value={formData.contract.employer_from_date ?? ""}
                  onChange={(e) =>
                    handleNestedChange("contract", "employer_from_date", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth label="Note datore"
                  value={formData.contract.employer_note ?? ""}
                  onChange={(e) =>
                    handleNestedChange("contract", "employer_note", e.target.value)
                  }
                />
              </Grid>

            </Grid>

            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveContract}
                disabled={saving}
              >
                {saving ? "Salvataggio..." : "Salva contratto"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );

    /* ============================================================
       STEP 2 — COST CENTER (senza Aggiungi)
    ============================================================ */
    case "cost_center":
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cost Center
            </Typography>

            {formData.cost_centers.map((cc, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Cost center *</InputLabel>
                    <Select
                      value={
                        cc.cost_center_id !== null ? String(cc.cost_center_id) : ""
                      }
                      label="Cost center *"
                      onChange={(e) =>
                        handleArrayChange(
                          "cost_centers",
                          index,
                          "cost_center_id",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    >
                      <MenuItem value="">Seleziona</MenuItem>
                      {costCentersOptions.map((c) => (
                        <MenuItem key={c.id} value={String(c.id)}>
                          {c.name || c.code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="% peso *"
                    value={cc.weight_percent}
                    onChange={(e) =>
                      handleArrayChange(
                        "cost_centers",
                        index,
                        "weight_percent",
                        e.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Dal *"
                    InputLabelProps={{ shrink: true }}
                    value={cc.from_date}
                    onChange={(e) =>
                      handleArrayChange(
                        "cost_centers",
                        index,
                        "from_date",
                        e.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Note"
                    value={cc.note}
                    onChange={(e) =>
                      handleArrayChange(
                        "cost_centers",
                        index,
                        "note",
                        e.target.value
                      )
                    }
                  />
                </Grid>
              </Grid>
            ))}

                        <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveCostCenters}
                disabled={saving}
              >
                {saving ? "Salvataggio..." : "Salva cost center"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );

    /* ============================================================
       STEP 3 — REPARTO
    ============================================================ */
    case "assegnazione":
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Assegnazione (Sito + Reparto)
            </Typography>

            <Grid container spacing={2}>
              {/* SITO */}
              <Grid item xs={12}>
                <Typography variant="subtitle1">Sito</Typography>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Sito *</InputLabel>
                  <Select
                    value={formData.site_history.site_id ?? ""}
                    label="Sito *"
                    onChange={(e) =>
                      handleSiteChange(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                 >
                    <MenuItem value="">Seleziona</MenuItem>
                    {sites.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth type="date" label="Dal"
                  InputLabelProps={{ shrink: true }}
                  value={formData.site_history.from_date}
                  onChange={(e) =>
                    handleNestedChange("site_history", "from_date", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth label="Note sito"
                  value={formData.site_history.note}
                  onChange={(e) =>
                    handleNestedChange("site_history", "note", e.target.value)
                  }
                />
              </Grid>

              {/* REPARTO */}
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Reparto</Typography>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Reparto *</InputLabel>
                  <Select
                    value={formData.department.department_id ?? ""}
                    label="Reparto *"
                    onChange={(e) =>
                      handleNestedChange(
                        "department",
                        "department_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">Seleziona</MenuItem>
                    {departments.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Preposto *</InputLabel>
                  <Select
                    value={formData.department.manager_employee_id ?? ""}
                    label="Preposto *"
                    onChange={(e) =>
                      handleNestedChange(
                        "department",
                        "manager_employee_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">Seleziona</MenuItem>
                    {preposti.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.last_name} {p.first_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth type="date" label="Dal"
                  InputLabelProps={{ shrink: true }}
                  value={formData.department.from_date}
                  onChange={(e) =>
                    handleNestedChange("department", "from_date", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <TextField fullWidth label="Note reparto"
                  value={formData.department.note}
                  onChange={(e) =>
                    handleNestedChange("department", "note", e.target.value)
                  }
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: "right", display: "flex", gap: 2 }}>
              <Button variant="contained" color="primary"
                onClick={async () => {
                  await saveSite();
                  await saveDepartment();
                }}
                disabled={saving}
              >
                {saving ? "Salvataggio..." : "Salva assegnazione"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );


    /* ============================================================
       STEP 5 — BENEFIT
    ============================================================ */
    case "benefit":
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Benefit
            </Typography>

            {formData.benefits.map((b, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Benefit</InputLabel>
                    <Select
                      value={b.benefit_type_id ?? ""}
                      label="Benefit"
                      onChange={(e) =>
                        handleArrayChange(
                          "benefits",
                          index,
                          "benefit_type_id",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    >
                      <MenuItem value="">Seleziona</MenuItem>
                      {benefitTypes.map((bt) => (
                        <MenuItem key={bt.id} value={bt.id}>
                          {bt.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={b.has_benefit}
                        onChange={(e) =>
                          handleArrayChange(
                            "benefits",
                            index,
                            "has_benefit",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Attivo"
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Dal"
                    InputLabelProps={{ shrink: true }}
                    value={b.from_date}
                    onChange={(e) =>
                      handleArrayChange(
                        "benefits",
                        index,
                        "from_date",
                        e.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Note"
                    value={b.note}
                    onChange={(e) =>
                      handleArrayChange(
                        "benefits",
                        index,
                        "note",
                        e.target.value
                      )
                    }
                  />
                </Grid>
              </Grid>
            ))}

            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveBenefits}
                disabled={saving}
              >
                {saving ? "Salvataggio..." : "Salva benefit"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );
    /* ============================================================
       STEP 6 — AUTO AZIENDALE
    ============================================================ */
    case "auto":
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Auto aziendale
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Modello auto"
                  value={formData.company_car?.car_model ?? ""}
                  onChange={(e) => setCompanyCar("car_model", e.target.value)}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Targa"
                  value={formData.company_car?.plate ?? ""}
                  onChange={(e) => setCompanyCar("plate", e.target.value)}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Dal"
                  InputLabelProps={{ shrink: true }}
                  value={formData.company_car?.from_date ?? ""}
                  onChange={(e) => setCompanyCar("from_date", e.target.value)}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Note auto"
                  value={formData.company_car?.note ?? ""}
                  onChange={(e) => setCompanyCar("note", e.target.value)}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveCompanyCar}
                disabled={saving}
              >
                {saving ? "Salvataggio..." : "Salva auto aziendale"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );


/* ============================================================
   STEP — ENAC (Corsi + Approvazioni)
============================================================ */
case "enac":
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ENAC – Corsi e Approvazioni
        </Typography>

        {/* ============================
            BOX 1 — CORSI ENAC
        ============================ */}
        <Box sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2, mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Corsi ENAC
          </Typography>


          {formData.enac_courses.map((c, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data corso"
                  InputLabelProps={{ shrink: true }}
                  value={c.course_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "enac_courses",
                      index,
                      "course_date",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Scadenza"
                  InputLabelProps={{ shrink: true }}
                  value={c.expiry_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "enac_courses",
                      index,
                      "expiry_date",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={c.is_first_course}
                      onChange={(e) =>
                        handleArrayChange(
                          "enac_courses",
                          index,
                          "is_first_course",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Primo corso"
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Note"
                  value={c.note}
                  onChange={(e) =>
                    handleArrayChange(
                      "enac_courses",
                      index,
                      "note",
                      e.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          ))}

          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveEnacCourses}
              disabled={saving}
            >
              {saving ? "Salvataggio..." : "Salva corsi ENAC"}
            </Button>
          </Box>
        </Box>

        {/* ============================
            BOX 2 — APPROVAZIONI ENAC
        ============================ */}
        <Box sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Approvazioni ENAC
          </Typography>

          {formData.enac_approvals.map((a, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data richiesta"
                  InputLabelProps={{ shrink: true }}
                  value={a.request_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "enac_approvals",
                      index,
                      "request_date",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data approvazione"
                  InputLabelProps={{ shrink: true }}
                  value={a.approval_date}
                  onChange={(e) =>
                    handleArrayChange(
                      "enac_approvals",
                      index,
                      "approval_date",
                      e.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={a.is_first_approval}
                      onChange={(e) =>
                        handleArrayChange(
                          "enac_approvals",
                          index,
                          "is_first_approval",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Prima approvazione"
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Note"
                  value={a.note}
                  onChange={(e) =>
                    handleArrayChange(
                      "enac_approvals",
                      index,
                      "note",
                      e.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          ))}

          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={saveEnacApprovals}
              disabled={saving}
            >
              {saving ? "Salvataggio..." : "Salva approvazioni ENAC"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

    /* ============================================================
       STEP 9 — STATUS
    ============================================================ */
    case "status":
      return (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Stato amministrativo
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth type="date" label="Data assunzione"
                  InputLabelProps={{ shrink: true }}
                  value={formData.hire_date}
                  onChange={(e) => handleChange("hire_date", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="ID LUL"
                  value={formData.id_lul}
                  onChange={(e) => handleChange("id_lul", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Ruolo *</InputLabel>
                  <Select
                    value={formData.role_id ?? ""}
                    label="Ruolo *"
                    onChange={(e) =>
                      handleChange(
                        "role_id",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <MenuItem value="">Seleziona</MenuItem>
                    {roles.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_protected_category}
                      onChange={(e) =>
                        handleChange("is_protected_category", e.target.checked)
                      }
                    />
                  }
                  label="Categoria protetta"
                />
              </Grid>

              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_disadvantaged}
                      onChange={(e) =>
                        handleChange("is_disadvantaged", e.target.checked)
                      }
                    />
                  }
                  label="Svantaggiato"
               />
              </Grid>

              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.has_law_104}
                      onChange={(e) =>
                        handleChange("has_law_104", e.target.checked)
                      }
                    />
                  }
                  label="Legge 104"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Note 104"
                  value={formData.law_104_note}
                  onChange={(e) => handleChange("law_104_note", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth type="number" label="% categoria protetta"
                  value={formData.protected_percentage ?? ""}
                  onChange={(e) =>
                    handleChange(
                      "protected_percentage",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField fullWidth label="Tipo categoria protetta"
                  value={formData.protected_type ?? ""}
                  onChange={(e) => handleChange("protected_type", e.target.value)}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: "right" }}>
              <Button variant="contained" color="primary"
                onClick={saveStatus}
                disabled={saving}
              >
                {saving ? "Salvataggio..." : "Salva stato"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      );


    default:
      return null;
  }
};
/* ============================================================
   LOADING SCREEN
============================================================ */

if (!open) return null;

if (loading) {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
      onClick={() => onClose()}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 3,
          minWidth: 600,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6">Modifica dipendente</Typography>
        <Typography sx={{ mt: 2 }}>Caricamento dati...</Typography>
      </Box>
    </Box>
  );
}

return (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      bgcolor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "stretch",
      justifyContent: "center",
      zIndex: 1300,
    }}
    onClick={() => onClose()}
  >
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 2,
        m: 4,
        width: "90%",
        height: "90%",
        display: "flex",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 260,
          borderRight: 1,
          borderColor: "divider",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Modifica dipendente
        </Typography>

        {[
          { key: "anagrafica", label: "Anagrafica" },
          { key: "assegnazione", label: "Assegnazione" },
          { key: "contratto", label: "Contratto" },
          { key: "status", label: "Status" },
          { key: "ral", label: "RAL" },
          { key: "cost_center", label: "Cost Center" },
          { key: "benefit", label: "Benefit" },
          { key: "auto", label: "Auto aziendale" },
          { key: "enac", label: "ENAC" },
        ].map((item) => (
          <Button
            key={item.key}
            variant={activeSection === item.key ? "contained" : "text"}
            color={activeSection === item.key ? "primary" : "inherit"}
            onClick={() => setActiveSection(item.key)}
            sx={{ justifyContent: "flex-start" }}
          >
            {item.label}
          </Button>
        ))}

        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button fullWidth variant="outlined" onClick={onClose}>
            Chiudi
          </Button>
        </Box>
      </Box>

      {/* Contenuto */}
      <Box sx={{ flex: 1, p: 3, overflow: "auto" }}>
        {renderSection()}
      </Box>
    </Box>
  </Box>
);

};

export default EmployeeEditModal;
