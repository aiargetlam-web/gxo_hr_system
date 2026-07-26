import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { LoginResponse } from '../types';
import '../css/login.css'; // <-- IMPORT CORRETTO
import bg from "../assets/images/background-primordia.png";

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
        await login(response.access_token);
        navigate('/dashboard'); 
      return;
     }


      setError("Risposta inattesa dal server.");
    } catch {
      setError('Credenziali non valide.');
    }
  };

  return (
    <div className="login-wrapper" style={{ backgroundImage: `url(${bg})` }}>

  <div className="login-header-outside">
    <h1>GXO Primordia</h1>
    <p>Dove nasce la tua organizzazione.</p>
    <p>L’origine dei processi HR.</p>
  </div>

  <div className="login-card">

    <h2 className="login-title">Login:</h2>

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
