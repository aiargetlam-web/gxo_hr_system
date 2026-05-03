import api from "./api";
import { Role } from "../types";

export const roleService = {
  async getRoles(): Promise<Role[]> {
    const res = await api.get("/roles");
    return res.data;
  }
};
