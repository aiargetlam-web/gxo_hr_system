import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ActivityLog, UserHistoryLog } from '../types';

export const ActivityLogs: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const roleName = user?.role?.name ?? "";

  useEffect(() => {
    if (roleName === "admin") {
      api.get<ActivityLog[]>('/admin/activity-logs').then(res => setLogs(res.data));
    }
  }, [roleName]);

  if (roleName !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <h2>Log Attività (Admin)</h2>
        <button
          onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/activity-logs`)}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ⬇️ Esporta CSV
        </button>
      </div>

      <div className="table-responsive">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th>Data</th>
              <th>User ID</th>
              <th>Ruolo</th>
              <th>Azione</th>
              <th>Entità</th>
              <th>Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td style={{ padding: '0.75rem' }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ padding: '0.75rem' }}>{l.user_id}</td>
                <td style={{ padding: '0.75rem' }}>{l.role}</td>
                <td style={{ padding: '0.75rem' }}>{l.action}</td>
                <td style={{ padding: '0.75rem' }}>{l.entity_type}</td>
                <td style={{ padding: '0.75rem' }}>{l.entity_id}</td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>
                  Nessun log trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const UserHistory: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState<UserHistoryLog[]>([]);

  const roleName = user?.role?.name ?? "";

  useEffect(() => {
    if (roleName === "admin") {
      api.get<UserHistoryLog[]>('/admin/user-history').then(res => setHistory(res.data));
    }
  }, [roleName]);

  if (roleName !== "admin") return <Navigate to="/dashboard" replace />;

  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <h2>Storico Modifiche Utente (Admin)</h2>
        <button
          onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/user-history`)}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ⬇️ Esporta CSV
        </button>
      </div>

      <div className="table-responsive">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th>Data</th>
              <th>Target User</th>
              <th>Modificato Da</th>
              <th>Campo</th>
              <th>Vecchio Val.</th>
              <th>Nuovo Val.</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id}>
                <td style={{ padding: '0.75rem' }}>{new Date(h.created_at).toLocaleString()}</td>
                <td style={{ padding: '0.75rem' }}>{h.target_user_id}</td>
                <td style={{ padding: '0.75rem' }}>{h.modified_by_id}</td>
                <td style={{ padding: '0.75rem' }}>{h.field_name}</td>
                <td style={{ padding: '0.75rem' }}>{h.old_value}</td>
                <td style={{ padding: '0.75rem' }}>{h.new_value}</td>
              </tr>
            ))}

            {history.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '1rem', textAlign: 'center' }}>
                  Nessuno storico trovato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
