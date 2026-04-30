import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="card">
      <h2>Profilo Utente</h2>
      <div className="grid-2-col" style={{ marginTop: '1.5rem' }}>
        <strong>Nome:</strong> <span>{user.first_name} {user.last_name}</span>
        <strong>Email:</strong> <span>{user.email}</span>
        <strong>ID LUL:</strong> <span>{user.id_lul || 'N/D'}</span>
        <strong>Ruolo:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span>
        <strong>Sito:</strong> <span>{user.site_name || 'Non assegnato / Globale'}</span>
        
        {(user.role === 'hr' || user.role === 'admin') && (
          <>
            <strong>Stato Account:</strong> 
            <span>
              {user.is_active 
                ? <span className="badge badge-closed">Attivo</span> 
                : <span className="badge badge-unread">Disattivo</span>
              }
            </span>
          </>
        )}
      </div>
    </div>
  );
};
