import api from './api';
import { BoardFile } from '../types';

export const boardService = {
  // ============================
  // GET files con filtro active + sorting
  // ============================
  getFiles: async (
    active: "true" | "false" = "true",
    sortBy: string = "upload_date",
    direction: "asc" | "desc" = "desc"
  ): Promise<BoardFile[]> => {
    const response = await api.get<BoardFile[]>(
      `/api/v1/board?active=${active}&sort_by=${sortBy}&direction=${direction}`
    );
    return response.data;
  },

  // ============================
  // UPLOAD file
  // ============================
  uploadFile: async (file: File, siteIds: number[]): Promise<BoardFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('site_ids', siteIds.join(',')); // "1,2,3"

    const response = await api.post<BoardFile>('/api/v1/board/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // ============================
  // DOWNLOAD URL
  // ============================
  downloadFileUrl: (id: number): string => {
    return `${api.defaults.baseURL}/api/v1/board/${id}/download`;
  },

  // ============================
  // GET tutti i siti
  // ============================
  getSites: async () => {
    const response = await api.get('/api/v1/sites');
    return response.data;
  },

  // ============================
  // GET siti associati a un file
  // ============================
  getFileSites: async (id: number) => {
    const response = await api.get(`/api/v1/board/${id}`);
    return response.data.sites;
  },

  // ============================
  // UPDATE siti associati a un file
  // ============================
  updateSites: async (id: number, siteIds: number[]) => {
    const formData = new FormData();
    formData.append("site_ids", siteIds.join(","));
    return api.patch(`/api/v1/board/${id}/sites`, formData);
  },

  // ============================
  // UPDATE stato attivo/disattivo
  // ============================
  updateStatus: async (id: number, newStatus: boolean) => {
    const formData = new FormData();
    formData.append("is_active", String(newStatus));
    return api.patch(`/api/v1/board/${id}/status`, formData);
  }
};
