import { OrderAPI } from "../endpoints/orderEndpoints";

export const orderService = {
  async getAllOrders() {
    return (await OrderAPI.getAll()).data;
  },
  async createOrder(data) {
    const payload = {
      ...data,
      // CHANGED: Use parseFloat to allow 0.5 for single lenses
      quantityOrdered: parseFloat(data.quantityOrdered),
      landedCost: parseFloat(data.landedCost),
      priceKsh: parseFloat(data.priceKsh || 0),
      priceUsd: parseFloat(data.priceUsd || 0),
      // ADDED: Explicitly handle powers
      sph: data.sph ? parseFloat(data.sph) : null,
      cyl: data.cyl ? parseFloat(data.cyl) : null,
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