import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  Stack,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Card,
  IconButton,
} from "@mui/material";

import { useEffect, useState } from "react";
import {
  EmployeeCreate,
  ContractCreate,
  CostCenterCreate,
  DepartmentCreate,
  SalaryCreate,
  SiteAssignmentCreate,
  BenefitCreate,
  CompanyCarCreate,
  Role,
  Site,
} from "../../types";

import { employeeService } from "../../services/employeeService";
import DeleteIcon from "@mui/icons-material/Delete";

const steps = [
  "Anagrafica",
  "Contratto",
  "Cost Center",
  "Reparto / RAL / Sito",
  "Benefici / Auto",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function EmployeeCreateModal({ open, onClose, onCreated }: Props) {
  const [activeStep, setActiveStep] = useState(0);

  // ============================
  // MENU A TENDINA (VALORI DA DB)
  // ============================
  const [roles, setRoles] = useState<Role[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [workRegimes, setWorkRegimes] = useState<any[]>([]);
  const [contractNatures, setContractNatures] = useState<any[]>([]);
  const [costCentersList, setCostCentersList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [preposti, setPreposti] = useState<any[]>([]);

  // ============================
  // FORM PRINCIPALE
  // ============================
  const [form, setForm] = useState<EmployeeCreate>({
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
    lul_id: "",
    role_id: 1,
    current_site_id: 1,
    hire_date: "",
    termination_date: "",
    is_protected_category: false,
    is_disadvantaged: false,
    preposto: false, // ⭐ ORA ESISTE NEL TIPO

    contract: {
      work_regime_id: 1,
      contract_nature_id: 1,
      from_date: "",
      weekly_hours: 40,
      fte: 1,
      time_band: "",
      shift_type: "",
      note: "",
    },

    cost_centers: [],

    department: {
      department_id: 1,
      manager_employee_id: undefined,
      from_date: "",
      note: "",
    },

    salary: {
      ral_amount: 0,
      from_date: "",
      note: "",
    },

    site_history: {
      site_id: 1,
      from_date: "",
      note: "",
    },

    benefits: [],

    company_car: undefined,
  });

  // ============================
  // HANDLER CAMPI
  // ============================
  const handleChange = (field: keyof EmployeeCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContractChange = (field: keyof ContractCreate, value: any) => {
    setForm((prev) => ({
      ...prev,
      contract: { ...prev.contract, [field]: value },
    }));
  };

  const handleDepartmentChange = (field: keyof DepartmentCreate, value: any) => {
    setForm((prev) => ({
      ...prev,
      department: { ...prev.department, [field]: value },
    }));
  };

  const handleSalaryChange = (field: keyof SalaryCreate, value: any) => {
    setForm((prev) => ({
      ...prev,
      salary: { ...prev.salary, [field]: value },
    }));
  };

  const handleSiteChange = (field: keyof SiteAssignmentCreate, value: any) => {
    setForm((prev) => ({
      ...prev,
      site_history: { ...prev.site_history, [field]: value },
    }));
  };

  // ============================
  // COST CENTER
  // ============================
  const addCostCenter = () => {
    setForm((prev) => ({
      ...prev,
      cost_centers: [
        ...prev.cost_centers,
        {
          cost_center_id: 1,
          weight_percent: 100,
          from_date: "",
          note: "",
        },
      ],
    }));
  };

  const removeCostCenter = (index: number) => {
    setForm((prev) => ({
      ...prev,
      cost_centers: prev.cost_centers.filter((_, i) => i !== index),
    }));
  };

  // ============================
  // BENEFICI
  // ============================
  const addBenefit = () => {
    setForm((prev) => ({
      ...prev,
      benefits: [
        ...prev.benefits,
        {
          benefit_type: "",
          has_benefit: true,
          from_date: "",
          note: "",
        },
      ],
    }));
  };

  const removeBenefit = (index: number) => {
    setForm((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  // ============================
  // CARICAMENTO VALORI DAL DB
  // ============================
  useEffect(() => {
    if (open) {
      loadDropdowns();
    }
  }, [open]);

  const loadDropdowns = async () => {
    try {
      const [
        rolesRes,
        sitesRes,
        wrRes,
        cnRes,
        ccRes,
        depRes,
        prepostiRes,
      ] = await Promise.all([
        employeeService.getAllRoles(),
        employeeService.getSites(),
        employeeService.getWorkRegimes(),
        employeeService.getContractNatures(),
        employeeService.getCostCenters(),
        employeeService.getDepartments(),
        employeeService.getPreposti(),
      ]);

      setRoles(rolesRes);
      setSites(sitesRes);
      setWorkRegimes(wrRes);
      setContractNatures(cnRes);
      setCostCentersList(ccRes);
      setDepartmentsList(depRes);
      setPreposti(prepostiRes);
    } catch (err) {
      console.error("Errore caricamento dropdown:", err);
    }
  };

  // ============================
  // SUBMIT
  // ============================
  const handleSubmit = async () => {
    await employeeService.createEmployee(form);
    onCreated();
    onClose();
    setActiveStep(0);
  };
  // ============================
  // RENDER STEP
  // ============================
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Nome"
                fullWidth
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
              />
              <TextField
                label="Cognome"
                fullWidth
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
              />
            </Stack>

            <TextField
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Telefono"
                fullWidth
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              <TextField
                label="Codice Fiscale"
                fullWidth
                value={form.fiscal_code}
                onChange={(e) => handleChange("fiscal_code", e.target.value)}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Data di nascita"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.birth_date}
                onChange={(e) => handleChange("birth_date", e.target.value)}
              />
              <TextField
                label="Luogo di nascita"
                fullWidth
                value={form.birth_place}
                onChange={(e) => handleChange("birth_place", e.target.value)}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Indirizzo"
                fullWidth
                value={form.address_street}
                onChange={(e) => handleChange("address_street", e.target.value)}
              />
              <TextField
                label="Città"
                fullWidth
                value={form.address_city}
                onChange={(e) => handleChange("address_city", e.target.value)}
              />
              <TextField
                label="CAP"
                fullWidth
                value={form.address_cap}
                onChange={(e) => handleChange("address_cap", e.target.value)}
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.preposto}
                  onChange={(e) =>
                    handleChange("preposto", e.target.checked)
                  }
                />
              }
              label="Preposto"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_protected_category}
                  onChange={(e) =>
                    handleChange("is_protected_category", e.target.checked)
                  }
                />
              }
              label="Categoria protetta"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.is_disadvantaged}
                  onChange={(e) =>
                    handleChange("is_disadvantaged", e.target.checked)
                  }
                />
              }
              label="Svantaggiato"
            />

            <TextField
              select
              label="Ruolo"
              fullWidth
              value={form.role_id}
              onChange={(e) => handleChange("role_id", Number(e.target.value))}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Sito"
              fullWidth
              value={form.current_site_id}
              onChange={(e) =>
                handleChange("current_site_id", Number(e.target.value))
              }
            >
              {sites.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <TextField
              label="Data inizio contratto"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.contract.from_date}
              onChange={(e) => handleContractChange("from_date", e.target.value)}
            />

            <TextField
              select
              label="Regime di lavoro"
              fullWidth
              value={form.contract.work_regime_id}
              onChange={(e) =>
                handleContractChange("work_regime_id", Number(e.target.value))
              }
            >
              {workRegimes.map((wr) => (
                <MenuItem key={wr.id} value={wr.id}>
                  {wr.code} - {wr.description}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Natura contratto"
              fullWidth
              value={form.contract.contract_nature_id}
              onChange={(e) =>
                handleContractChange("contract_nature_id", Number(e.target.value))
              }
            >
              {contractNatures.map((cn) => (
                <MenuItem key={cn.id} value={cn.id}>
                  {cn.code} - {cn.description}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Ore settimanali"
              fullWidth
              value={form.contract.weekly_hours}
              onChange={(e) =>
                handleContractChange("weekly_hours", Number(e.target.value))
              }
            />

            <TextField
              label="FTE"
              fullWidth
              value={form.contract.fte}
              onChange={(e) =>
                handleContractChange("fte", Number(e.target.value))
              }
            />

            <TextField
              label="Fascia oraria"
              fullWidth
              value={form.contract.time_band}
              onChange={(e) => handleContractChange("time_band", e.target.value)}
            />

            <TextField
              select
              label="Turno"
              fullWidth
              value={form.contract.shift_type}
              onChange={(e) => handleContractChange("shift_type", e.target.value)}
            >
              <MenuItem value="Giornata">Giornata</MenuItem>
              <MenuItem value="Turnista">Turnista</MenuItem>
            </TextField>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Button variant="outlined" onClick={addCostCenter}>
              Aggiungi Cost Center
            </Button>

            {form.cost_centers.map((cc, index) => (
              <Card key={index} sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      Cost Center #{index + 1}
                    </Typography>
                    <IconButton onClick={() => removeCostCenter(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>

                  <TextField
                    select
                    label="Cost Center"
                    fullWidth
                    value={cc.cost_center_id}
                    onChange={(e) => {
                      const updated = [...form.cost_centers];
                      updated[index].cost_center_id = Number(e.target.value);
                      handleChange("cost_centers", updated);
                    }}
                  >
                    {costCentersList.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.code} - {c.description}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Percentuale"
                    fullWidth
                    value={cc.weight_percent}
                    onChange={(e) => {
                      const updated = [...form.cost_centers];
                      updated[index].weight_percent = Number(e.target.value);
                      handleChange("cost_centers", updated);
                    }}
                  />

                  <TextField
                    label="Data inizio"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={cc.from_date}
                    onChange={(e) => {
                      const updated = [...form.cost_centers];
                      updated[index].from_date = e.target.value;
                      handleChange("cost_centers", updated);
                    }}
                  />
                </Stack>
              </Card>
            ))}
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <TextField
              select
              label="Reparto"
              fullWidth
              value={form.department.department_id}
              onChange={(e) =>
                handleDepartmentChange("department_id", Number(e.target.value))
              }
            >
              {departmentsList.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Responsabile"
              fullWidth
              value={form.department.manager_employee_id ?? ""}
              onChange={(e) =>
                handleDepartmentChange(
                  "manager_employee_id",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            >
              {preposti.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.last_name} {p.first_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data inizio reparto"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.department.from_date}
              onChange={(e) =>
                handleDepartmentChange("from_date", e.target.value)
              }
            />

            <TextField
              label="RAL iniziale"
              fullWidth
              value={form.salary.ral_amount}
              onChange={(e) =>
                handleSalaryChange("ral_amount", Number(e.target.value))
              }
            />

            <TextField
              label="Data inizio RAL"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.salary.from_date}
              onChange={(e) => handleSalaryChange("from_date", e.target.value)}
            />

            <TextField
              select
              label="Sito iniziale"
              fullWidth
              value={form.site_history.site_id}
              onChange={(e) =>
                handleSiteChange("site_id", Number(e.target.value))
              }
            >
              {sites.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data inizio sito"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.site_history.from_date}
              onChange={(e) => handleSiteChange("from_date", e.target.value)}
            />
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={2}>
            <Button variant="outlined" onClick={addBenefit}>
              Aggiungi Beneficio
            </Button>

            {form.benefits.map((b, index) => (
              <Card key={index} sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      Beneficio #{index + 1}
                    </Typography>
                    <IconButton onClick={() => removeBenefit(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>

                  <TextField
                    label="Tipo beneficio"
                    fullWidth
                    value={b.benefit_type}
                    onChange={(e) => {
                      const updated = [...form.benefits];
                      updated[index].benefit_type = e.target.value;
                      handleChange("benefits", updated);
                    }}
                  />

                  <TextField
                    label="Data inizio"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={b.from_date}
                    onChange={(e) => {
                      const updated = [...form.benefits];
                      updated[index].from_date = e.target.value;
                      handleChange("benefits", updated);
                    }}
                  />
                </Stack>
              </Card>
            ))}

            <Typography variant="h6" sx={{ mt: 2 }}>
              Auto Aziendale (opzionale)
            </Typography>

            <TextField
              label="Modello auto"
              fullWidth
              value={form.company_car?.car_model ?? ""}
              onChange={(e) =>
                handleChange("company_car", {
                  ...(form.company_car ?? {}),
                  car_model: e.target.value,
                })
              }
            />

            <TextField
              label="Targa"
              fullWidth
              value={form.company_car?.plate ?? ""}
              onChange={(e) =>
                handleChange("company_car", {
                  ...(form.company_car ?? {}),
                  plate: e.target.value,
                })
              }
            />

            <TextField
              label="Data inizio"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.company_car?.from_date ?? ""}
              onChange={(e) =>
                handleChange("company_car", {
                  ...(form.company_car ?? {}),
                  from_date: e.target.value,
                })
              }
            />
          </Stack>
        );
    }
  };
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Nuovo Dipendente</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStep()}
      </DialogContent>

      <DialogActions>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>
            Indietro
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep(activeStep + 1)}
          >
            Avanti
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit}>
            Crea Dipendente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
