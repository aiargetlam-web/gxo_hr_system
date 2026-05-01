import React, { useState, useEffect } from "react";
import api from "../services/api";

interface Props {
  onUploaded: () => void;
}

export const BoardUpload: React.FC<Props> = ({ onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await api.get("/api/v1/sites");
      setSites(res.data);
    } catch (err) {
      console.error("Errore caricamento siti:", err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Seleziona un file");
      return;
    }
    if (selectedSites.length === 0) {
      alert("Seleziona almeno un sito");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    // 🔥 FIX DEFINITIVO: formato corretto per il backend
    formData.append("site_ids", selectedSites.join(","));

    try {
      await api.post("/api/v1/board/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUploaded();
    } catch (err) {
      console.error(err);
      alert("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "1rem" }}>Carica nuovo documento</h2>

      {/* FILE */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600 }}>Seleziona file PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            width: "100%",
            background: "var(--color-bg)",
            cursor: "pointer"
          }}
        />
      </div>

      {/* SITI */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ fontWeight: 600 }}>Siti disponibili</label>
        <div style={{ marginTop: "0.5rem" }}>
          {sites.map((s) => (
            <label
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.4rem",
                cursor: "pointer"
              }}
            >
              <input
                type="checkbox"
                value={s.id}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedSites((prev) =>
                    prev.includes(id)
                      ? prev.filter((x) => x !== id)
                      : [...prev, id]
                  );
                }}
                style={{ marginRight: "0.5rem" }}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      {/* BOTTONI STILE GXO */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        
        {/* Annulla */}
        <button
          onClick={onUploaded}
          className="btn btn-outline"
          style={{ padding: "0.6rem 1.2rem", minWidth: "120px" }}
        >
          Annulla
        </button>

        {/* Carica */}
        <button
          onClick={handleUpload}
          className="btn btn-primary"
          disabled={loading}
          style={{ padding: "0.6rem 1.2rem", minWidth: "120px" }}
        >
          {loading ? "Caricamento..." : "Carica"}
        </button>

      </div>
    </div>
  );
};
