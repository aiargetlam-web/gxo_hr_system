import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function UserImportCsvModal({
  open,
  onClose,
  onImported,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!file) return;

    // 🔥 IMPORT MASSIVO SOSPESO
    // Qui in futuro chiameremo employeeService.importCsv(file)
    // Per ora non facciamo nulla per evitare errori.

    console.warn("TODO: implementare import CSV dipendenti");

    onImported();
    onClose();
    setFile(null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Importa Dipendenti da CSV</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography>
            ⚠️ Funzione di import massivo non ancora attiva.
            <br />
            Verrà implementata quando definiremo il formato CSV definitivo.
          </Typography>

          <Button variant="outlined" component="label">
            Seleziona File CSV
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>

          {file && <Typography>File selezionato: {file.name}</Typography>}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button variant="contained" disabled={!file} onClick={handleSubmit}>
          Importa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
