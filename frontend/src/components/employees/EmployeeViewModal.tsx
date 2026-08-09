import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Box,
  Stack,
  Card,
  Divider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { employeeService } from "../../services/employeeService";
import { EmployeeFull } from "../../types";
import { CostCenter } from "../../types";



interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: number | null;
}

export default function EmployeeDetailModal({ open, onClose, employeeId }: Props) {
  const [employee, setEmployee] = useState<EmployeeFull | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!employeeId) return;

    const load = async () => {
      const data = await employeeService.getEmployee(employeeId);
      setEmployee(data);
    };

    load();
  }, [employeeId]);

  if (!employee) return null;

  const steps = [
    "Anagrafica",
    "Contratto",
    "RAL",
    "Reparto / Sito / Stato",
    "Cost Center / Auto",
  ];

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      {/* HEADER D2 */}
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
            {employee.first_name[0]}
            {employee.last_name[0]}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography variant="body2">{employee.email}</Typography>
          </Box>

          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* TABS (stepper cliccabile) */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: "1px solid #ddd" }}
      >
        {steps.map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </Tabs>

      {/* CONTENUTO */}
      <Box p={3}>
        {tab === 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Anagrafica</Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Typography><strong>Nome:</strong> {employee.first_name}</Typography>
              <Typography><strong>Cognome:</strong> {employee.last_name}</Typography>
              <Typography><strong>Email:</strong> {employee.email}</Typography>
              <Typography><strong>Telefono:</strong> {employee.phone ?? "-"}</Typography>
              <Typography><strong>Codice Fiscale:</strong> {employee.fiscal_code ?? "-"}</Typography>
              <Typography><strong>Protetta:</strong> {employee.is_protected_category ? "Sì" : "No"}</Typography>
              <Typography><strong>Svantaggiato:</strong> {employee.is_disadvantaged ? "Sì" : "No"}</Typography>
            </Stack>
          </Card>
        )}

        {tab === 1 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Contratto</Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Typography><strong>Regime:</strong> {employee.contract?.work_regime ?? "-"}</Typography>
              <Typography><strong>Natura:</strong> {employee.contract?.contract_nature ?? "-"}</Typography>
              <Typography><strong>Ore settimanali:</strong> {employee.contract?.weekly_hours ?? "-"}</Typography>
              <Typography><strong>FTE:</strong> {employee.contract?.fte ?? "-"}</Typography>
              <Typography><strong>Fascia oraria:</strong> {employee.contract?.time_band ?? "-"}</Typography>
              <Typography><strong>Turno:</strong> {employee.contract?.shift_type ?? "-"}</Typography>
              <Typography><strong>Dal:</strong> {employee.contract?.from_date ?? "-"}</Typography>
              <Typography><strong>Al:</strong> {employee.contract?.to_date ?? "-"}</Typography>
            </Stack>
          </Card>
        )}

        {tab === 2 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">RAL</Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Typography><strong>RAL:</strong> {employee.salary?.ral_amount ?? "-"}</Typography>
              <Typography><strong>Dal:</strong> {employee.salary?.from_date ?? "-"}</Typography>
              <Typography><strong>Al:</strong> {employee.salary?.to_date ?? "-"}</Typography>
            </Stack>
          </Card>
        )}

        {tab === 3 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Reparto / Sito / Stato</Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={1}>
              <Typography><strong>Reparto ID:</strong> {employee.department?.department_id ?? "-"}</Typography>
              <Typography><strong>Sito:</strong> {employee.site?.name ?? "-"}</Typography>
              <Typography><strong>Status:</strong> {employee.status?.status_type?.name ?? "-"}</Typography>
            </Stack>
          </Card>
        )}

        {tab === 4 && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6">Cost Center / Auto</Typography>
            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Typography variant="subtitle1">Cost Center</Typography>
              {employee.cost_centers?.length ? (
                employee.cost_centers.map((cc: CostCenter, i: number) => (
                  <Typography key={i}>
                    #{i + 1} — {cc.cost_center_id} ({cc.weight_percent}%)
                  </Typography>
                ))
              ) : (
                <Typography>Nessun cost center attivo.</Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1">Auto Aziendale</Typography>
              <Typography><strong>Modello:</strong> {employee.company_car?.car_model ?? "-"}</Typography>
              <Typography><strong>Targa:</strong> {employee.company_car?.plate ?? "-"}</Typography>
              <Typography><strong>Benefit:</strong> {employee.company_car?.benefit_type ?? "-"}</Typography>
              <Typography><strong>Dal:</strong> {employee.company_car?.from_date ?? "-"}</Typography>
              <Typography><strong>Al:</strong> {employee.company_car?.to_date ?? "-"}</Typography>
            </Stack>
          </Card>
        )}
      </Box>
    </Dialog>
  );
}
