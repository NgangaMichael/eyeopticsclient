import apiClient from "../client/apiClient";

export const JobCardAPI = {
  getAll: () => apiClient.get("/jobcards"),
  getById: (id) => apiClient.get(`/jobcards/${id}`),
  create: (data) => apiClient.post("/jobcards", data),
  update: (id, data) => apiClient.put(`/jobcards/${id}`, data),
  delete: (id) => apiClient.delete(`/jobcards/${id}`),
};