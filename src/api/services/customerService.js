import { CustomerAPI } from "../endpoints/customerEndpoints";

export const customerService = {
  async getAllCustomers() {
    return (await CustomerAPI.getAll()).data;
  },
  async createCustomer(data) {
    const payload = {
      ...data,
      type: data.type || "patient", // patient, company, outlet
    };
    return (await CustomerAPI.create(payload)).data;
  },
  async updateCustomer(id, data) {
    return (await CustomerAPI.update(id, data)).data;
  },
  async deleteCustomer(id) {
    return (await CustomerAPI.delete(id)).data;
  }
};