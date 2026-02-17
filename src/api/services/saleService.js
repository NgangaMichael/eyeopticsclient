import { SaleAPI } from "../endpoints/saleEndpoints";

export const saleService = {
  async getAllSales() {
    return (await SaleAPI.getAll()).data;
  },
  /**
   * @param {Object} saleData - contains customerId and items array
   * items: [{ stockId: 1, quantity: 2, price: 5000 }]
   */
  // src/api/services/saleService.js

async createSale(saleData) {
    const payload = {
      customerId: parseInt(saleData.customerId),
      // Pass the discount through to the backend
      discount: parseFloat(saleData.discount || 0), 
      items: saleData.items.map(item => ({
        stockId: parseInt(item.stockId),
        quantity: parseFloat(item.quantity),
        price: parseFloat(item.price)
      }))
      // REMOVED 'total' calculation here—let the backend repo do it to ensure consistency
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