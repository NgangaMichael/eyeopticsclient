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
      referenceNumber: saleData.referenceNumber,
      customerId: parseInt(saleData.customerId),
      discount: parseFloat(saleData.discount || 0), 
      
      // Pass the new fields. Use null if they are empty strings 
      // to ensure the backend receives "nothing" for optional fields.
      etimsReceipt: saleData.etimsReceipt || null,
      etimsAmount: saleData.etimsAmount ? parseFloat(saleData.etimsAmount) : null,
      
      items: saleData.items.map(item => ({
        stockId: parseInt(item.stockId),
        quantity: parseFloat(item.quantity),
        price: parseFloat(item.price)
      }))
    };
    return (await SaleAPI.create(payload)).data;
  },

  async getSaleDetails(id) {
    return (await SaleAPI.getById(id)).data;
  },

  // Add this inside your saleService object
  async updateSale(id, updateData) {
    const payload = {
      etimsReceipt: updateData.etimsReceipt || null,
      etimsAmount: updateData.etimsAmount ? parseFloat(updateData.etimsAmount) : null,
    };
    // Assuming SaleAPI has an .update(id, data) method
    return (await SaleAPI.update(id, payload)).data;
  },

  async deleteSale(id) {
    return (await SaleAPI.delete(id)).data;
  }
};