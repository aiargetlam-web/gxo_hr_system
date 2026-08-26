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
import { Employee, SiteAssignmentCreate, Site } from "../../types";

import { changeEmployeeSite } from "../../services/employeeService";
import { siteService } from "../../services/siteService";

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
  const [sites, setSites] = useState<Site[]>([]);
  const [form, setForm] = useState<SiteAssignmentCreate>({
    site_id: 0,
    from_date: "",
    note: "",
  });

  // Carica i siti
  useEffect(() => {
    siteService.getSites().then((data) => setSites(data));
  }, []);

  // Imposta default quando cambia employee
  useEffect(() => {
    if (employee) {
      setForm({
        site_id: employee.site?.id ?? 0,
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

    await changeEmployeeSite(employee.id, form);

    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambio Sito</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          
          {/* AUTOCOMPLETE SITI */}
          <Autocomplete
            options={sites}
            getOptionLabel={(option) => option.name}
            value={sites.find((s) => s.id === form.site_id) || null}
            onChange={(_, newValue) =>
              handleChange("site_id", newValue ? newValue.id : 0)
            }
            renderInput={(params) => (
              <TextField {...params} label="Nuovo sito" fullWidth />
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
