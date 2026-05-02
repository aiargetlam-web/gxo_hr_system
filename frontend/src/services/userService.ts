import api from './api';
import { User } from '../types';

export const userService = {
  // GET utenti
  getUsers: async (params?: {
    search?: string;
    is_active?: boolean | null;
  }): Promise<User[]> => {
    const query = new URLSearchParams();

    if (params?.search) query.append("search_string", params.search);
    if (params?.is_active !== undefined && params?.is_active !== null)
      query.append("is_active", String(params.is_active));

    const url = query.toString()
      ? `/users?${query.toString()}`
      : `/users`;

    const response = await api.get<User[]>(url);
    return response.data;
  },

  // CREATE utente
  createUser: async (userData: any): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  // UPDATE utente (modifica dati + cambio sito)
  updateUser: async (userId: number, data: any): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}`, data);
    return response.data;
  },

  // TOGGLE STATUS (attiva/disattiva)
  toggleStatus: async (userId: number, isActive: boolean): Promise<User> => {
    const response = await api.patch<User>(
      `/users/${userId}/toggle-status?is_active=${isActive}`
    );
    return response.data;
  },

  // IMPORT CSV
  importUsers: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  }
};
