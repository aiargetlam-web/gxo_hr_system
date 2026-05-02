import React, { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    try {
      await api.post("/api/v1/auth/change-password", {
        email,
        old_password: oldPassword,
        new_password: newPassword,
      });

      toast.success("Password cambiata con successo");
      window.location.href = "/login";
    } catch (err) {
      toast.error("Errore nel cambio password");
    }
  };

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Cambia Password</h2>

      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="input"
        placeholder="Password attuale"
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />

      <input
        className="input"
        placeholder="Nuova password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleSubmit}>
        Conferma
      </button>
    </div>
  );
};
