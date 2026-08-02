import api from "./api";

export const costCenterService = {
  getCostCenters: async () => {
    const res = await api.get("/api/v1/cost-centers");
    return res.data;
  },
};
