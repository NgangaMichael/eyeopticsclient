import { SupplierAPI } from "../endpoints/supplierEndpoints";

export const supplierService = {
  async getAllSuppliers() {
    return (await SupplierAPI.getAll()).data;
  },
  async createSupplier(data) {
    return (await SupplierAPI.create(data)).data;
  },
  async updateSupplier(id, data) {
    return (await SupplierAPI.update(id, data)).data;
  },
  async deleteSupplier(id) {
    return (await SupplierAPI.delete(id)).data;
  }
};