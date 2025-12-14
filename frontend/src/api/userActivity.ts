import api from "../lib/axios";

export const getUserActivity = async () => {
  const response = await api.get("/user_activity");
  return response.data;
};