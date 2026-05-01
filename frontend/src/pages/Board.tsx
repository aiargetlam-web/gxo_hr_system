import React, { useState, useEffect } from "react";
import api from "../services/api"; // Assicurati che questo percorso sia corretto

const Board: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("upload_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const fetchFiles = async () => {
    try {
      const response = await api.get(
        `/api/v1/board?active=true&sort_by=${sortBy}&direction=${direction}`
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Errore nel caricamento dei file:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [sortBy, direction]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setDirection("asc");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Bacheca Aziendale</h1>

      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th
              onClick={() => handleSort("file_name")}
              className="cursor-pointer p-2"
            >
              Nome {sortBy === "file_name" && (direction === "asc" ? "▲" : "▼")}
            </th>

            <th
              onClick={() => handleSort("upload_date")}
              className="cursor-pointer p-2"
            >
              Data {sortBy === "upload_date" && (direction === "asc" ? "▲" : "▼")}
            </th>

            <th
              onClick={() => handleSort("author")}
              className="cursor-pointer p-2"
            >
              Autore {sortBy === "author" && (direction === "asc" ? "▲" : "▼")}
            </th>

            <th
              onClick={() => handleSort("sites")}
              className="cursor-pointer p-2"
            >
              Siti {sortBy === "sites" && (direction === "asc" ? "▲" : "▼")}
            </th>
          </tr>
        </thead>

        <tbody>
          {files.map((f) => (
            <tr key={f.id} className="border-b">
              <td className="p-2">{f.file_name}</td>
              <td className="p-2">
                {new Date(f.upload_date).toLocaleString()}
              </td>
              <td className="p-2">{f.hr_author_id}</td>
              <td className="p-2">
                {f.sites.map((s: any) => s.name || s.id).join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Board;
