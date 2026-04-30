import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User } from '../types';
import { userService } from '../services/userService';

export const Users: React.FC = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await userService.toggleStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <div className="flex-wrap-mobile">
        <div>
           <h1>Gestione Utenti</h1>
           <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {currentUser?.role === 'admin' ? 'Vista Globale' : `Vista limitata al sito: ${currentUser?.site_name}`}
           </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL}/export/users`)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto', justifyContent: 'center' }}>
            ⬇️ Esporta CSV
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem' }}>ID LUL</th>
              <th style={{ padding: '0.75rem' }}>Nome Completo</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Sito</th>
              <th style={{ padding: '0.75rem' }}>Stato</th>
              <th style={{ padding: '0.75rem' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: !u.is_active ? '#f8f9fa' : 'transparent', color: !u.is_active ? '#999' : 'inherit' }}>
                <td style={{ padding: '0.75rem' }}>{u.id_lul}</td>
                <td style={{ padding: '0.75rem' }}>{u.first_name} {u.last_name}</td>
                <td style={{ padding: '0.75rem' }}>{u.email}</td>
                <td style={{ padding: '0.75rem' }}>{u.site_id || 'N/D'}</td>
                <td style={{ padding: '0.75rem' }}>
                  {u.is_active ? <span className="badge badge-closed">Attivo</span> : <span className="badge badge-unread">Disattivo</span>}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button onClick={() => handleToggleStatus(u.id, u.is_active)} className="btn btn-secondary" style={{ backgroundColor: u.is_active ? '#dc3545' : '#28a745', padding: '0.25rem 0.5rem' }}>
                    {u.is_active ? 'Disattiva' : 'Riattiva'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
