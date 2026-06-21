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
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    const response = await api.post("/api/v1/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  },

  // 🔥 ORA RESTITUISCE EmployeeAuth, NON User
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
