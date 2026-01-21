/**
 * Credits Service - API calls for credit management
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const creditsService = {
  /**
   * Get current credit balance for a user
   * @param {number} userId - User ID
   * @returns {Promise} Credit balance data
   */
  getBalance: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/credits/balance`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get credit balance:', error);
      throw error;
    }
  },

  /**
   * Get transaction history for a user
   * @param {number} userId - User ID
   * @param {number} limit - Maximum number of transactions
   * @param {number} offset - Pagination offset
   * @returns {Promise} Transaction history
   */
  getTransactions: async (userId, limit = 50, offset = 0) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/credits/transactions`, {
        params: {
          user_id: userId,
          limit,
          offset
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw error;
    }
  },

  /**
   * Get credit statistics for a user
   * @param {number} userId - User ID
   * @returns {Promise} Credit statistics
   */
  getStats: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/credits/stats`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get credit stats:', error);
      throw error;
    }
  },

  /**
   * Purchase credits (Future implementation)
   * @param {number} userId - User ID
   * @param {number} amount - Amount of credits to purchase
   * @param {string} paymentMethod - Payment method
   * @returns {Promise} Purchase result
   */
  purchaseCredits: async (userId, amount, paymentMethod) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/credits/purchase`, {
        user_id: userId,
        amount,
        payment_method: paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Failed to purchase credits:', error);
      throw error;
    }
  }
};

export default creditsService;
