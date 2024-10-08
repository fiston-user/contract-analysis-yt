import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const logout = async () => {
  const response = await api.get("/auth/logout");
  return response.data;
};
