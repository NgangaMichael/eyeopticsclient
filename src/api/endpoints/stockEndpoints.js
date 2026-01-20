import apiClient from "../client/apiClient";

export const StockAPI = {
  getAll: () => apiClient.get("/stocks"),
  getById: (id) => apiClient.get(`/stocks/${id}`),
  create: (data) => apiClient.post("/stocks", data),
  update: (id, data) => apiClient.put(`/stocks/${id}`, data),
  delete: (id) => apiClient.delete(`/stocks/${id}`),
};