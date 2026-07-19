import api from "./api";

export const contractService = {
  getWorkRegimes: async () => {
    const res = await api.get("/work-regimes/");
    return res.data;
  },

  getContractNatures: async () => {
    const res = await api.get("/contract-natures/");
    return res.data;
  },
};
