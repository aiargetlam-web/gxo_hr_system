import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { userService } from "../services/userService";
import api from "../services/api";
import toast from "react-hot-toast";

// Material UI Icons
import EditIcon from "@mui/icons-material/Edit";
import BusinessIcon from "@mui/icons-material/Business";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

export const Users: React.FC = () => {
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [sortColumn, setSortColumn] = useState<string>("first_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState<string>("");

  useEffect(() => {
    loadSites();
    loadUsers();
  }, []);

  const loadSites = async () => {
    try {
      const res = await api.get("/sites");
      setSites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const valA = a[sortColumn] ?? "";
    const valB = b[sortColumn] ?? "";

    if (typeof valA === "string") {
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortDirection === "asc" ? valA - valB : valB - valA;
  });

  const filteredUsers = sortedUsers.filter((u) => {
    const matchSearch =
      search === "" ||
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.id_lul ?? "").toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === "" || u.role === filterRole;
    const matchSite = filterSite === "" || String(u.site_id) === filterSite;
    const matchStatus =
      filterStatus === "" ||
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "inactive" && !u.is_active);

    return matchSearch && matchRole && matchSite && matchStatus;
  });

  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const nextPage = () => {
    if (startIndex + pageSize < filteredUsers.length) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await userService.toggleStatus(userId, !currentStatus);
      toast.success("Stato aggiornato");
      loadUsers();
    } catch (err) {
      toast.error("Errore aggiornamento stato");
    }
  };

  // (Opzionale) reset password via API dedicata, se la aggiungerai
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      await userService.updateUser(selectedUser.id, {
        password: resetPasswordValue || "Password123!",
      });
      toast.success("Password reimpostata");
      setShowResetPasswordModal(false);
      setSelectedUser(null);
      setResetPasswordValue("");
      loadUsers();
    } catch (err) {
      toast.error("Errore reset password");
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <div>
          <h1>Gestione Utenti</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
            {currentUser?.role === "admin"
              ? "Vista Globale"
              : `Vista limitata al sito: ${currentUser?.site_name}`}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", width: "100%" }}>
          <button className="btn btn-primary" onClick={() => {
            setSelectedUser({});
            setShowCreateModal(true);
          }}>
            ➕ Crea Utente
          </button>

          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            ⬆️ Importa CSV
          </button>

          <button
            onClick={() =>
              window.open(`${import.meta.env.VITE_API_URL}/export/users`)
            }
            className="btn btn-outline"
          >
            ⬇️ Esporta CSV
          </button>
        </div>
      </div>

      {/* FILTRI */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Cerca nome, email, ID LUL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 200px" }}
        />

        <select className="input" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Ruolo</option>
          <option value="user">User</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>

        <select className="input" value={filterSite} onChange={(e) => setFilterSite(e.target.value)}>
          <option value="">Sito</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Stato</option>
          <option value="active">Attivi</option>
          <option value="inactive">Disattivi</option>
        </select>
      </div>

      {/* TABELLA */}
      <div className="table-responsive" style={{ marginTop: "1rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
              {[
                { key: "id_lul", label: "ID LUL" },
                { key: "first_name", label: "Nome Completo" },
                { key: "email", label: "Email" },
                { key: "site_id", label: "Sito" },
                { key: "is_active", label: "Stato" },
              ].map((col) => (
                <th
                  key={col.key}
                  style={{ padding: "0.75rem", cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortColumn === col.key && (sortDirection === "asc" ? "▲" : "▼")}
                </th>
              ))}
              <th style={{ padding: "0.75rem" }}>Azioni</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((u) => (
              <tr
                key={u.id}
                style={{
                  borderBottom: "1px solid var(--color-border)",
                  backgroundColor: !u.is_active ? "#f8f9fa" : "transparent",
                  color: !u.is_active ? "#999" : "inherit",
                }}
              >
                <td style={{ padding: "0.75rem" }}>{u.id_lul}</td>
                <td style={{ padding: "0.75rem" }}>
                  {u.first_name} {u.last_name}
                </td>
                <td style={{ padding: "0.75rem" }}>{u.email}</td>
                <td style={{ padding: "0.75rem" }}>
                  {sites.find((s) => s.id === u.site_id)?.name || "N/D"}
                </td>

                <td style={{ padding: "0.75rem" }}>
                  {u.is_active ? (
                    <span className="badge badge-closed">Attivo</span>
                  ) : (
                    <span className="badge badge-unread">Disattivo</span>
                  )}
                </td>

                <td style={{ padding: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedUser(u);
                      setShowEditModal(true);
                    }}
                  >
                    <EditIcon style={{ fontSize: "18px", marginRight: "4px" }} />
                    Modifica
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedUser(u);
                      setShowSiteModal(true);
                    }}
                  >
                    <BusinessIcon style={{ fontSize: "18px", marginRight: "4px" }} />
                    Cambia Sito
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedUser(u);
                      setResetPasswordValue("");
                      setShowResetPasswordModal(true);
                    }}
                  >
                    <VpnKeyIcon style={{ fontSize: "18px", marginRight: "4px" }} />
                    Reset Password
                  </button>

                  <button
                    className="btn btn-secondary"
                    style={{ backgroundColor: u.is_active ? "#dc3545" : "#28a745" }}
                    onClick={() => handleToggleStatus(u.id, u.is_active)}
                  >
                    <PowerSettingsNewIcon style={{ fontSize: "18px", marginRight: "4px" }} />
                    {u.is_active ? "Disattiva" : "Riattiva"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINAZIONE */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button className="btn btn-outline" onClick={prevPage}>
          ← Precedente
        </button>

        <button className="btn btn-outline" onClick={nextPage}>
          Successiva →
        </button>
      </div>

      {/* MODALE CREA UTENTE */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Crea Nuovo Utente</h2>

            <input
              className="input"
              placeholder="Nome"
              onChange={(e) => setSelectedUser((u: any) => ({ ...u, first_name: e.target.value }))}
            />

            <input
              className="input"
              placeholder="Cognome"
              onChange={(e) => setSelectedUser((u: any) => ({ ...u, last_name: e.target.value }))}
            />

            <input
              className="input"
              placeholder="Email"
              onChange={(e) => setSelectedUser((u: any) => ({ ...u, email: e.target.value }))}
            />

            <select
              className="input"
              onChange={(e) => setSelectedUser((u: any) => ({ ...u, role: e.target.value }))}
            >
              <option value="">Ruolo</option>
              <option value="user">User</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>

            <select
              className="input"
              onChange={(e) => setSelectedUser((u: any) => ({ ...u