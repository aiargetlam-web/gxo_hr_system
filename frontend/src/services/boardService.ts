import api from './api';
import { BoardFile } from '../types';

export const boardService = {
  getFiles: async (): Promise<BoardFile[]> => {
    const response = await api.get<BoardFile[]>('/board/');
    return response.data;
  },

  uploadFile: async (file: File, siteIds: number[]): Promise<BoardFile> => {
    const formData = new FormData();
    formData.append('file', file);
    siteIds.forEach(id => formData.append('site_ids', id.toString()));

    const response = await api.post<BoardFile>('/board/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  downloadFileUrl: (id: number): string => {
    return `${api.defaults.baseURL}/board/${id}/download`;
  }
};
