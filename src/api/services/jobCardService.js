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

//   async createJobCard(formData) {
//   try {
//     const payload = {
//       // 1. Basic Info
//       jobCardNumber: formData.jobCardNumber,
//       patientId: Number(formData.patientId),
//       insuranceCompany: formData.insuranceCompany || null,
//       date: formData.date || new Date().toISOString(),

//       // 2. Prescription (THE MISSING PIECE)
//       rSph: formData.rSph || "",
//       rCyl: formData.rCyl || "",
//       rAxis: formData.rAxis ? Number(formData.rAxis) : null,
//       rPrism: formData.rPrism || "",
//       rBase: formData.rBase || "",
//       lSph: formData.lSph || "",
//       lCyl: formData.lCyl || "",
//       lAxis: formData.lAxis ? Number(formData.lAxis) : null,
//       lPrism: formData.lPrism || "",
//       lBase: formData.lBase || "",
      
//       // 3. Measurements
//       nearAdd: formData.nearAdd || "",
//       distPd: formData.distPd || "",
//       nearPd: formData.nearPd || "",
//       heights: formData.heights || "",

//       // 4. Inventory Selection
//       lenses: formData.lenses || null,
//       frame: formData.frame || null,
//       lensStockId: formData.lensStockId ? Number(formData.lensStockId) : null,
//       frameStockId: formData.frameStockId ? Number(formData.frameStockId) : null,
//       lensQty: formData.lensQty ? parseFloat(formData.lensQty) : 0,
//       frameQty: formData.frameQty ? parseInt(formData.frameQty, 10) : 0,

//       // 5. Financials
//       lensPrice: Number(formData.lensPrice || 0),
//       framePrice: Number(formData.framePrice || 0),
//       consultation: Number(formData.consultation || 0),
//       total: Number(formData.total || 0),
//       advance: Number(formData.advance || 0),
//       balance: Number(formData.total || 0) - Number(formData.advance || 0),
//       jobDelDate: formData.jobDelDate || null,
//     };

//     console.log("✅ FIXED payload being sent to API:", payload);

//     const response = await JobCardAPI.create(payload); // Uncommented!
//     return response.data;
//   } catch (error) {
//     console.error("Error creating job card:", error);
//     throw error;
//   }
// },

async createJobCard(formData) {
  // Just clean the numeric IDs/Prices and spread the rest
  const payload = {
    ...formData,
    patientId: Number(formData.patientId),
    lensStockId: formData.lensStockId ? Number(formData.lensStockId) : null,
    frameStockId: formData.frameStockId ? Number(formData.frameStockId) : null,
    // Add any other specific Number() conversions needed
  };
  
  const response = await JobCardAPI.create(payload);
  return response.data;
},

  // Update existing job card
  async updateJobCard(id, formData) {
    try {
      // Ensure numeric fields are correctly formatted if they exist
      const updatedData = { ...formData };
      console.log("✅ Received formData for update:", formData);
      
      if (formData.total !== undefined || formData.advance !== undefined) {
        const total = Number(formData.total || 0);
        const advance = Number(formData.advance || 0);
        updatedData.balance = total - advance;
      }

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