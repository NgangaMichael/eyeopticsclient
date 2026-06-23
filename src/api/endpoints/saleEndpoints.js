import apiClient from "../client/apiClient";

export const SaleAPI = {
  getAll: () => apiClient.get("/sales"),
  getById: (id) => apiClient.get(`/sales/${id}`),
  create: (data) => apiClient.post("/sales", data),
  update: (id, data) => apiClient.put(`/sales/${id}`, data),
  bulkUpdate: (bulkPayloads) => apiClient.put("/sales/bulk", bulkPayloads),
  delete: (id) => apiClient.delete(`/sales/${id}`),
};