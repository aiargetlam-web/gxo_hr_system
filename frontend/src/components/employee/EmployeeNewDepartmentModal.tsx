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
import { DepartmentCreate, Employee } from "../../types";
import { employeeService } from "../../services/employeeService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export default function EmployeeNewDepartmentModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [form, setForm] = useState<DepartmentCreate>({
    department_id: 1,
    manager_employee_id: undefined,
    from_date: "",
    note: "",
  });

  const handleChange = (field: keyof DepartmentCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;
    await employeeService.addDepartment(employee.id, form);
    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuovo Reparto</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Reparto (ID)"
            fullWidth
            value={form.department_id}
            onChange={(e) =>
              handleChange("department_id", Number(e.target.value))
            }
          />

          <TextField
            label="Responsabile (ID dipendente)"
            fullWidth
            value={form.manager_employee_id || ""}
            onChange={(e) =>
              handleChange("manager_employee_id", Number(e.target.value))
            }
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
