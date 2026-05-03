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
import { userService } from "../../services/userService";

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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await userService.importCsv(file);
      onImported();
      onClose();
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Importa Utenti da CSV</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography>
            Carica un file CSV con i campi: email, first_name, last_name, id_lul, site_id, role, phone, address
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
        <Button variant="contained" disabled={!file || loading} onClick={handleSubmit}>
          Importa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
