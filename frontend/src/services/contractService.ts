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

  // 🔥 AGGIUNTO — NECESSARIO PER IL SELECT DEL TURNO
  getShiftTypes: async () => {
    const res = await api.get("/api/v1/shift-types");
    return res.data;
  },
};
