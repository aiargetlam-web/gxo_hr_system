import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { EmployeeAuth } from '../types';
import { authService } from '../services/authService';
import api from "../services/api";

interface AuthContextType {
  user: EmployeeAuth | null;
  token: string | null;
  login: (token: string) => Promise<EmployeeAuth | null>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => null,
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<EmployeeAuth | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🔥 1) Caricamento iniziale (refresh pagina)
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch {
          logout();
        }
      }

      setIsLoading(false); // 🔥 fondamentale per ProtectedRoute
    };

    initAuth();
  }, [token]);

  // 🔥 2) Login
  const login = async (newToken: string): Promise<EmployeeAuth | null> => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);

    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      return userData; // 🔥 ritorna l’utente
    } catch {
      logout();
      return null;
    }
  };

  // 🔥 3) Logout
  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
