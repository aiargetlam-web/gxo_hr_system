import React, { useState, useRef } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Props {
  onUploaded: () => void;
}

export const BoardUpload: React.FC<Props> = ({ onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [siteIds, setSiteIds] = useState<number[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (f: File) => {
    if (!f) return;
    setFile(f);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const upload = async () => {
    if (!file) {
      toast.error("Seleziona un file");
      return;
    }
    if (siteIds.length === 0) {
      toast.error("Seleziona almeno un sito");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("site_ids", siteIds.join(","));

      await api.post("/api/v1/board/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("File caricato con successo");
      onUploaded();
    } catch (err) {
      console.error(err);
      toast.error("Errore durante il caricamento");
    }
  };

  return (
    <div>
      <h2>Carica documento</h2>

      {/* AREA DRAG & DROP PREMIUM */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: dragActive ? "3px solid #007bff" : "3px dashed #ccc",
          background: dragActive ? "#e8f1ff" : "#fafafa",
          padding: "2.5rem",
          borderRadius: "14px",
          textAlign: "center",
          cursor: "pointer",
          transition: "0.25s",
          marginBottom: "1rem",
          boxShadow: dragActive
            ? "0 0 18px rgba(0, 123, 255, 0.5)"
            : "0 0 0 rgba(0,0,0,0)",
        }}
      >
        <div
          style={{
            fontSize: dragActive ? "3.2rem" : "2.8rem",
            transition: "0.25s",
            marginBottom: "0.5rem",
          }}
        >
          📄
        </div>

        <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
          Trascina qui il file
        </p>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          oppure clicca per selezionarlo
        </p>

        {file && (
          <p
            style={{
              marginTop: "1rem",
              fontWeight: "bold",
              color: "#007bff",
            }}
          >
            File selezionato: {file.name}
          </p>
        )}
      </div>

      {/* INPUT FILE NASCOSTO */}
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* SELEZIONE SITI */}
      <label style={{ fontWeight: 500 }}>Siti associati:</label>
      <select
        multiple
        value={siteIds.map(String)}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map((o) =>
            Number(o.value)
          );
          setSiteIds(selected);
        }}
        style={{
          width: "100%",
          padding: "0.5rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginTop: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <option value="1">Sito 1</option>
        <option value="2">Sito 2</option>
        <option value="3">Sito 3</option>
        {/* Qui puoi sostituire con i siti reali */}
      </select>

      {/* BOTTONE CARICA */}
      <button className="btn btn-primary" onClick={upload}>
        Carica
      </button>
    </div>
  );
};
