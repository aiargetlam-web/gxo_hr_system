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
import { Employee } from "../../types";
import { employeeService } from "../../services/employeeService";

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
  const [statusTypeId, setStatusTypeId] = useState<number>(1);
  const [fromDate, setFromDate] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // ⭐ CORRETTO: sincronizziamo lo stato attuale del dipendente
  useEffect(() => {
    if (employee) {
      setStatusTypeId(employee.status?.status_type_id ?? 1);
    }
  }, [employee]);

  const handleSubmit = async () => {
    if (!employee) return;

    await employeeService.changeStatus(
      employee.id,
      statusTypeId,
      fromDate,
      note || undefined
    );

    onSaved();
    onClose();
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambio Stato Lavorativo</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* STATO */}
          <TextField
            select
            label="Nuovo stato"
            fullWidth
            value={statusTypeId}
            onChange={(e) => setStatusTypeId(Number(e.target.value))}
          >
            <MenuItem value={1}>Attivo</MenuItem>
            <MenuItem value={2}>Sospeso</MenuItem>
            <MenuItem value={3}>Cessato</MenuItem>
            <MenuItem value={4}>In aspettativa</MenuItem>
            <MenuItem value={5}>Rientrato</MenuItem>
          </TextField>

          {/* DATA */}
          <TextField
            label="Data decorrenza"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          {/* NOTE */}
          <TextField
            label="Note"
            fullWidth
            multiline
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
