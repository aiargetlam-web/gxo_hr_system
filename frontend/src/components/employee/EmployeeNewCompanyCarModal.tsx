import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import { useState } from "react";
import { CompanyCarCreate, Employee } from "../../types";
import { employeeService } from "../../services/employeeService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export default function EmployeeNewCompanyCarModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [form, setForm] = useState<CompanyCarCreate>({
    car_model: "",
    plate: "",
    from_date: "",
    benefit_type: "",
    payroll_notes: "",
    note: "",
  });

  const handleChange = (field: keyof CompanyCarCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;
    await employeeService.addCompanyCar(employee.id, form);
    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuova Auto Aziendale</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Modello auto"
            fullWidth
            value={form.car_model}
            onChange={(e) => handleChange("car_model", e.target.value)}
          />

          <TextField
            label="Targa"
            fullWidth
            value={form.plate}
            onChange={(e) => handleChange("plate", e.target.value)}
          />

          <TextField
            label="Data decorrenza"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={form.from_date}
            onChange={(e) => handleChange("from_date", e.target.value)}
          />

          <TextField
            label="Tipo beneficio (es. Fringe Benefit)"
            fullWidth
            value={form.benefit_type}
            onChange={(e) => handleChange("benefit_type", e.target.value)}
          />

          <TextField
            label="Note per payroll"
            fullWidth
            multiline
            value={form.payroll_notes}
            onChange={(e) => handleChange("payroll_notes", e.target.value)}
          />

          <TextField
            label="Note generali"
            fullWidth
            multiline
            value={form.note}
            onChange={(e) => handleChange("note", e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
}
