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
import { User, Site } from "../../types";
import { userService } from "../../services/userService";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUpdated: () => void;
  sites: Site[];
}

export default function UserChangeSiteModal({
  open,
  onClose,
  user,
  onUpdated,
  sites,
}: Props) {
  const [siteId, setSiteId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (user) setSiteId(user.site_id ?? undefined);
  }, [user]);

  const handleSubmit = async () => {
    if (!user || siteId === undefined) return;
    await userService.updateUser(user.id, { site_id: siteId });
    onUpdated();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambia Sito</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Sito"
            fullWidth
            value={siteId ?? ""}
            onChange={(e) => setSiteId(Number(e.target.value))}
          >
            {sites.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
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
