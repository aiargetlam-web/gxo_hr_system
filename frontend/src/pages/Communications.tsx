import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Communication } from '../types';
import { communicationService } from '../services/communicationService';

export const Communications: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [comms, setComms] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Estraggo il nome del ruolo in modo sicuro
  const roleName = user?.role?.name ?? "";

  useEffect(() => {
    fetchComms();
  }, []);

  const fetchComms = async () => {
    try {
      const data = await communicationService.getCommunications();
      setComms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <h2>Comunicazioni Interne</h2>

        {(roleName === 'hr' || roleName === 'admin') && (
          <button
            onClick={() =>
              window.open(`${import.meta.env.VITE_API_URL}/export/communications`)
            }
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            ⬇️ Esporta CSV
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th>ID</th>
              <th>User ID</th>
              <th>Stato</th>
              <th>Priorità</th>
              <th>Data</th>
            </tr>
          </thead>

          <tbody>
            {comms.map(c => (
              <tr key={c.id}>
                <td style={{ padding: '0.75rem' }}>{c.id}</td>
                <td style={{ padding: '0.75rem' }}>
                  {c.user?.email || c.user_id}
                </td>
                <td style={{ padding: '0.75rem' }}>{c.status}</td>
                <td style={{ padding: '0.75rem' }}>{c.priority}</td>
                <td style={{ padding: '0.75rem' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {comms.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>
                  Nessuna comunicazione trovata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
