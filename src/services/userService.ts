import api from './api';
import { User } from '../types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/');
    return response.data;
  },

  createUser: async (userData: any): Promise<User> => {
    const response = await api.post<User>('/users/', userData);
    return response.data;
  },

  toggleStatus: async (userId: number, isActive: boolean): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}/toggle-status`, { is_active: isActive });
    return response.data;
  },

  importUsers: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
