import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { siteService } from "../services/siteService";
import { User, Site } from "../types";
import { toast } from "react-toastify";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeSiteModal, setShowChangeSiteModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Campi form creazione/modifica
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [siteId, setSiteId] = useState<number | null>(null);
  const [idLul, setIdLul] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      toast.error("Errore caricamento utenti");
    }
  };

  const loadSites = async () => {
    try {
      const data = await siteService.getSites();
      setSites(data);
    } catch {
      toast.error("Errore caricamento siti");
    }
  };

  useEffect(() => {
    loadUsers();
    loadSites();
  }, []);

  // Apri modale modifica
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    setRole(user.role);
    setSiteId(user.site_id);
    setIdLul(user.id_lul || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setShowEditModal(true);
  };

  // Apri modale cambio sito
  const openChangeSiteModal = (user: User) => {
    setSelectedUser(user);
    setSiteId(user.site_id);
    setShowChangeSiteModal(true);
  };

  // Reset campi form
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("user");
    setSiteId(null);
    setIdLul("");
    setPhone("");
    setAddress("");
  };

  // CREA UTENTE
  const handleCreateUser = async () => {
    try {
      await userService.createUser({
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        site_id: siteId,
        id_lul: idLul,
        phone,
        address,
        password: "Password123!"
      });

      toast.success("Utente creato");
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Errore creazione utente");
    }
  };

  // MODIFICA UTENTE
  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.id, {
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        site_id: siteId,
        id_lul: idLul,
        phone,
        address
      });

      toast.success("Utente aggiornato");
      setShowEditModal(false);
      loadUsers();
    } catch {
      toast.error("Errore aggiornamento utente");
    }
  };

  // CAMBIA SITO
  const handleChangeSite = async () => {
    if (!selectedUser) return;

    try {
      await userService.updateUser(selectedUser.id, {
        site_id: siteId
      });

      toast.success("Sito aggiornato");
      setShowChangeSiteModal(false);
      loadUsers();
    } catch {
      toast.error("Errore cambio sito");
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (userId: number) => {
    try {
      await userService.resetPassword(userId);
      toast.success("Password resettata");
    } catch {
      toast.error("Errore reset password");
    }
  };

  return (
    <div className="container">
      <h1>Gestione Utenti</h1>

      <div style={{ marginBottom: "1rem" }}>
        <span className="link-action" onClick={() => setShowCreateModal(true)}>
          ➕ Crea nuovo utente
        </span>
      </div>

      {/* TABELLA UTENTI */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID LUL</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Sito</th>
              <th>Telefono</th>
              <th>Indirizzo</th>
              <th>Azioni</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id_lul}</td>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{sites.find(s => s.id === u.site_id)?.name || "-"}</td>
                <td>{u.phone || "-"}</td>
                <td>{u.address || "-"}</td>

                <td>
                  <span className="link-action" onClick={() => openEditModal(u)}>
                    Modifica
                  </span>{" "}
                  |{" "}
                  <span className="link-action" onClick={() => openChangeSiteModal(u)}>
                    Cambia sito
                  </span>{" "}
                  |{" "}
                  <span className="link-action" onClick={() => handleResetPassword(u.id)}>
                    Reset password
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====================== MODALE CREA UTENTE ====================== */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Crea Nuovo Utente</h2>

            <input className="input" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="input" placeholder="Cognome" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

            <input className="input" placeholder="Telefono" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" placeholder="Indirizzo" value={address} onChange={(e) => setAddress(e.target.value)} />

            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>

            <select className="input" value={siteId || ""} onChange={(e) => setSiteId(Number(e.target.value))}>
              <option value="">Seleziona sito</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <input className="input" placeholder="ID LUL" value={idLul} onChange={(e) => setIdLul(e.target.value)} />

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={handleCreateUser}>Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* ====================== MODALE MODIFICA UTENTE ====================== */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Modifica Utente</h2>

            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />

            <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>

            <input className="input" value={idLul} onChange={(e) => setIdLul(e.target.value)} />

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={handleEditUser}>Salva</button>
            </div>
          </div>
        </div>
      )}

      {/* ====================== MODALE CAMBIA SITO ====================== */}
      {showChangeSiteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Cambia Sito</h2>

            <select className="input" value={siteId || ""} onChange={(e) => setSiteId(Number(e.target.value))}>
              <option value="">Seleziona sito</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowChangeSiteModal(false)}>Annulla</button>
              <button className="btn btn-primary" onClick={handleChangeSite}>Salva</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Users;
