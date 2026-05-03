import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { authService } from "../services/authService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const navigate = useNavigate();

  const email = localStorage.getItem("user_email") || ""; // ← Assicurati di salvarla al login

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Email non trovata. Effettua di nuovo il login.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(email, oldPassword, newPassword);
      toast.success("Password cambiata con successo");
      navigate("/login");
    } catch (err) {
      toast.error("Errore nel cambio password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          Cambia Password
        </Typography>

        <TextField
          label="Email"
          value={email}
          fullWidth
          disabled
          sx={{ mb: 2 }}
        />

        <TextField
          label="Vecchia password"
          type="password"
          fullWidth
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Nuova password"
          type="password"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Conferma nuova password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Attendere..." : "Cambia password"}
        </Button>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
