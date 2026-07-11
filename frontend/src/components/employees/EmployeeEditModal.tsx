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
  Checkbox,
  FormControlLabel,
  Card,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useEffect, useState } from "react";
import {
  EmployeeFull,
  CostCenterCreate,
  ContractCreate,
  SalaryCreate,
  DepartmentCreate,
  SiteAssignmentCreate,
  CompanyCarCreate,
} from "../../types";

import { employeeService } from "../../services/employeeService";

const steps = [
  "Anagrafica",
  "Contratto",
  "RAL",
  "Reparto / Sito / Stato",
  "Cost center / Auto",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: EmployeeFull | null;
}

export default function EmployeeEditModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [activeStep, setActiveStep] = useState(0);

  // ============================
  // STATE LOCALI
  // ============================

  // Anagrafica
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fiscalCode, setFiscalCode] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressCap, setAddressCap] = useState("");
  const [isProtectedCategory, setIsProtectedCategory] = useState(false);
  const [isDisadvantaged, setIsDisadvantaged] = useState(false);

  // Contratto
  const [contractWorkRegimeId, setContractWorkRegimeId] = useState<number>(1);
  const [contractNatureId, setContractNatureId] = useState<number>(1);
  const [contractWeeklyHours, setContractWeeklyHours] = useState<number>(40);
  const [contractFte, setContractFte] = useState<number>(1);
  const [contractTimeBand, setContractTimeBand] = useState<string>("");
  const [contractShiftType, setContractShiftType] = useState<string>("");

  // RAL
  const [salaryRalAmount, setSalaryRalAmount] = useState<number>(0);

  // Reparto / Sito / Stato
  const [departmentId, setDepartmentId] = useState<number>(1);
  const [siteId, setSiteId] = useState<number>(1);
  const [statusTypeId, setStatusTypeId] = useState<number>(1);

  // Cost center
  const [costCenters, setCostCenters] = useState<
    { cost_center_id: number; weight_percent: number; note?: string }[]
  >([]);

  // Auto aziendale
  const [hasCompanyCar, setHasCompanyCar] = useState<boolean>(false);
  const [companyCarModel, setCompanyCarModel] = useState<string>("");
  const [companyCarPlate, setCompanyCarPlate] = useState<string>("");

  // ============================
  // INIZIALIZZAZIONE DA employee
  // ============================

  useEffect(() => {
    if (!employee) return;

    // Anagrafica
    setFirstName(employee.first_name || "");
    setLastName(employee.last_name || "");
    setEmail(employee.email || "");
    setPhone(employee.phone || "");
    setFiscalCode(employee.fiscal_code || "");
    setAddressStreet(employee.address_street || "");
    setAddressCity(employee.address_city || "");
    setAddressCap(employee.address_cap || "");
    setIsProtectedCategory(employee.is_protected_category || false);
    setIsDisadvantaged(employee.is_disadvantaged || false);

    // Contratto attuale
    if (employee.contract) {
      setContractWorkRegimeId(Number(employee.contract.work_regime));
	setContractNatureId(Number(employee.contract.contract_nature));
      setContractWeeklyHours(employee.contract.weekly_hours ?? 40);
      setContractFte(employee.contract.fte);
      setContractTimeBand(employee.contract.time_band ?? "");
      setContractShiftType(employee.contract.shift_type ?? "");
    }

    // RAL attuale
    if (employee.salary) {
      setSalaryRalAmount(employee.salary.ral_amount);
    }

    // Reparto
    if (employee.department) {
      setDepartmentId(employee.department.department_id);
    }

    // Sito
    if (employee.site) {
      setSiteId(employee.site.id);
    }

    // Stato
    if (employee.status) {
      setStatusTypeId(employee.status.status_type_id);
    }

    // Cost center attivi
    if (employee.cost_centers) {
      setCostCenters(
        employee.cost_centers.map((cc) => ({
          cost_center_id: cc.cost_center_id,
          weight_percent: cc.weight_percent,
          note: cc.note ?? "",
        }))
      );
    }

    // Auto aziendale
    if (employee.company_car) {
      setHasCompanyCar(true);
      setCompanyCarModel(employee.company_car.car_model ?? "");
      setCompanyCarPlate(employee.company_car.plate ?? "");
    } else {
      setHasCompanyCar(false);
      setCompanyCarModel("");
      setCompanyCarPlate("");
    }
  }, [employee]);

  // ============================
  // RENDER STEP 0–3
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                label="Cognome"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Stack>

            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Telefono"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                label="Codice fiscale"
                fullWidth
                value={fiscalCode}
                onChange={(e) => setFiscalCode(e.target.value)}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Indirizzo"
                fullWidth
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
              />
              <TextField
                label="Città"
                fullWidth
                value={addressCity}
                onChange={(e) => setAddressCity(e.target.value)}
              />
              <TextField
                label="CAP"
                fullWidth
                value={addressCap}
                onChange={(e) => setAddressCap(e.target.value)}
              />
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isProtectedCategory}
                  onChange={(e) => setIsProtectedCategory(e.target.checked)}
                />
              }
              label="Categoria protetta"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isDisadvantaged}
                  onChange={(e) => setIsDisadvantaged(e.target.checked)}
                />
              }
              label="Svantaggiato"
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={2}>
            <Typography variant="h6">Contratto attuale</Typography>

            <TextField
              label="Regime di lavoro (ID)"
              fullWidth
              value={contractWorkRegimeId}
              onChange={(e) => setContractWorkRegimeId(Number(e.target.value))}
            />

            <TextField
              label="Natura contratto (ID)"
              fullWidth
              value={contractNatureId}
              onChange={(e) => setContractNatureId(Number(e.target.value))}
            />

            <TextField
              label="Ore settimanali"
              fullWidth
              value={contractWeeklyHours}
              onChange={(e) => setContractWeeklyHours(Number(e.target.value))}
            />

            <TextField
              label="FTE"
              fullWidth
              value={contractFte}
              onChange={(e) => setContractFte(Number(e.target.value))}
            />

            <TextField
              label="Fascia oraria"
              fullWidth
              value={contractTimeBand}
              onChange={(e) => setContractTimeBand(e.target.value)}
            />

            <TextField
              label="Turno"
              fullWidth
              value={contractShiftType}
              onChange={(e) => setContractShiftType(e.target.value)}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={2}>
            <Typography variant="h6">RAL attuale</Typography>

            <TextField
              label="Importo RAL"
              fullWidth
              value={salaryRalAmount}
              onChange={(e) => setSalaryRalAmount(Number(e.target.value))}
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={2}>
            <Typography variant="h6">Reparto / Sito / Stato</Typography>

            <TextField
              label="Reparto ID"
              fullWidth
              value={departmentId}
              onChange={(e) => setDepartmentId(Number(e.target.value))}
            />

            <TextField
              label="Sito ID"
              fullWidth
              value={siteId}
              onChange={(e) => setSiteId(Number(e.target.value))}
            />

            <TextField
              label="Stato lavorativo (ID)"
              fullWidth
              value={statusTypeId}
              onChange={(e) => setStatusTypeId(Number(e.target.value))}
            />
          </Stack>
        );
    }
  };

  if (!employee) return null;

  // ============================
  // SUBMIT COMPLETO
  // ============================

  const handleSubmit = async () => {
    if (!employee) return;

    // 1) Aggiorna ANAGRAFICA
    await employeeService.updateEmployee(employee.id, {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      fiscal_code: fiscalCode,
      address_street: addressStreet,
      address_city: addressCity,
      address_cap: addressCap,
      is_protected_category: isProtectedCategory,
      is_disadvantaged: isDisadvantaged,
    });

    // 2) Nuovo CONTRATTO
    const contractPayload: ContractCreate = {
      work_regime_id: contractWorkRegimeId,
      contract_nature_id: contractNatureId,
      weekly_hours: contractWeeklyHours,
      fte: contractFte,
      time_band: contractTimeBand,
      shift_type: contractShiftType,
      from_date: new Date().toISOString().split("T")[0],
    };
    await employeeService.addContract(employee.id, contractPayload);

    // 3) Nuova RAL
    const salaryPayload: SalaryCreate = {
      ral_amount: salaryRalAmount,
      from_date: new Date().toISOString().split("T")[0],
    };
    await employeeService.addSalary(employee.id, salaryPayload);

    // 4) Nuovo REPARTO
    const departmentPayload: DepartmentCreate = {
      department_id: departmentId,
      from_date: new Date().toISOString().split("T")[0],
    };
    await employeeService.addDepartment(employee.id, departmentPayload);

    // 5) Nuovo SITO — CORRETTO DEFINITIVO
    const sitePayload: SiteAssignmentCreate = {
      site_id: siteId,
      from_date: new Date().toISOString().split("T")[0],
    };

    await employeeService.changeSite(employee.id, sitePayload);

    // 6) Nuovo STATO — CORRETTO
    await employeeService.changeStatus(
      employee.id,
      statusTypeId,
      new Date().toISOString().split("T")[0],
      ""
    );

    // 7) Cost center
    for (const cc of costCenters) {
      const payload: CostCenterCreate = {
        cost_center_id: cc.cost_center_id,
        weight_percent: cc.weight_percent,
        from_date: new Date().toISOString().split("T")[0],
        note: cc.note ?? "",
      };
      await employeeService.addCostCenter(employee.id, payload);
    }

    // 8) Auto aziendale
    if (hasCompanyCar) {
      const carPayload: CompanyCarCreate = {
        car_model: companyCarModel,
        plate: companyCarPlate,
        from_date: new Date().toISOString().split("T")[0],
      };
      await employeeService.addCompanyCar(employee.id, carPayload);
    }

    onSaved();
    onClose();
    setActiveStep(0);
  };

  // ============================
  // RENDER STEP 4 (Cost center + Auto)
  // ============================

  const renderCostCentersAccordion = () => {
    return (
      <Stack spacing={2}>
        <Typography variant="h6">Cost center attivi</Typography>

        {costCenters.length === 0 && (
          <Typography>Nessun cost center attivo.</Typography>
        )}

        {costCenters.map((cc, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Cost Center #{index + 1} — {cc.cost_center_id} ({cc.weight_percent}%)
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  label="Cost Center ID"
                  fullWidth
                  value={cc.cost_center_id}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setCostCenters((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, cost_center_id: newValue } : item
                      )
                    );
                  }}
                />

                <TextField
                  label="Percentuale"
                  fullWidth
                  value={cc.weight_percent}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setCostCenters((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, weight_percent: newValue } : item
                      )
                    );
                  }}
                />

                <TextField
                  label="Note"
                  fullWidth
                  value={cc.note ?? ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setCostCenters((prev) =>
                      prev.map((item, i) =>
                        i === index ? { ...item, note: newValue } : item
                      )
                    );
                  }}
                />
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}

        <Typography variant="h6" sx={{ mt: 3 }}>
          Auto aziendale
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={hasCompanyCar}
              onChange={(e) => setHasCompanyCar(e.target.checked)}
            />
          }
          label="Ha auto aziendale"
        />

        {hasCompanyCar && (
          <Card sx={{ p: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Modello auto"
                fullWidth
                value={companyCarModel}
                onChange={(e) => setCompanyCarModel(e.target.value)}
              />

              <TextField
                label="Targa"
                fullWidth
                value={companyCarPlate}
                onChange={(e) => setCompanyCarPlate(e.target.value)}
              />
            </Stack>
          </Card>
        )}
      </Stack>
    );
  };

  const renderStepWithCostCenters = () => {
    if (activeStep === 4) return renderCostCentersAccordion();
    return renderStep();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Modifica dati dipendente</DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepWithCostCenters()}
      </DialogContent>

      <DialogActions>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(activeStep - 1)}>Indietro</Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)}>
            Avanti
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit}>
            Salva modifiche
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
