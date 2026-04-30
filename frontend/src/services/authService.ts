import api from './api';
import { User } from '../types';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const params = new URLSearchParams();
    params.append('username', email); // OAuth2 expects 'username'
    params.append('password', password);
    
    const response = await api.post<LoginResponse>('/api/v1/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/v1/user/me')
    // Mappiamo l'utente (il backend restituisce i dettagli completi, potremmo voler sistemare il first_name/last_name in un campo unico se serve)
    return response.data;
  }
};
