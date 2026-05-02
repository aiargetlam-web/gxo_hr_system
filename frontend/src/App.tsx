import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import Users from './pages/Users';
import { Communications } from './pages/Communications';
import { Tickets } from './pages/Tickets';
import Board from "./pages/Board";
import { Admin } from './pages/Admin';
import { ActivityLogs, UserHistory } from './pages/Audit';
import { PowerBIDashboard } from './pages/PowerBIDashboard';
import { ChangePassword } from './pages/ChangePassword';   // ⭐ AGGIUNTO

// 🔥 TOAST
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <AuthProvider>
      {/* 🔥 TOASTER GLOBALE */}
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

          {/* 🔥 LOGIN */}
          <Route path="/login" element={<Login />} />

          {/* 🔥 PRIMO ACCESSO → CAMBIO PASSWORD */}
          <Route path="/change-password" element={<ChangePassword />} />

          {/* 🔥 ROUTE PROTETTE */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/board" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/users" element={<Users />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/board" element={<Board />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
              <Route path="/user-history" element={<UserHistory />} />
              <Route path="/powerbi" element={<PowerBIDashboard />} />
            </Route>
          </Route>

          {/* 🔥 FALLBACK */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
