import api from "./api";

export const benefitService = {
  getBenefitTypes: async () => {
    const res = await api.get("/api/v1/benefit-types");
    return res.data;
  },
};
