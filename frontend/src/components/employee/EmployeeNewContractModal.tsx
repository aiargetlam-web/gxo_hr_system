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
import { ContractCreate, Employee } from "../../types";
import { employeeService } from "../../services/employeeService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export default function EmployeeNewContractModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [form, setForm] = useState<ContractCreate>({
    work_regime_id: 1,
    contract_nature_id: 1,
    from_date: "",
    weekly_hours: 40,
    fte: 1,
    time_band: "",
    shift_type: "",
    note: "",
  });

  const handleChange = (field: keyof ContractCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;
    await employeeService.addContract(employee.id, form);
    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuovo Contratto</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Data inizio contratto"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={form.from_date}
            onChange={(e) => handleChange("from_date", e.target.value)}
          />

          <TextField
            label="Regime di lavoro (ID)"
            fullWidth
            value={form.work_regime_id}
            onChange={(e) =>
              handleChange("work_regime_id", Number(e.target.value))
            }
          />

          <TextField
            label="Natura contratto (ID)"
            fullWidth
            value={form.contract_nature_id}
            onChange={(e) =>
              handleChange("contract_nature_id", Number(e.target.value))
            }
          />

          <TextField
            label="Ore settimanali"
            fullWidth
            value={form.weekly_hours}
            onChange={(e) =>
              handleChange("weekly_hours", Number(e.target.value))
            }
          />

          <TextField
            label="FTE"
            fullWidth
            value={form.fte}
            onChange={(e) => handleChange("fte", Number(e.target.value))}
          />

          <TextField
            label="Fascia oraria"
            fullWidth
            value={form.time_band}
            onChange={(e) => handleChange("time_band", e.target.value)}
          />

          <TextField
            label="Turno"
            fullWidth
            value={form.shift_type}
            onChange={(e) => handleChange("shift_type", e.target.value)}
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
