import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
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

import {
  createEmployee,
  getDepartmentsBySite,
  getPrepostiBySite,
} from "../../services/employeeService";

import { siteService } from "../../services/siteService";
import { costCenterService } from "../../services/costCenterService";
import { contractService } from "../../services/contractService";
import { benefitService } from "../../services/benefitService";
import { genderService } from "../../services/genderService";

/* ============================================================
   TIPI
============================================================ */

type SiteHistory = {
  site_id: number | null;
  from_date: string;
  note: string;
};

type Contract = {
  work_regime_id: number | null;
  contract_nature_id: number | null;
  from_date: string;
  to_date: string;
  weekly_hours: string;
  fte: string;
  time_band: string;
  shift_type: string;
  note: string;
};

type Department = {
  department_id: number | null;
  manager_employee_id: number | null;
  from_date: string;
  note: string;
};

type Salary = {
  ral_amount: string;
  from_date: string;
  note: string;
};

type CostCenterRow = {
  cost_center_id: number | null;
  weight_percent: string;
  from_date: string;
  note: string;
};

type BenefitRow = {
  benefit_type: string | null;
  has_benefit: boolean;
  from_date: string;
  note: string;
};

type CompanyCar = {
  car_model: string;
  plate: string;
  from_date: string;
  benefit_type: string;
  payroll_notes: string;
  note: string;
};

type EmployeeCreateForm = {
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
  termination_date: string; // resta vuota, non usata nel form
  is_protected_category: boolean;
  is_disadvantaged: boolean;
  site_history: SiteHistory;
  contract: Contract;
  cost_centers: CostCenterRow[];
  department: Department;
  salary: Salary;
  benefits: BenefitRow[];
  company_car: CompanyCar | null;
};

interface EmployeeCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (employee: any) => void;
}

/* ============================================================
   STEPS
============================================================ */

const steps = [
  "Anagrafica",
  "Contratto",
  "Cost Center",
  "Reparto",
  "RAL / Benefit / Auto",
];

/* ============================================================
   COMPONENTE
============================================================ */

