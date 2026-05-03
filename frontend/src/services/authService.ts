import api from "./api";
import { User } from "../types";

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

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/api/v1/users/me");
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post("/api/v1/auth/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};
