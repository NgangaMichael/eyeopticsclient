// src/services/api/client/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
  // baseURL: import.meta.env.VITE_APP_SERVER_API || "http://192.168.1.156:8080/api",
  withCredentials: true, // So cookies like JWT are sent automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Interceptors for logging or token handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;