import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { UserCreate, Role, Site } from "../../types";
import { userService } from "../../services/userService";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  roles: Role[];
  sites: Site[];
}

export default function UserCreateModal({
  open,
  onClose,
  onCreated,
  roles,
  sites,
}: Props) {
  const [form, setForm] = useState<UserCreate>({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    id_lul: "",
    role_id: 0,
    site_id: 0,
    password: "Password123!",
  });

  const handleChange = (field: keyof UserCreate, value: any) => {
    setForm((prev: UserCreate) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await userService.createUser(form);
    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuovo Utente</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" style={{ gap: 16, marginTop: 8 }}>
          <Box display="flex" style={{ gap: 16 }}>
            <TextField
              label="Nome"
              fullWidth
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            <TextField
              label="Cognome"
              fullWidth
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          </Box>

          <TextField
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Box display="flex" style={{ gap: 16 }}>
            <TextField
              label="Telefono"
              fullWidth
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <TextField
              label="ID LUL"
              fullWidth
              value={form.id_lul}
              onChange={(e) => handleChange("id_lul", e.target.value)}
            />
          </Box>

          <TextField
            label="Indirizzo"
            fullWidth
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <TextField
            select
            label="Ruolo"
            fullWidth
            value={form.role_id}
            onChange={(e) => handleChange("role_id", Number(e.target.value))}
          >
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sito"
            fullWidth
            value={form.site_id}
            onChange={(e) => handleChange("site_id", Number(e.target.value))}
          >
            {sites.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Password iniziale"
            fullWidth
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Crea Utente
        </Button>
      </DialogActions>
    </Dialog>
  );
}
