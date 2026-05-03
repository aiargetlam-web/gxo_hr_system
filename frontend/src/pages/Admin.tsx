import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const Admin: React.FC = () => {
  const { user } = useContext(AuthContext);

  // 🔥 Estraggo il nome del ruolo in modo sicuro
  const roleName = user?.role?.name ?? "";

  if (roleName !== 'admin') return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <h1>Gestione HR e Siti</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Assegna i siti di competenza ai referenti HR.
      </p>
      
      <div className="card">
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Nome HR</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Siti Assegnati</th>
                <th style={{ padding: '0.75rem' }}>Azioni</th>
              </tr>
            </thead>

            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.75rem' }}>Laura Bianchi</td>
                <td style={{ padding: '0.75rem' }}>hr@example.com</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className="badge badge-inprogress" style={{ marginRight: '5px' }}>Milano</span>
                  <span className="badge badge-inprogress">Roma</span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                  >
                    Modifica
                  </button>
                </td>
              </tr>
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};
