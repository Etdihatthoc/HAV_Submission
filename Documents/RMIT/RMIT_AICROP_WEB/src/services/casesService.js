/**
 * Cases Service - API calls for diagnosis case management
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const casesService = {
  /**
   * Start a new diagnosis case
   * @param {number} userId - User ID
   * @param {string} caseType - Case type: "daily_logging", "inquiry", "deep_analysis"
   * @param {string} sessionId - Optional chat session ID
   * @returns {Promise} Created case data
   */
  startCase: async (userId, caseType, sessionId = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/cases/start`, {
        user_id: userId,
        case_type: caseType,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Failed to start case:', error);
      throw error;
    }
  },

  /**
   * Get active cases for a user
   * @param {number} userId - User ID
   * @param {string} caseType - Optional case type filter
   * @returns {Promise} Active cases
   */
  getActiveCases: async (userId, caseType = null) => {
    try {
      const params = { user_id: userId };
      if (caseType) {
        params.case_type = caseType;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/cases/active`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get active cases:', error);
      throw error;
    }
  },

  /**
   * Get case details by ID
   * @param {number} caseId - Case ID
   * @returns {Promise} Case details
   */
  getCaseDetails: async (caseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/cases/${caseId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get case details:', error);
      throw error;
    }
  },

  /**
   * Complete a case
   * @param {number} caseId - Case ID
   * @returns {Promise} Updated case
   */
  completeCase: async (caseId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/cases/${caseId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Failed to complete case:', error);
      throw error;
    }
  },

  /**
   * Cancel a case
   * @param {number} caseId - Case ID
   * @returns {Promise} Success message
   */
  cancelCase: async (caseId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/cases/${caseId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel case:', error);
      throw error;
    }
  },

  /**
   * Get all cases for a user
   * @param {number} userId - User ID
   * @param {string} status - Optional status filter
   * @param {number} limit - Maximum number of cases
   * @param {number} offset - Pagination offset
   * @returns {Promise} User cases
   */
  getUserCases: async (userId, status = null, limit = 50, offset = 0) => {
    try {
      const params = { limit, offset };
      if (status) {
        params.status = status;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/cases/user/${userId}`, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user cases:', error);
      throw error;
    }
  }
};

export default casesService;
