import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// ⭐ PAGINE HR REALI
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";

// ⭐ IMPORT CORRETTI DA Audit.tsx
import ActivityLogs from "./pages/Audit";
import { UserHistory } from "./pages/Audit";

import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <>
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

      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* AREA PROTETTA */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            {/* HOME */}
            <Route path="/" element={<Navigate to="/board" replace />} />

            {/* PAGINE STANDARD */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/board" element={<Board />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/powerbi" element={<PowerBIDashboard />} />

            {/* ⭐ PAGINE HR */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/employee/:id" element={<EmployeeDetail />} />

            {/* ⭐ LOG & STORICO */}
            <Route path="/activity-log" element={<ActivityLogs />} />
            <Route path="/user-history" element={<UserHistory />} />

          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default App;
