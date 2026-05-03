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
import { useEffect, useState } from "react";
import { User, UserUpdate, Role, Site } from "../../types";
import { userService } from "../../services/userService";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUpdated: () => void;
  roles: Role[];
  sites: Site[];
}

export default function UserEditModal({
  open,
  onClose,
  user,
  onUpdated,
  roles,
  sites,
}: Props) {
  const [form, setForm] = useState<UserUpdate>({});

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        id_lul: user.id_lul,
        role_id: user.role_id,
        site_id: user.site_id,
      });
    }
  }, [user]);

  const handleChange = (field: keyof UserUpdate, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    await userService.updateUser(user.id, form);
    onUpdated();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Modifica Utente</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Nome"
              fullWidth
              value={form.first_name || ""}
              onChange={(e) => handleChange("first_name", e.target.value)}
            />
            <TextField
              label="Cognome"
              fullWidth
              value={form.last_name || ""}
              onChange={(e) => handleChange("last_name", e.target.value)}
            />
          </Stack>

          <TextField
            label="Email"
            fullWidth
            value={form.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Telefono"
              fullWidth
              value={form.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <TextField
              label="ID LUL"
              fullWidth
              value={form.id_lul || ""}
              onChange={(e) => handleChange("id_lul", e.target.value)}
            />
          </Stack>

          <TextField
            label="Indirizzo"
            fullWidth
            value={form.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <TextField
            select
            label="Ruolo"
            fullWidth
            value={form.role_id || ""}
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
            value={form.site_id || ""}
            onChange={(e) => handleChange("site_id", Number(e.target.value))}
          >
            {sites.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Nuova Password (opzionale)"
            fullWidth
            value={form.password || ""}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annulla</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Salva Modifiche
        </Button>
      </DialogActions>
    </Dialog>
  );
}
