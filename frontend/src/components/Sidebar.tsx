import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "../css/sidebar.css";



interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const path = useLocation().pathname;

  if (!user) return null;

  const roleName = user.role?.name ?? "employee";

  return (
    <>
      {/* Sfondo mobile */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      ></div>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          GXO Primordia
        </div>

        {/* Info utente */}
        <div className="sidebar-user-info">
          RUOLO: {roleName.toUpperCase()}<br />
          SITO: Tutti
        </div>

        <nav className="sidebar-nav">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={`sidebar-link ${path === '/dashboard' ? 'active' : ''}`}
            onClick={onClose}
          >
            🏠 Dashboard
          </Link>

          {/* Bacheca (esiste già) */}
          <Link
            to="/board"
            className={`sidebar-link ${path === '/board' ? 'active' : ''}`}
            onClick={onClose}
          >
            📁 Bacheca
          </Link>

          {/* Profilo (esiste già) */}
          <Link
            to="/profile"
            className={`sidebar-link ${path === '/profile' ? 'active' : ''}`}
            onClick={onClose}
          >
            👤 Profilo
          </Link>

          {/* HR + ADMIN (solo ciò che esiste) */}
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
                to="/employees"
                className={`sidebar-link ${path === '/employees' ? 'active' : ''}`}
                onClick={onClose}
              >
                👥 Gestione Utenti
              </Link>
            </>
          )}

          {/* ADMIN — solo ciò che esiste oggi */}
          {roleName === 'admin' && (
            <>
              <Link
                to="/admin"
                className={`sidebar-link ${path === '/admin' ? 'active' : ''}`}
                onClick={onClose}
              >
                ⚙️ Gestione HR Siti
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};
