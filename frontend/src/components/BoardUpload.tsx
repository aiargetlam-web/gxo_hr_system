// src/components/BoardUpload.tsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

interface BoardUploadProps {
  onUploaded: () => void;
}

export const BoardUpload: React.FC<BoardUploadProps> = ({ onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/api/v1/sites")
      .then((res) => setSites(res.data))
      .catch(() => toast.error("Errore nel caricamento dei siti"));
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Seleziona un file prima di caricare");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("site_ids", selectedSites.join(","));

      await api.post("/api/v1/board", formData);
      toast.success("File caricato con successo");
      onUploaded();
    } catch {
      toast.error("Errore durante il caricamento del file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Carica nuovo documento</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: "1rem" }}
      />

      <h4>Seleziona siti</h4>
      {sites.map((s) => (
        <label
          key={s.id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.4rem",
          }}
        >
          <input
            type="checkbox"
            checked={selectedSites.includes(s.id)}
            onChange={() => {
              setSelectedSites((prev) =>
                prev.includes(s.id)
                  ? prev.filter((x) => x !== s.id)
                  : [...prev, s.id]
              );
            }}
            style={{
              marginRight: "0.5rem",
              width: "16px",
              height: "16px",
              cursor: "pointer",
              accentColor: "#0050b3",
            }}
          />
          {s.name}
        </label>
      ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <button
          className="btn btn-outline"
          onClick={() => {
            setFile(null);
            setSelectedSites([]);
          }}
        >
          Annulla
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Caricamento..." : "Carica"}
        </button>
      </div>
    </div>
  );
};
