import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, isLoading, token } = useContext(AuthContext);
  const location = useLocation();

  // ⏳ 1) Caricamento iniziale
  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>;
  }

  // ❌ 2) Nessun token → utente non loggato
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ 3) Token presente ma user non caricato → token scaduto o invalido
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 4) Utente autenticato → accesso consentito
  return <Outlet />;
};
