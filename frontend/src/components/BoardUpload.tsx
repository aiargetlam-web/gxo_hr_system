import React, { useState, useEffect, DragEvent } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

interface BoardUploadProps {
  onUploaded: () => void;
  onCancel: () => void;
}

export const BoardUpload: React.FC<BoardUploadProps> = ({ onUploaded, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    api
      .get("/sites")   // ✅ CORRETTO
      .then((res) => setSites(res.data))
      .catch(() => toast.error("Errore nel caricamento dei siti"));
  }, []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Seleziona un file prima di caricare");
      return;
    }

    if (selectedSites.length === 0) {
      toast.error("Seleziona almeno un sito");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("site_ids", selectedSites.join(",")); // "1,2,3"

      await api.post("/board/upload", formData);  // ✅ CORRETTO

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

      {/* AREA DRAG & DROP PREMIUM */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        style={{
          border: dragActive ? "2px solid #007bff" : "2px dashed #ccc",
          background: dragActive ? "#e8f1ff" : "#fafafa",
          padding: "2rem",
          borderRadius: "10px",
          textAlign: "center",
          cursor: "pointer",
          transition: "0.2s",
          marginBottom: "1rem",
        }}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          Trascina qui il file oppure clicca per selezionarlo
        </p>

        {file && (
          <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>
            File selezionato: {file.name}
          </p>
        )}
      </div>

      {/* INPUT FILE NASCOSTO */}
      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
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
            onCancel();
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
