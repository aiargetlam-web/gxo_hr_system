import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Autocomplete,
} from "@mui/material";

import { useState, useEffect } from "react";
import { Employee, EmploymentStatusType } from "../../types";

import { employeeService } from "../../services/employeeService";
import { getEmploymentStatusTypes } from "../../services/dictionaryService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export default function EmployeeChangeStatusModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [statusTypes, setStatusTypes] = useState<EmploymentStatusType[]>([]);
  const [form, setForm] = useState({
    status_type_id: 0,
    from_date: "",
    note: "",
  });

  // Carica stati dal DB
  useEffect(() => {
    getEmploymentStatusTypes().then((data) => setStatusTypes(data));
  }, []);

  // Imposta default sullo stato attuale
  useEffect(() => {
    if (employee?.status) {
      setForm({
        status_type_id: employee.status.status_type_id,
        from_date: "",
        note: "",
      });
    }
  }, [employee]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;

    await employeeService.changeEmployeeStatus(employee.id, form);

    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambio Stato Lavorativo</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          
          {/* AUTOCOMPLETE STATI */}
          <Autocomplete
            options={statusTypes}
            getOptionLabel={(option) => option.description}
            value={statusTypes.find((s) => s.id === form.status_type_id) || null}
            onChange={(_, newValue) =>
              handleChange("status_type_id", newValue ? newValue.id : 0)
            }
            renderInput={(params) => (
              <TextField {...params} label="Nuovo stato" fullWidth />
            )}
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
          Aggiorna
        </Button>
      </DialogActions>
    </Dialog>
  );
}
