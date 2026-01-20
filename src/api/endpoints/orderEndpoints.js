import apiClient from "../client/apiClient";

export const OrderAPI = {
  getAll: () => apiClient.get("/orders"),
  getById: (id) => apiClient.get(`/orders/${id}`),
  create: (data) => apiClient.post("/orders", data),
  update: (id, data) => apiClient.put(`/orders/${id}`, data),
  delete: (id) => apiClient.delete(`/orders/${id}`),
};