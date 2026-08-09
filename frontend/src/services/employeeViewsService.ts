import api from "./api";

export const employeeViewsService = {
  getViews(userId: number) {
    return api.get(`/employee-table-views/${userId}`).then((r) => r.data);
  },

  createView(payload: { user_id: number; name: string; columns: string[] }) {
    return api.post(`/employee-table-views`, payload).then((r) => r.data);
  },

  deleteView(id: number) {
    return api.delete(`/employee-table-views/${id}`).then((r) => r.data);
  },
};
