import { JobCardAPI } from "../endpoints/jobCardEndpoints";

/**
 * Handles job card-related API logic and data transformations.
 */
export const jobCardService = {
  // Fetch all job cards
  async getAllJobCards() {
    try {
      const response = await JobCardAPI.getAll();
      return response.data;
    } catch (error) {
      console.error("Error fetching job cards:", error);
      throw error;
    }
  },

  // Get single job card by ID
  async getJobCardById(id) {
    try {
      const response = await JobCardAPI.getById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching job card by ID:", error);
      throw error;
    }
  },

async createJobCard(formData) {
    try {
      const payload = {
        ...formData,
        // Ensure all numeric fields are correctly typed
        patientId: Number(formData.patientId),
        
        // Lens Specifics
        rLensStockId: formData.rLensStockId ? Number(formData.rLensStockId) : null,
        lLensStockId: formData.lLensStockId ? Number(formData.lLensStockId) : null,
        rLensPrice: Number(formData.rLensPrice || 0),
        lLensPrice: Number(formData.lLensPrice || 0),
        
        // Frame Specifics
        frameStockId: formData.frameStockId ? Number(formData.frameStockId) : null,
        framePrice: Number(formData.framePrice || 0),
        frameQty: Number(formData.frameQty || 0),
        
        // Financials
        consultation: Number(formData.consultation || 0),
        discount: Number(formData.discount || 0),
        advance: Number(formData.advance || 0),
        total: Number(formData.total || 0),
        balance: Number(formData.balance || 0),
      };

      const response = await JobCardAPI.create(payload);
      return response.data;
    } catch (error) {
      console.error("Error creating job card:", error);
      throw error;
    }
  },

  async updateJobCard(id, formData) {
    try {
      // Re-calculating balance here is a good safety check
      const total = Number(formData.total || 0);
      const advance = Number(formData.advance || 0);
      
      const updatedData = { 
        ...formData,
        // Ensure clean numbers for the update payload
        rLensPrice: Number(formData.rLensPrice || 0),
        lLensPrice: Number(formData.lLensPrice || 0),
        framePrice: Number(formData.framePrice || 0),
        total: total,
        advance: advance,
        balance: total - advance 
      };

      const response = await JobCardAPI.update(id, updatedData);
      return response.data;
    } catch (error) {
      console.error("Error updating job card:", error);
      throw error;
    }
  },

  // Add this to your jobCardService object
    async getJobCardsByPatientId(patientId) {
    try {
        const response = await JobCardAPI.getAll();
        // Filters the job cards for this specific patient
        return response.data.filter(card => card.patientId === Number(patientId));
    } catch (error) {
        console.error("Error fetching patient history:", error);
        throw error;
    }
    },

  // Delete job card
  async deleteJobCard(id) {
    try {
      await JobCardAPI.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting job card:", error);
      throw error;
    }
  },
};