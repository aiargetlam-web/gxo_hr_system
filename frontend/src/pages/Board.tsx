import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BoardFile } from '../types';
import { boardService } from '../services/boardService';
import { BoardUpload } from "../components/BoardUpload";

export const Board: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState<BoardFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const data = await boardService.getFiles();
      setFiles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div>
      <div className="flex-wrap-mobile">
        <h1>Bacheca Aziendale</h1>
	{(user?.role === "hr" || user?.role === "admin") && <BoardUpload />}
        {(user?.role === 'hr' || user?.role === 'admin') && (
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/board`)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
              ⬇️ Esporta CSV
            </button>
          </div>
        )}
      </div>
      <div className="card">
        <h3>Documenti Recenti</h3>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>ID</th>
                <th style={{ padding: '0.75rem' }}>Nome File</th>
                <th style={{ padding: '0.75rem' }}>Data Caricamento</th>
                <th style={{ padding: '0.75rem' }}>Azione</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{f.id}</td>
                  <td style={{ padding: '0.75rem' }}>{f.file_name}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(f.upload_date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => window.open(boardService.downloadFileUrl(f.id))} className="btn btn-secondary">Scarica</button>
                  </td>
                </tr>
              ))}
              {files.length === 0 && <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>Nessun documento in bacheca.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
