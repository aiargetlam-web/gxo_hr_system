import api from "./api";

export const getEmploymentStatusTypes = async () => {
  const response = await api.get("/api/v1/employment-status-types");
  return response.data;
};
