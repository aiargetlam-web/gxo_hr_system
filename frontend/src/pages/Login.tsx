import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, password);

      // 🔥 1) PRIMO ACCESSO → reindirizza a change-password
      if ("requires_password_change" in response && response.requires_password_change) {
        navigate('/change-password');
        return;
      }

      // 🔥 2) LOGIN NORMALE
      if ("access_token" in response) {
        login(response.access_token);
        navigate('/dashboard');
        return;
      }

      // 🔥 Caso inatteso (non dovrebbe mai accadere)
      setError("Risposta inattesa dal server.");

    } catch (err) {
      setError('Credenziali non valide.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-background)' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>GXO HR Portal</h2>
        {error && <div style={{ padding: '0.5rem', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '1rem', borderRadius: '4px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Accedi</button>
        </form>
      </div>
    </div>
  );
};
