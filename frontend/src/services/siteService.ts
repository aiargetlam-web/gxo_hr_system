import api from "./api";
import { Site } from "../types";

export const siteService = {
  getSites: async (): Promise<Site[]> => {
    const response = await api.get("/api/v1/sites");
    return response.data;
  },

  getSite: async (id: number): Promise<Site> => {
    const response = await api.get(`/api/v1/sites/${id}`);
    return response.data;
  },

  createSite: async (data: Partial<Site>) => {
    const response = await api.post("/api/v1/sites", data);
    return response.data;
  },

  updateSite: async (id: number, data: Partial<Site>) => {
    const response = await api.put(`/api/v1/sites/${id}`, data);
    return response.data;
  },

  deleteSite: async (id: number) => {
    const response = await api.delete(`/api/v1/sites/${id}`);
    return response.data;
  },
};
