/**
 * Expert Service
 * Handles expert authentication and review operations
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const expertService = {
  /**
   * Expert login
   */
  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.EXPERT_LOGIN}`,
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Save token to localStorage
    if (response.data.access_token) {
      localStorage.setItem('expert_token', response.data.access_token);
    }

    return response.data;
  },

  /**
   * Get pending cases for expert review
   */
  async getPendingCases() {
    const token = localStorage.getItem('expert_token');
    
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.EXPERT_PENDING}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  },

  /**
   * Review a diagnosis (confirm or correct)
   */
  async reviewDiagnosis(diagnosisId, action, expertComment, correctedDisease) {
    const token = localStorage.getItem('expert_token');
    
    const payload = {
      action,
      expert_comment: expertComment,
    };

    if (correctedDisease) {
      payload.corrected_disease = correctedDisease;
    }

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.EXPERT_REVIEW(diagnosisId)}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  },

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('expert_token');
  },

  /**
   * Check if expert is logged in
   */
  isAuthenticated() {
    return !!localStorage.getItem('expert_token');
  },
};

export default expertService;
