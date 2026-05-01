import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BoardFile } from '../types';
import { boardService } from '../services/boardService';
import { BoardUpload } from "../components/BoardUpload";
import api from "../services/api";
import toast from "react-hot-toast";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import DownloadIcon from "@mui/icons-material/Download";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import BlockIcon from "@mui/icons-material/Block";

const Board: React.FC = () => {
  const { user } = useContext(AuthContext);

  const [files, setFiles] = useState<BoardFile[]>([]);
  const [loading, setLoading] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"true" | "false">("true");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("upload_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const [siteFilter, setSiteFilter] = useState<number | "all">("all");
  const [sites, setSites] = useState<any[]>([]);

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

  let filteredFiles = files.filter(f =>
    f.file_name.toLowerCase().includes(search.toLowerCase())
  );

  if (siteFilter !== "all") {
    filteredFiles = filteredFiles.filter(f =>
      f.sites?.some(s => s.id === siteFilter)
    );
  }

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(start, end);

  return (
    <div>
      <div className="flex-wrap-mobile">
        <h1>Bacheca Aziendale</h1>

        {(user?.role === "hr" || user?.role === "admin") && (
          <div className="filters-bar" 
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1.5rem",
              background: "white",
              padding: "1rem",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
            }}
          >
            {/* FILTRI */}
            <div>
              <label style={{ fontWeight: 500, marginRight: "0.5rem" }}>Stato:</label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  const value = e.target.value as "true" | "false";
                  setActiveFilter(value);
                  setPage(1);
                  fetchFiles(value);
                }}
                style={{
                  padding: "0.45rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.9rem"
                }}
              >
                <option value="true">File attivi</option>
                <option value="false">File disattivati</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 500, marginRight: "0.5rem" }}>Sito:</label>
              <select
                value={siteFilter}
                onChange={(e) => {
                  const value = e.target.value === "all" ? "all" : Number(e.target.value);
                  setSiteFilter(value);
                  setPage(1);
                }}
                style={{
                  padding: "0.45rem 0.6rem",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.9rem"
                }}
              >
                <option value="all">Tutti i siti</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Cerca per nome file..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "0.45rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid var(--color-border)",
                fontSize: "0.9rem",
                width: "220px"
              }}
            />

            <div style={{ marginLeft: "auto", display: "flex", gap: "1.5rem" }}>
              <span
                onClick={() => setShowUpload(true)}
                style={{
                  cursor: "pointer",
                  color: "#0050b3",
                  fontWeight: 600,
                  fontSize: "0.95rem"
                }}
              >
                ➕ Carica nuovo documento
              </span>

              <span
                onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/board`)}
                style={{
                  cursor: "pointer",
                  color: "#0050b3",
                  fontWeight: 600,
                  fontSize: "0.95rem"
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
          <table 
            style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              marginTop: '1rem' 
            }}
          >
            <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 2 }}>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                
                <th style={{ padding: '0.75rem' }}>ID</th>

                {/* ORDINAMENTO PER NOME */}
                <th
                  style={{ padding: '0.75rem', cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("file_name")}
                >
                  Nome File{" "}
                  {sortBy !== "file_name" && <UnfoldMoreIcon fontSize="small" />}
                  {sortBy === "file_name" && direction === "asc" && <ArrowUpwardIcon fontSize="small" />}
                  {sortBy === "file_name" && direction === "desc" && <ArrowDownwardIcon fontSize="small" />}
                </th>

                <th style={{ padding: '0.75rem' }}>Stato</th>

                {/* ORDINAMENTO PER SITI */}
                {(user?.role === "hr" || user?.role === "admin") && (
                  <>
                    <th
                      style={{ padding: '0.75rem', cursor: "pointer", userSelect: "none" }}
                      onClick={() => handleSort("sites")}
                    >
                      Siti associati{" "}
                      {sortBy !== "sites" && <UnfoldMoreIcon fontSize="small" />}
                      {sortBy === "sites" && direction === "asc" && <ArrowUpwardIcon fontSize="small" />}
                      {sortBy === "sites" && direction === "desc" && <ArrowDownwardIcon fontSize="small" />}
                    </th>
                  </>
                )}

                {/* ORDINAMENTO PER DATA */}
                <th
                  style={{ padding: '0.75rem', cursor: "pointer", userSelect: "none" }}
                  onClick={() => handleSort("upload_date")}
                >
                  Data Caricamento{" "}
                  {sortBy !== "upload_date" && <UnfoldMoreIcon fontSize="small" />}
                  {sortBy === "upload_date" && direction === "asc" && <ArrowUpwardIcon fontSize="small" />}
                  {sortBy === "upload_date" && direction === "desc" && <ArrowDownwardIcon fontSize="small" />}
                </th>

                <th style={{ padding: '0.75rem' }}>Azione</th>

              </tr>
            </thead>

            <tbody>
              {paginatedFiles.map(f => (
                <tr 
                  key={f.id} 
                  style={{ 
                    borderBottom: '1px solid #e5e5e5',
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f7f9fc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
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

                  {/* BADGE SITI */}
                  {(user?.role === "hr" || user?.role === "admin") && (
                    <td style={{ padding: '0.75rem', display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                      {f.sites?.length > 0 ? (
                        f.sites.map(s => (
                          <span 
                            key={s.id}
                            style={{
                              background: "#0050b3",
                              color: "white",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.75rem"
                            }}
                          >
                            {s.name}
                          </span>
                        ))
                      ) : (
                        "-"
                      )}
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
                      style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      <DownloadIcon fontSize="small" />
                    </button>

                    {/* Disattiva / Riattiva */}
                    {(user?.role === "hr" || user?.role === "admin") && (
                      <button
                        onClick={() => toggleStatus(f.id, !f.is_active)}
                        className={f.is_active ? "btn btn-outline" : "btn btn-primary"}
                        style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        {f.is_active ? <BlockIcon fontSize="small" /> : <RestartAltIcon fontSize="small" />}
                      </button>
                    )}

                    {/* Modifica siti */}
                    {(user?.role === "hr" || user?.role === "admin") && (
                      <button
                        onClick={() => openEditSitesModal(f)}
                        className="btn btn-secondary"
                        style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <EditLocationAltIcon fontSize="small" />
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
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "center", 
            marginTop: "1rem", 
            gap: "1rem" 
          }}
        >
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

      </div> {/* fine card */}
    </div>   {/* fine container principale */}
  );
};

export default Board;

