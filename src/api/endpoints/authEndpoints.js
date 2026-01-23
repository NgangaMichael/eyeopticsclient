import apiClient from "../client/apiClient";

export const AuthAPI = {
  login: (data) => apiClient.post("/auth/login", data),
  logout: () => Promise.resolve(), // JWT is client-side, so no backend call needed
};
