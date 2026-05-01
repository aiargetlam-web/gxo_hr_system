import api from './api';
import { BoardFile } from '../types';

export const boardService = {
  // 🔹 Ora accetta il filtro active
  getFiles: async (active: "true" | "false" = "true"): Promise<BoardFile[]> => {
    const response = await api.get<BoardFile[]>(`/api/v1/board/?active=${active}`);
    return response.data;
  },

  uploadFile: async (file: File, siteIds: number[]): Promise<BoardFile> => {
    const formData = new FormData();
    formData.append('file', file);

    // 🔹 inviamo una stringa "1,2,3" come si aspetta il backend
    formData.append('site_ids', siteIds.join(','));

    const response = await api.post<BoardFile>('/api/v1/board/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  downloadFileUrl: (id: number): string => {
    return `${api.defaults.baseURL}/api/v1/board/${id}/download`;
  }
};
