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
  const [siteId, setSiteId] = useState<number | null>(null);

  useEffect(() => {
    if (user) setSiteId(user.site_id);
  }, [user]);

  const handleSubmit = async () => {
    if (!user || siteId === null) return;
    await userService.updateUser(user.id, { site_id: siteId });
    onUpdated();
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambia Sito</DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" style={{ gap: 16, marginTop: 8 }}>
          <TextField
            select
            label="Sito"
            fullWidth
            value={siteId || ""}
            onChange={(e) => setSiteId(Number(e.target.value))}
          >
            {sites.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
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
