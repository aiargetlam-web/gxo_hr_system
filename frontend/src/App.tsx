import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Communications } from './pages/Communications';
import { Tickets } from './pages/Tickets';
import Board from "./pages/Board";
import { Admin } from './pages/Admin';
import { PowerBIDashboard } from './pages/PowerBIDashboard';
import ChangePassword from './pages/ChangePassword';

// 🔥 TOAST
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px'
          }
        }}
      />

      <Router>
        <Routes>

          {/* LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* PRIMO ACCESSO */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* ROUTE PROTETTE */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>

              {/* HOME → BOARD */}
              <Route path="/" element={<Navigate to="/board" replace />} />

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* LEGACY SYSTEM (manteniamo perché hai scelto B) */}
              <Route path="/communications" element={<Communications />} />
              <Route path="/tickets" element={<Tickets />} />

              {/* BACHECA */}
              <Route path="/board" element={<Board />} />

              {/* ADMIN */}
              <Route path="/admin" element={<Admin />} />

              {/* POWERBI */}
              <Route path="/powerbi" element={<PowerBIDashboard />} />

            </Route>
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
