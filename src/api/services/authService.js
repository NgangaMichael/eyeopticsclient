import { AuthAPI } from "../endpoints/authEndpoints";

export const authService = {
  async login(credentials) {
    const { data } = await AuthAPI.login(credentials);

    // Persist auth state
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data.user;
  },

  logout() {
    localStorage.clear();
    // localStorage.removeItem("token");
    // localStorage.removeItem("user");
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};
