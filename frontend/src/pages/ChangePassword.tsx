import { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import { authService } from "../services/authService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const navigate = useNavigate();

  const email = localStorage.getItem("user_email") || "";

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "url('/background-primordia.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 3
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: 420,
          borderRadius: "14px",
          boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          backdropFilter: "blur(3px)"
        }}
      >
        {/* HEADER STILE PRIMORDIA */}
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: "700",
            color: "#FF6A00",
            mb: 1
          }}
        >
          GXO Primordia
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            fontSize: "1rem",
            mb: 0.5
          }}
        >
          Dove nasce la tua organizzazione.
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#999",
            fontSize: "0.9rem",
            mb: 3
          }}
        >
          L’origine dei processi HR.
        </Typography>

        {/* FORM — IDENTICO, SOLO STILE */}
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
          sx={{
            backgroundColor: "#FF6A00",
            fontWeight: "600",
            p: "0.9rem",
            "&:hover": { backgroundColor: "#E65C00" }
          }}
        >
          {loading ? "Attendere..." : "Cambia password"}
        </Button>
      </Paper>
    </Box>
  );
};

export default ChangePassword;
