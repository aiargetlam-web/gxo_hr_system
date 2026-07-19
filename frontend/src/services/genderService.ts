import api from "./api";

export const genderService = {
  getGenders: async () => {
    const res = await api.get("/api/v1/genders");
    return res.data;
  },
};
