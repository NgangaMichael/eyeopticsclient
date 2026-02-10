import { SaleAPI } from "../endpoints/saleEndpoints";

export const saleService = {
  async getAllSales() {
    return (await SaleAPI.getAll()).data;
  },
  /**
   * @param {Object} saleData - contains customerId and items array
   * items: [{ stockId: 1, quantity: 2, price: 5000 }]
   */
  async createSale(saleData) {
    const payload = {
      customerId: parseInt(saleData.customerId),
      // Map items to ensure correct data types for Prisma
      items: saleData.items.map(item => ({
        stockId: parseInt(item.stockId),
        quantity: parseFloat(item.quantity),
        price: parseFloat(item.price)
      })),
      // Total can be calculated here or on the backend
      total: saleData.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
    };
    return (await SaleAPI.create(payload)).data;
  },
  async getSaleDetails(id) {
    return (await SaleAPI.getById(id)).data;
  },
  async deleteSale(id) {
    return (await SaleAPI.delete(id)).data;
  }
};