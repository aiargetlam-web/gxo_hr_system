import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Ticket } from '../types';
import { ticketService } from '../services/ticketService';

export const Tickets: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await ticketService.getTickets();
      setTickets(data);
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
        <h2>Gestione Ticket</h2>
        {(user?.role === 'hr' || user?.role === 'admin') && (
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/tickets`)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⬇️ Esporta CSV
          </button>
        )}
      </div>
      <div className="table-responsive">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid #ddd' }}><th>ID</th><th>User ID</th><th>Stato</th><th>Priorità</th><th>Data</th></tr></thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id}>
                <td style={{ padding: '0.75rem' }}>{t.id}</td>
                <td style={{ padding: '0.75rem' }}>{t.user?.email || t.user_id}</td>
                <td style={{ padding: '0.75rem' }}>{t.status}</td>
                <td style={{ padding: '0.75rem' }}>{t.priority}</td>
                <td style={{ padding: '0.75rem' }}>{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {tickets.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Nessun ticket trovato.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
