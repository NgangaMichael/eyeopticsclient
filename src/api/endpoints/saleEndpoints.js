import apiClient from "../client/apiClient";

export const SaleAPI = {
  getAll: () => apiClient.get("/sales"),
  getById: (id) => apiClient.get(`/sales/${id}`), // Often includes items
  create: (data) => apiClient.post("/sales", data),
  update: (id, data) => apiClient.put(`/sales/${id}`, data),
  delete: (id) => apiClient.delete(`/sales/${id}`),
};