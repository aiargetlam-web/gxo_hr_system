import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { useState, useEffect } from "react";
import { Employee, SiteAssignmentCreate } from "../../types";
import { employeeService } from "../../services/employeeService";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee: Employee | null;
}

export default function EmployeeChangeSiteModal({
  open,
  onClose,
  onSaved,
  employee,
}: Props) {
  const [form, setForm] = useState<SiteAssignmentCreate>({
    site_id: 1,
    from_date: "",
    note: "",
  });

  useEffect(() => {
    if (employee) {
      setForm({
        site_id: employee.current_site_id,
        from_date: "",
        note: "",
      });
    }
  }, [employee]);

  const handleChange = (field: keyof SiteAssignmentCreate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;
    await employeeService.changeSite(employee.id, form);
    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambio Sito</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nuovo sito (ID)"
            fullWidth
            value={form.site_id}
            onChange={(e) => handleChange("site_id", Number(e.target.value))}
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
