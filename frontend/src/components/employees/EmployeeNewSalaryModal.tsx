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
import { SalaryCreate, Employee } from "../../types";
import { employeeService } from "../../services/employeeService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export default function EmployeeNewSalaryModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [form, setForm] = useState<SalaryCreate>({
    ral_amount: 0,
    from_date: "",
    note: "",
  });

  const handleChange = (field: keyof SalaryCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;
    await employeeService.addSalary(employee.id, form);
    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuova RAL</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Importo RAL"
            fullWidth
            type="number"
            value={form.ral_amount}
            onChange={(e) => handleChange("ral_amount", Number(e.target.value))}
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
            label="Note"
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
