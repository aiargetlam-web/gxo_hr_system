import api from "./api";

export const benefitService = {
  getBenefitTypes: async () => {
    const res = await api.get("/benefit-types/");
    return res.data;
  },
};
