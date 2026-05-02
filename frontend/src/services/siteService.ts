import api from "./api";
import { Site } from "../types";

export const siteService = {
  getSites: async (): Promise<Site[]> => {
    const response = await api.get("/sites");
    return response.data;
  }
};
