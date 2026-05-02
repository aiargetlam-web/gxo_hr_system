import api from './api';
import { User } from '../types';

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
    params.append('username', email); // OAuth2 expects 'username'
    params.append('password', password);
    
    // ❗ NON aggiungere /api/v1 qui
    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    // ❗ NON aggiungere /api/v1 qui
    const response = await api.get<User>('/users/me');
    return response.data;
  }
};
