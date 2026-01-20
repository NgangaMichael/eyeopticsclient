import { UserAPI } from "../endpoints/userEndpoints";

export const userService = {
  async getAllUsers() {
    return (await UserAPI.getAll()).data;
  },
  async createUser(userData) {
    // Basic payload; backend handles password hashing
    return (await UserAPI.create(userData)).data;
  },
  async updateUser(id, userData) {
    return (await UserAPI.update(id, userData)).data;
  },
  async deleteUser(id) {
    return (await UserAPI.delete(id)).data;
  }
};