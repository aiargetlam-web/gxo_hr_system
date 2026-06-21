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
import { CostCenterCreate, Employee } from "../../types";
import { employeeService } from "../../services/employeeService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export default function EmployeeNewCostCenterModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [form, setForm] = useState<CostCenterCreate>({
    cost_center_id: 1,
    weight_percent: 100,
    from_date: "",
    note: "",
  });

  const handleChange = (field: keyof CostCenterCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;
    await employeeService.addCostCenter(employee.id, form);
    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuovo Cost Center</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Cost Center (ID)"
            fullWidth
            value={form.cost_center_id}
            onChange={(e) =>
              handleChange("cost_center_id", Number(e.target.value))
            }
          />

          <TextField
            label="Percentuale"
            fullWidth
            type="number"
            value={form.weight_percent}
            onChange={(e) =>
              handleChange("weight_percent", Number(e.target.value))
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
