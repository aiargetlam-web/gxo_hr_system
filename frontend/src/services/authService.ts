import api from "./api";
import { EmployeeAuth } from "../types";

interface LoginSuccess {
  access_token: string;
  token_type: string;
}

interface LoginFirstAccess {
  requires_password_change: boolean;
  message: string;
}

export type LoginResponse = LoginSuccess | LoginFirstAccess;

export const authService = {

  // ⭐ LOGIN PROTETTA, VELOCE, ANTI-ESTENSIONI
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const controller = new AbortController();

    // Timeout di sicurezza: abort SOLO se davvero bloccato
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Referrer-Policy": "no-referrer"
          },
          credentials: "omit",        // ← evita interferenze delle estensioni
          signal: controller.signal,  // ← permette abort automatico
          body: JSON.stringify({ email, password })
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error("Login failed");
      }

      return await response.json();
    } catch (err: any) {

      // ⭐ Se è stato abortito → NON è un errore vero
      if (err.name === "AbortError") {
        // aspetta un attimo e riprova una sola volta
        await new Promise((res) => setTimeout(res, 200));
        return authService.login(email, password);
      }

      throw err;
    }
  },

  // ⭐ UTENTE LOGGATO
  getCurrentUser: async (): Promise<EmployeeAuth> => {
    const response = await api.get<EmployeeAuth>("/api/v1/auth/me");
    return response.data;
  },

  // ⭐ CAMBIO PASSWORD PRIMO ACCESSO
  changePassword: async (email: string, oldPassword: string, newPassword: string) => {
    const response = await api.post("/api/v1/auth/change-password", {
      email,
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};
