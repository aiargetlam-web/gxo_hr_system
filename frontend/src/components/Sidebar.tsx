import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const path = useLocation().pathname;

  if (!user) return null;

  // 🔥 Estraggo il nome del ruolo in modo sicuro
  const roleName = user.role?.name ?? "";

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      ></div>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          GXO HR Portal
        </div>

        <div
          style={{
            padding: '0 1.5rem',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '1rem'
          }}
        >
          RUOLO: {roleName.toUpperCase()}<br />
          SITO: {user.site?.name || 'Tutti'}
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`sidebar-link ${path === '/dashboard' ? 'active' : ''}`}
            onClick={onClose}
          >
            Dashboard
          </Link>

          <Link
            to="/board"
            className={`sidebar-link ${path === '/board' ? 'active' : ''}`}
            onClick={onClose}
          >
            Bacheca
          </Link>

          <Link
            to="/communications"
            className={`sidebar-link ${path === '/communications' ? 'active' : ''}`}
            onClick={onClose}
          >
            Comunicazioni
          </Link>

          <Link
            to="/tickets"
            className={`sidebar-link ${path === '/tickets' ? 'active' : ''}`}
            onClick={onClose}
          >
            Ticket
          </Link>

          <Link
            to="/profile"
            className={`sidebar-link ${path === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            Profilo
          </Link>

          {/* 🔥 HR + ADMIN */}
          {(roleName === 'hr' || roleName === 'admin') && (
            <>
              <Link
                to="/powerbi"
                className={`sidebar-link ${path === '/powerbi' ? 'active' : ''}`}
                style={{
                  marginTop: '2rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '1rem'
                }}
                onClick={onClose}
              >
                📊 Dashboard KPI
              </Link>

              <Link
                to="/users"
                className={`sidebar-link ${path === '/users' ? 'active' : ''}`}
                onClick={onClose}
              >
                👥 Gestione Utenti
              </Link>
            </>
          )}

          {/* 🔥 SOLO ADMIN */}
          {roleName === 'admin' && (
            <>
              <Link
                to="/admin"
                className={`sidebar-link ${path === '/admin' ? 'active' : ''}`}
                onClick={onClose}
              >
                ⚙️ Gestione HR Siti
              </Link>

              <Link
                to="/activity-logs"
                className={`sidebar-link ${path === '/activity-logs' ? 'active' : ''}`}
                onClick={onClose}
              >
                📜 Log Attività
              </Link>

              <Link
                to="/user-history"
                className={`sidebar-link ${path === '/user-history' ? 'active' : ''}`}
                onClick={onClose}
              >
                🕒 Storico Utenti
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};
