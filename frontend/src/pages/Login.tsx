import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { LoginResponse } from '../types';
import '../css/login.css'; // <-- IMPORT CORRETTO

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response: LoginResponse = await authService.login(email, password);

      localStorage.setItem("user_email", email);

      if ("requires_password_change" in response) {
        navigate('/change-password');
        return;
      }

      if ("access_token" in response) {
        const user = await login(response.access_token);
        if (user) navigate('/dashboard');
        return;
      }

      setError("Risposta inattesa dal server.");
    } catch {
      setError('Credenziali non valide.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="login-header">
          <h1>GXO HR Portal</h1>
          <p>Accesso riservato</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control login-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn">
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
