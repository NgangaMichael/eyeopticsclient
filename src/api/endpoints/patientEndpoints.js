import apiClient from "../client/apiClient";

export const PatientAPI = {
  getAll: () => apiClient.get("/patients"),
  getById: (id) => apiClient.get(`/patients/${id}`),
  create: (data) => apiClient.post("/patients", data),
  update: (id, data) => apiClient.put(`/patients/${id}`, data),
  delete: (id) => apiClient.delete(`/patients/${id}`),
};