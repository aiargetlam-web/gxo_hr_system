import React, { useState, useEffect, DragEvent } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./boardupload.css";

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
    api.get("/sites")
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
    if (!file) return toast.error("Seleziona un file prima di caricare");
    if (selectedSites.length === 0) return toast.error("Seleziona almeno un sito");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("site_ids", selectedSites.join(","));

      await api.post("/board/upload", formData);

      toast.success("File caricato con successo");
      onUploaded();
    } catch {
      toast.error("Errore durante il caricamento del file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board-upload-wrapper">
      <h3>Carica nuovo documento</h3>

      <div
        className={`board-dropzone ${dragActive ? "drag-active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <p>Trascina qui il file oppure clicca per selezionarlo</p>

        {file && (
          <p className="board-file-selected">
            File selezionato: {file.name}
          </p>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <h4>Seleziona siti</h4>

      <div className="board-sites-list">
        {sites.map((s) => (
          <label key={s.id}>
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
            />
            {s.name}
          </label>
        ))}
      </div>

      <div className="board-actions">
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
