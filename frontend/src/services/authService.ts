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

  // ⭐ LOGIN BLINDATO (fetch + JSON + CORS)
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
      {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          username: email,
          password: password
        })
      }
    );

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  },

  // 🔥 RESTO INVARIATO (Axios)
  getCurrentUser: async (): Promise<EmployeeAuth> => {
    const response = await api.get<EmployeeAuth>("/api/v1/employees/me");
    return response.data;
  },

  changePassword: async (email: string, oldPassword: string, newPassword: string) => {
    const response = await api.post("/api/v1/auth/change-password", {
      email,
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};
