import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { EmployeeAuth } from '../types';
import { authService } from '../services/authService';
import api from "../services/api";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: EmployeeAuth | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<EmployeeAuth | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // -----------------------------
  // INIZIALIZZAZIONE (token → user)
  // -----------------------------
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Token non valido o scaduto", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  // -----------------------------
  // LOGIN CORRETTO
  // -----------------------------
  const login = async (newToken: string) => {
    // Salva token
    localStorage.setItem('access_token', newToken);
    setToken(newToken);

    // Imposta header
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    try {
      // 🔥 Carica l'utente PRIMA di navigare
      const userData = await authService.getCurrentUser();
      setUser(userData);

      // 🔥 Naviga SOLO dopo che il ruolo è stato caricato
      navigate('/dashboard');

    } catch (error) {
      console.error("Errore caricamento utente dopo login", error);
      logout();
    }
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
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
