import { OrderAPI } from "../endpoints/orderEndpoints";

export const orderService = {
  async getAllOrders() {
    return (await OrderAPI.getAll()).data;
  },
  async createOrder(data) {
    const payload = {
      ...data,
      quantityOrdered: parseInt(data.quantityOrdered),
      landedCost: parseFloat(data.landedCost),
      expectedArrival: data.expectedArrival ? new Date(data.expectedArrival).toISOString() : null,
      status: data.status || "pending"
    };
    return (await OrderAPI.create(payload)).data;
  },
  async updateOrder(id, data) {
    return (await OrderAPI.update(id, data)).data;
  },
  async deleteOrder(id) {
    await OrderAPI.delete(id);
    return true;
  }
};