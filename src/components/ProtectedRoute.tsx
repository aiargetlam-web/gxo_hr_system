import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
