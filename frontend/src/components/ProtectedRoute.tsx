import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // ⏳ 1) Caricamento iniziale → NON fare redirect
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>;
  }

  // ❌ 2) Utente non autenticato → redirect
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ 3) Utente autenticato → accesso consentito
  return <Outlet />;
};
