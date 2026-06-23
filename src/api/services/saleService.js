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
      miscellaneous: parseFloat(saleData.miscellaneous || 0),
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
  // Update this inside your saleService object in saleService.js
  async updateSale(id, updateData) {
    const payload = {
      etimsReceipt: updateData.etimsReceipt || null,
      etimsAmount: updateData.etimsAmount ? parseFloat(updateData.etimsAmount) : null,
      // Add this line to pass down the discount value safely to your database backend
      discount: updateData.discount !== undefined ? parseFloat(updateData.discount || 0) : undefined,
      miscellaneous: updateData.miscellaneous !== undefined ? parseFloat(updateData.miscellaneous || 0) : undefined
    };
    
    // Clean up undefined fields so you don't accidentally send a raw 'undefined' value to the API
    if (payload.discount === undefined) delete payload.discount;
    if (payload.miscellaneous === undefined) delete payload.miscellaneous;

    return (await SaleAPI.update(id, payload)).data;
  },

  async bulkUpdateSales(bulkPayloads) {
    return (await SaleAPI.bulkUpdate(bulkPayloads)).data;
  },

  async deleteSale(id) {
    return (await SaleAPI.delete(id)).data;
  }
};