import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // -----------------------------
  // INIZIALIZZAZIONE (token → user)
  // -----------------------------
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
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
  // LOGIN MIGLIORATO
  // -----------------------------
  const login = async (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);

    try {
      // 🔥 Aggiorna SUBITO l’utente dopo il login
      const userData = await authService.getCurrentUser();
      setUser(userData);
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
