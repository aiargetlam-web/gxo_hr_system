import React, { useState, useEffect } from "react";
import api from "../services/api";

export const BoardUpload: React.FC = () => {
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

      alert("File caricato con successo!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <h3>Carica nuovo documento</h3>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: "1rem" }}
      />

      <div style={{ marginBottom: "1rem" }}>
        <label><strong>Seleziona siti:</strong></label>
        <div>
          {sites.map((s) => (
            <label key={s.id} style={{ display: "block" }}>
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
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
        {loading ? "Caricamento..." : "Carica File"}
      </button>
    </div>
  );
};
