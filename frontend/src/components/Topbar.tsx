import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "../css/topbar.css";


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

      <div className="topbar-user">
        <span>Benvenuto, {user?.first_name} {user?.last_name}</span>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>
    </header>
  );
};
