import api from "./api";

export const genderService = {
  getGenders: async () => {
    const res = await api.get("/genders/");
    return res.data;
  },
};
