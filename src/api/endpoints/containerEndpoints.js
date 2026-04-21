import apiClient from "../client/apiClient";

export const ContainerAPI = {
  getAll: () => apiClient.get("/containers"),
  getById: (id) => apiClient.get(`/containers/${id}`),
  create: (data) => apiClient.post("/containers", data),
  update: (id, data) => apiClient.put(`/containers/${id}`, data),
  delete: (id) => apiClient.delete(`/containers/${id}`),
  addItem: (id, data) => apiClient.post(`/containers/${id}/items`, data),
  bulkAddItems: (id, items) => apiClient.post(`/containers/${id}/items/bulk`, { items }),
  deleteItem: (id, itemId) => apiClient.delete(`/containers/${id}/items/${itemId}`),
  receive: (id) => apiClient.post(`/containers/${id}/receive`),
  updateItem: (id, itemId, data) => apiClient.put(`/containers/${id}/items/${itemId}`, data),

};