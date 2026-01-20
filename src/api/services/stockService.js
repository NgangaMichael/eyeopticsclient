import { StockAPI } from "../endpoints/stockEndpoints";

export const stockService = {
  async getAllStocks() {
    return (await StockAPI.getAll()).data;
  },
  async createStock(data) {
    const payload = {
      ...data,
      quantity: parseInt(data.quantity),
      price: parseFloat(data.price),
      // prescription is stored as Json in Prisma
    };
    return (await StockAPI.create(payload)).data;
  },
  async updateStock(id, data) {
    const payload = {
      ...data,
      quantity: data.quantity ? parseInt(data.quantity) : undefined,
      price: data.price ? parseFloat(data.price) : undefined,
    };
    return (await StockAPI.update(id, payload)).data;
  },
  async deleteStock(id) {
    await StockAPI.delete(id);
    return true;
  }
};