const EmployeeCreateModal = ({ open, onClose, onCreated }: EmployeeCreateModalProps) => {
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState<EmployeeCreateForm>({
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
    termination_date: "",
    is_protected_category: false,
    is_disadvantaged: false,
    site_history: {
      site_id: null,
      from_date: "",
      note: "",
    },
    contract: {
      work_regime_id: null,
      contract_nature_id: null,
      from_date: "",
      to_date: "",
      weekly_hours: "",
      fte: "",
      time_band: "",
      shift_type: "",
      note: "",
    },
    cost_centers: [],
    department: {
      department_id: null,
      manager_employee_id: null,
      from_date: "",
      note: "",
    },
    salary: {
      ral_amount: "",
      from_date: "",
      note: "",
    },
    benefits: [],
    company_car: null,
  });

  const [sites, setSites] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [preposti, setPreposti] = useState<any[]>([]);
  const [workRegimes, setWorkRegimes] = useState<any[]>([]);
  const [contractNatures, setContractNatures] = useState<any[]>([]);
  const [costCentersOptions, setCostCentersOptions] = useState<any[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<any[]>([]);
  const [genders, setGenders] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      const [
        sitesRes,
        workRegRes,
        contractNatRes,
        costCentersRes,
        benefitRes,
        gendersRes,
      ] = await Promise.all([
        siteService.getSites(),
        contractService.getWorkRegimes(),
        contractService.getContractNatures(),
        costCenterService.getCostCenters(),
        benefitService.getBenefitTypes(),
        genderService.getGenders(),
      ]);

      setSites(sitesRes);
      setWorkRegimes(workRegRes);
      setContractNatures(contractNatRes);
      setCostCentersOptions(costCentersRes);
      setBenefitTypes(benefitRes);
      setGenders(gendersRes);
    };

    loadData();
  }, [open]);

  /* ============================================================
     HANDLER CAMPI
  ============================================================ */

  const handleChange = (field: keyof EmployeeCreateForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (
    section: keyof EmployeeCreateForm,
    field: string,
    value: any
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const handleArrayChange = (
    section: keyof EmployeeCreateForm,
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

  const addCostCenterRow = () => {
    setFormData((prev) => ({
      ...prev,
      cost_centers: [
        ...prev.cost_centers,
        { cost_center_id: null, weight_percent: "", from_date: "", note: "" },
      ],
    }));
  };

  const addBenefitRow = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        { benefit_type: null, has_benefit: true, from_date: "", note: "" },
      ],
    }));
  };

  const setCompanyCar = (field: keyof CompanyCar, value: any) => {
    setFormData((prev) => ({
      ...prev,
      company_car: {
        ...(prev.company_car || {
          car_model: "",
          plate: "",
          from_date: "",
          benefit_type: "",
          payroll_notes: "",
          note: "",
        }),
        [field]: value,
      },
    }));
  };

  /* ============================================================
     CAMBIO SITO → CARICA REPARTI E PREPOSTI
  ============================================================ */

  const handleSiteChange = async (siteId: number) => {
    setFormData((prev) => ({
      ...prev,
      site_history: { ...prev.site_history, site_id: siteId },
    }));

    if (!siteId) {
      setDepartments([]);
      setPreposti([]);
      return;
    }

    const [depsRes, prepostiRes] = await Promise.all([
      getDepartmentsBySite(siteId),
      getPrepostiBySite(siteId),
    ]);

    setDepartments(depsRes);
    setPreposti(prepostiRes);
  };

  /* ============================================================
     VALIDAZIONE MINIMA
  ============================================================ */

  const isStep0Valid = () =>
    formData.first_name.trim() !== "" &&
    formData.last_name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.site_history.site_id !== null &&
    formData.hire_date.trim() !== "" &&
    formData.gender.trim() !== "";

  const isStep1Valid = () =>
    formData.contract.work_regime_id !== null &&
    formData.contract.contract_nature_id !== null &&
    formData.contract.from_date.trim() !== "" &&
    formData.contract.to_date.trim() !== "";

  const isStep2Valid = () =>
    formData.cost_centers.length > 0 &&
    formData.cost_centers.every(
      (cc) =>
        cc.cost_center_id !== null &&
        cc.weight_percent.trim() !== "" &&
        cc.from_date.trim() !== ""
    );

  const isStep3Valid = () =>
    formData.department.department_id !== null &&
    formData.department.manager_employee_id !== null &&
    formData.department.from_date.trim() !== "";

  const isStep4Valid = () =>
    formData.salary.ral_amount.trim() !== "" &&
    formData.salary.from_date.trim() !== "";

  /* ============================================================
     SUBMIT
  ============================================================ */

  const handleSubmit = async () => {
    try {
      const created = await createEmployee(formData);
      if (onCreated) onCreated(created);
      onClose();
    } catch (err) {
      console.error("Errore creazione dipendente", err);
      alert("Errore durante la creazione del dipendente");
    }
  };

  /* ============================================================
     RENDER STEP
  ============================================================ */

  const renderStep = () => {
    switch (step) {
      /* STEP 0 — ANAGRAFICA + SITO */
      case 0:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Anagrafica
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Nome *"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Cognome *"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Telefono"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Codice fiscale"
                    value={formData.fiscal_code}
                    onChange={(e) => handleChange("fiscal_code", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Genere *</InputLabel>
                    <Select
                      value={formData.gender}
                      label="Genere *"
                      onChange={(e) => handleChange("gender", e.target.value)}
                    >
                      <MenuItem value="">Seleziona</MenuItem>
                      {genders.map((g) => (
                        <MenuItem key={g.id} value={g.code}>
                          {g.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data di nascita"
                    InputLabelProps={{ shrink: true }}
                    value={formData.birth_date}
                    onChange={(e) => handleChange("birth_date", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Luogo di nascita"
                    value={formData.birth_place}
                    onChange={(e) => handleChange("birth_place", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Indirizzo"
                    value={formData.address_street}
                    onChange={(e) =>
                      handleChange("address_street", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Città"
                    value={formData.address_city}
                    onChange={(e) =>
                      handleChange("address_city", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="CAP"
                    value={formData.address_cap}
                    onChange={(e) => handleChange("address_cap", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 3 }}>
                    Sito di assegnazione
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sito *</InputLabel>
                    <Select
                      value={
                        formData.site_history.site_id !== null
                          ? String(formData.site_history.site_id)
                          : ""
                      }
                      label="Sito *"
                      onChange={(e) =>
                        handleSiteChange(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    >
                      <MenuItem value="">Seleziona</MenuItem>
                      {sites.map((s) => (
                        <MenuItem key={s.id} value={String(s.id)}>
                          {s.name || s.code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Dal"
                    InputLabelProps={{ shrink: true }}
                    value={formData.site_history.from_date}
                    onChange={(e) =>
                      handleNestedChange(
                        "site_history",
                        "from_date",
                        e.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Note sito"
                    value={formData.site_history.note}
                    onChange={(e) =>
                      handleNestedChange(
                        "site_history",
                        "note",
                        e.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 3 }}>
                    LUL
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="ID LUL"
                    value={formData.id_lul}
                    onChange={(e) => handleChange("id_lul", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 3 }}>
                    Stato lavorativo
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Data assunzione *"
                    InputLabelProps={{ shrink: true }}
                    value={formData.hire_date}
                    onChange={(e) => handleChange("hire_date", e.target.value)}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.is_protected_category}
                        onChange={(e) =>
                          handleChange(
                            "is_protected_category",
                            e.target.checked
                          )
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
              </Grid>
            </CardContent>
          </Card>
        );

      /* STEP 1 — CONTRATTO */
      case 1:
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
                          e.target.value === ""
                            ? null
                            : Number(e.target.value)
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
                          e.target.value === ""
                            ? null
                            : Number(e.target.value)
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
                    value={formData.contract.from_date}
                    onChange={(e) =>
                      handleNestedChange("contract", "from_date", e.target.value)
                    }
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Scadenza contratto *"
                    InputLabelProps={{ shrink: true }}
                    value={formData.contract.to_date}
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
                      handleNestedChange(
                        "contract",
                        "weekly_hours",
                        e.target.value
                      )
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
                    InputProps={{
                      inputProps: { step: "0.01" },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Fascia oraria"
                    value={formData.contract.time_band}
                    onChange={(e) =>
                      handleNestedChange(
                        "contract",
                        "time_band",
                        e.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Tipo turno"
                    value={formData.contract.shift_type}
                    onChange={(e) =>
                      handleNestedChange(
                        "contract",
                        "shift_type",
                        e.target.value
                      )
                    }
                  />
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
              </Grid>
            </CardContent>
          </Card>
        );

      /* STEP 2 — COST CENTER */
      case 2:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cost Center
              </Typography>

              <Button variant="outlined" onClick={addCostCenterRow} sx={{ mb: 2 }}>
                Aggiungi cost center
              </Button>

              {formData.cost_centers.map((cc, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel>Cost center *</InputLabel>
                      <Select
                        value={
                          cc.cost_center_id !== null
                            ? String(cc.cost_center_id)
                            : ""
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
            </CardContent>
          </Card>
        );

      /* STEP 3 — REPARTO + PREPOSTO */
      case 3:
        return (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Reparto
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Reparto *</InputLabel>
                    <Select
                      value={
                        formData.department.department_id !== null
                          ? String(formData.department.department_id)
                          : ""
                      }
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
                        <MenuItem key={d.id} value={String(d.id)}>
                          {d.name || d.code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Preposto *</InputLabel>
                    <Select
                      value={
                        formData.department.manager_employee_id !== null
                          ? String(formData.department.manager_employee_id)
                          : ""
                      }
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
                        <MenuItem key={p.id} value={String(p.id)}>
                          {p.last_name} {p.first_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Dal *"
                    InputLabelProps={{ shrink: true }}
                    value={formData.department.from_date}
                    onChange={(e) =>
                      handleNestedChange(
                        "department",
                        "from_date",
                        e.target.value
                      )
                    }
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Note reparto"
                    value={formData.department.note}
                    onChange={(e) =>
                      handleNestedChange("department", "note", e.target.value)
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      /* STEP 4 — RAL / BENEFIT / AUTO */
      case 4:
        return (
          <Box>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  RAL
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="RAL *"
                      value={formData.salary.ral_amount}
                      onChange={(e) =>
                        handleNestedChange("salary", "ral_amount", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Dal *"
                      InputLabelProps={{ shrink: true }}
                      value={formData.salary.from_date}
                      onChange={(e) =>
                        handleNestedChange("salary", "from_date", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Note RAL"
                      value={formData.salary.note}
                      onChange={(e) =>
                        handleNestedChange("salary", "note", e.target.value)
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Benefit
                </Typography>

                <Button variant="outlined" onClick={addBenefitRow} sx={{ mb: 2 }}>
                  Aggiungi benefit
                </Button>

                {formData.benefits.map((b, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel>Benefit</InputLabel>
                        <Select
                          value={b.benefit_type ?? ""}
                          label="Benefit"
                          onChange={(e) =>
                            handleArrayChange(
                              "benefits",
                              index,
                              "benefit_type",
                              e.target.value
                            )
                          }
                        >
                          <MenuItem value="">Seleziona</MenuItem>
                          {benefitTypes.map((bt) => (
                            <MenuItem key={bt.id} value={bt.code}>
                              {bt.description || bt.code}
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
              </CardContent>
            </Card>

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
                      label="Tipo benefit"
                      value={formData.company_car?.benefit_type ?? ""}
                      onChange={(e) =>
                        setCompanyCar("benefit_type", e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Note payroll"
                      value={formData.company_car?.payroll_notes ?? ""}
                      onChange={(e) =>
                        setCompanyCar("payroll_notes", e.target.value)
                      }
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
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Nuovo dipendente</DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {renderStep()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>

        {step > 0 && (
          <Button onClick={() => setStep(step - 1)}>Indietro</Button>
        )}

        {step < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 0 && !isStep0Valid()) ||
              (step === 1 && !isStep1Valid()) ||
              (step === 2 && !isStep2Valid()) ||
              (step === 3 && !isStep3Valid())
            }
          >
            Avanti
          </Button>
        )}

        {step === steps.length - 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isStep4Valid()}
          >
            Conferma creazione
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeCreateModal;
