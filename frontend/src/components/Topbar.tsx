import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <button className="hamburger-btn" onClick={onMenuClick}>
        ☰
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Benvenuto, {user?.first_name} {user?.last_name}</span>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>Logout</button>
      </div>
    </header>
  );
};
