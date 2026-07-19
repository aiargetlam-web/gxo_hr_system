import api from "./api";

export const contractService = {
  getWorkRegimes: async () => {
    const res = await api.get("/api/v1/work-regimes");
    return res.data;
  },

  getContractNatures: async () => {
    const res = await api.get("/api/v1/contract-natures");
    return res.data;
  },
};
