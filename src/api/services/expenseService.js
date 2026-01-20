import { ExpenseAPI } from "../endpoints/expenseEndpoints";

/**
 * Handles expense-related API logic and data transformations.
 */
export const expenseService = {
  // Fetch all expenses
  async getAllExpenses() {
    try {
      const response = await ExpenseAPI.getAll();
      return response.data; // Returns the array of expenses
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  // Get single expense by ID
  async getExpenseById(id) {
    try {
      const response = await ExpenseAPI.getById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching expense by ID:", error);
      throw error;
    }
  },

  // Create a new expense
  async createExpense(expenseData) {
    try {
      const payload = {
        title: expenseData.title,
        amount: Number(expenseData.amount), // Ensure amount is a number
        category: expenseData.category || "General",
        note: expenseData.note || "",
      };
      const response = await ExpenseAPI.create(payload);
      return response.data;
    } catch (error) {
      console.error("Error creating expense:", error);
      throw error;
    }
  },

  // Update existing expense
  async updateExpense(id, expenseData) {
    try {
      const payload = {
        title: expenseData.title,
        amount: Number(expenseData.amount),
        category: expenseData.category,
        note: expenseData.note,
      };
      const response = await ExpenseAPI.update(id, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating expense:", error);
      throw error;
    }
  },

  // Delete expense
  async deleteExpense(id) {
    try {
      await ExpenseAPI.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  },
};