import React, { useState, useEffect } from "react";
import api from "../services/api";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";

interface Props {
  onUploaded: () => void; // callback dal modal
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
    formData.append("site_ids", JSON.stringify(selectedSites));

    try {
      await api.post("/api/v1/board/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // chiude il modal e aggiorna la lista
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
      <h2>Carica nuovo documento</h2>

      {/* FILE */}
      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {/* SITI */}
      <div style={{ marginTop: 20 }}>
        <strong>Siti disponibili</strong>
        <div>
          {sites.map((s) => (
            <FormControlLabel
              key={s.id}
              control={
                <Checkbox
                  checked={selectedSites.includes(s.id)}
                  onChange={() =>
                    setSelectedSites((prev) =>
                      prev.includes(s.id)
                        ? prev.filter((x) => x !== s.id)
                        : [...prev, s.id]
                    )
                  }
                />
              }
              label={s.name}
            />
          ))}
        </div>
      </div>

      {/* BOTTONI */}
      <div
        style={{
          marginTop: 30,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="outlined" onClick={onUploaded}>
          Annulla
        </Button>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? <CircularProgress size={22} /> : "Carica"}
        </Button>
      </div>
    </div>
  );
};
