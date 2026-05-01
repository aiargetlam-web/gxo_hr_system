import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BoardFile } from '../types';
import { boardService } from '../services/boardService';
import { BoardUpload } from "../components/BoardUpload";
import api from "../services/api";
import toast from "react-hot-toast";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

export const Board: React.FC = () => {
  const { user } = useContext(AuthContext);

  const [files, setFiles] = useState<BoardFile[]>([]);
  const [loading, setLoading] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"true" | "false">("true");

  // ricerca
  const [search, setSearch] = useState("");

  // ordinamento dinamico (backend)
  const [sortBy, setSortBy] = useState("upload_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  // paginazione
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // filtro per sito
  const [siteFilter, setSiteFilter] = useState<number | "all">("all");
  const [sites, setSites] = useState<any[]>([]);

  // modifica siti
  const [showEditSites, setShowEditSites] = useState(false);
  const [editFile, setEditFile] = useState<BoardFile | null>(null);
  const [allSites, setAllSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);

  useEffect(() => {
    fetchFiles(activeFilter);

    api.get("/api/v1/sites")
      .then(res => setSites(res.data))
      .catch(() => toast.error("Errore nel caricamento dei siti"));
  }, []);

  const fetchFiles = async (active: "true" | "false") => {
    try {
      const res = await api.get(
        `/api/v1/board?active=${active}&sort_by=${sortBy}&direction=${direction}`
      );
      setFiles(res.data);
    } catch {
      toast.error("Errore nel caricamento dei file");
    } finally {
      setLoading(false);
    }
  };

  // CAMBIO ORDINAMENTO
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setDirection("asc");
    }
    fetchFiles(activeFilter);
  };

  const toggleStatus = async (id: number, newStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append("is_active", String(newStatus));

      await api.patch(`/api/v1/board/${id}/status`, formData);

      toast.success(newStatus ? "File riattivato" : "File disattivato");
      fetchFiles(activeFilter);
    } catch {
      toast.error("Errore durante l'aggiornamento dello stato");
    }
  };

  const openEditSitesModal = async (file: BoardFile) => {
    setEditFile(file);

    try {
      const res = await api.get("/api/v1/sites");
      setAllSites(res.data);

      const fileSites = await api.get(`/api/v1/board/${file.id}`);
      setSelectedSites(fileSites.data.sites || []);
    } catch {
      toast.error("Errore nel caricamento dei siti");
    }

    setShowEditSites(true);
  };

  const saveSites = async () => {
    if (!editFile) return;

    try {
      const formData = new FormData();
      formData.append("site_ids", selectedSites.join(","));

      await api.patch(`/api/v1/board/${editFile.id}/sites`, formData);

      toast.success("Siti aggiornati");
      setShowEditSites(false);
      fetchFiles(activeFilter);
    } catch {
      toast.error("Errore durante il salvataggio dei siti");
    }
  };

  if (loading) return <div>Caricamento...</div>;

  // RICERCA
  let filteredFiles = files.filter(f =>
    f.file_name.toLowerCase().includes(search.toLowerCase())
  );

  // FILTRO PER SITO
  if (siteFilter !== "all") {
    filteredFiles = filteredFiles.filter(f =>
      f.sites?.some(s => s.id === siteFilter)
    );
  }

  // PAGINAZIONE
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(start, end);

  return (
    <div>
      <div className="flex-wrap-mobile">
        <h1>Bacheca Aziendale</h1>

        {(user?.role === "hr" || user?.role === "admin") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            
            {/* FILTRO ATTIVI / DISATTIVATI */}
            <div>
              <label style={{ fontWeight: 500, marginRight: "0.5rem" }}>
                Stato:
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  const value = e.target.value as "true" | "false";
                  setActiveFilter(value);
                  setPage(1);
                  fetchFiles(value);
                }}
                style={{
                  padding: "0.35rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.9rem"
                }}
              >
                <option value="true">File attivi</option>
                <option value="false">File disattivati</option>
              </select>
            </div>

            {/* ORDINAMENTO (non più usato lato frontend) */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                fetchFiles(activeFilter);
              }}
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontSize: "0.9rem",
                width: "200px"
              }}
            >
              <option value="upload_date">Ordina per data</option>
              <option value="file_name">Ordina per nome</option>
              <option value="sites">Ordina per sito</option>
            </select>

            {/* FILTRO PER SITO */}
            <select
              value={siteFilter}
              onChange={(e) => {
                const value = e.target.value === "all" ? "all" : Number(e.target.value);
                setSiteFilter(value);
                setPage(1);
              }}
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontSize: "0.9rem",
                width: "200px"
              }}
            >
              <option value="all">Tutti i siti</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* RICERCA */}
            <input
              type="text"
              placeholder="Cerca per nome file..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                width: "250px"
              }}
            />

            {/* AZIONI */}
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              <span
                onClick={() => setShowUpload(true)}
                style={{
                  cursor: "pointer",
                  color: "var(--color-primary)",
                  fontWeight: 500,
                  fontSize: "1rem"
                }}
              >
                ➕ Carica nuovo documento
              </span>

              <span
                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/board`)}
                style={{
                  cursor: "pointer",
                  color: "var(--color-primary)",
                  fontWeight: 500,
                  fontSize: "1rem"
                }}
              >
                ⬇️ Esporta CSV
              </span>
            </div>

          </div>
        )}
      </div>

      {/* MODAL UPLOAD */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}>
          <BoardUpload
            onUploaded={() => {
              toast.success("File caricato con successo");
              setShowUpload(false);
              fetchFiles(activeFilter);
            }}
          />
        </Box>
      </Modal>

      {/* MODAL MODIFICA SITI */}
      <Modal open={showEditSites} onClose={() => setShowEditSites(false)}>
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 420,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}>
          <h3>Modifica siti</h3>

          {allSites.map(s => (
            <label key={s.id} style={{ display: "flex", alignItems: "center", marginBottom: "0.4rem" }}>
              <input
                type="checkbox"
                checked={selectedSites.includes(s.id)}
                onChange={() => {
                  setSelectedSites(prev =>
                    prev.includes(s.id)
                      ? prev.filter(x => x !== s.id)
                      : [...prev, s.id]
                  );
                }}
                style={{ marginRight: "0.5rem" }}
              />
              {s.name}
            </label>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
            <button className="btn btn-outline" onClick={() => setShowEditSites(false)}>
              Annulla
            </button>
            <button className="btn btn-primary" onClick={saveSites}>
              Salva
            </button>
          </div>
        </Box>
      </Modal>

      {/* LISTA DOCUMENTI */}
      <div className="card">
        <h3>Documenti Recenti</h3>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>

                {/* ORDINAMENTO PER NOME */}
                <th
                  style={{ padding: '0.75rem', cursor: "pointer" }}
                  onClick={() => handleSort("file_name")}
                >
                  Nome File {sortBy === "file_name" && (direction === "asc" ? "▲" : "▼")}
                </th>

                <th style={{ padding: '0.75rem' }}>Stato</th>

                {/* ORDINAMENTO PER SITI */}
                {(user?.role === "hr" || user?.role === "admin") && (
                  <th
                    style={{ padding: '0.75rem', cursor: "pointer" }}
                    onClick={() => handleSort("sites")}
                  >
                    Siti associati {sortBy === "sites" && (direction === "asc" ? "▲" : "▼")}
                  </th>
                )}

                {/* ORDINAMENTO PER DATA */}
                <th
                  style={{ padding: '0.75rem', cursor: "pointer" }}
                  onClick={() => handleSort("upload_date")}
                >
                  Data Caricamento {sortBy === "upload_date" && (direction === "asc" ? "▲" : "▼")}
                </th>

                <th style={{ padding: '0.75rem' }}>Azione</th>
              </tr>
            </thead>

            <tbody>
              {paginatedFiles.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{f.id}</td>
                  <td style={{ padding: '0.75rem' }}>{f.file_name}</td>

                  {/* BADGE STATO */}
                  <td style={{ padding: '0.75rem' }}>
                    <span
                      style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                        color: "white",
                        background: f.is_active ? "green" : "red",
                        fontSize: "0.8rem"
                      }}
                    >
                      {f.is_active ? "ATTIVO" : "DISATTIVATO"}
                    </span>
                  </td>

                  {/* COLONNA SITI ASSOCIATI */}
                  {(user?.role === "hr" || user?.role === "admin") && (
                    <td style={{ padding: '0.75rem' }}>
                      {f.sites?.map(s => s.name).join(", ") || "-"}
                    </td>
                  )}

                  <td style={{ padding: '0.75rem' }}>
                    {new Date(f.upload_date).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '0.75rem', display: "flex", gap: "0.5rem" }}>
                    
                    {/* Scarica */}
                    <button
                      onClick={() => window.open(boardService.downloadFileUrl(f.id))}
                      className="btn btn-secondary"
                    >
                      Scarica
                    </button>

                    {/* Disattiva / Riattiva */}
                    {(user?.role === "hr" || user?.role === "admin") && (
                      <button
                        onClick={() => toggleStatus(f.id, !f.is_active)}
                        className={f.is_active ? "btn btn-outline" : "btn btn-primary"}
                      >
                        {f.is_active ? "Disattiva" : "Riattiva"}
                      </button>
                    )}

                    {/* Modifica siti */}
                    {(user?.role === "hr" || user?.role === "admin") && (
                      <button
                        onClick={() => openEditSitesModal(f)}
                        className="btn btn-secondary"
                      >
                        Modifica siti
                      </button>
                    )}

                  </td>
                </tr>
              ))}
              {paginatedFiles.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>
                    Nessun documento trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINAZIONE */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem", gap: "1rem" }}>
          <button
            className="btn btn-outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Precedente
          </button>

          <button
            className="btn btn-outline"
            disabled={end >= filteredFiles.length}
            onClick={() => setPage(page + 1)}
          >
            Successiva →
          </button>
        </div>

      </div>
    </div>
  );
};
