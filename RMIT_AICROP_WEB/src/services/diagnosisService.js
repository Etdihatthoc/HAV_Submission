/**
 * Diagnosis Service
 * Handles disease diagnosis operations
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const diagnosisService = {
  /**
   * Create a new diagnosis
   */
  async createDiagnosis({ image, question, farmerId, location }) {
    const formData = new FormData();
    
    formData.append('image', image);
    
    if (question) {
      formData.append('question', question);
    }
    
    if (farmerId) {
      formData.append('farmer_id', farmerId);
    }
    
    if (location) {
      if (location.latitude) formData.append('latitude', location.latitude);
      if (location.longitude) formData.append('longitude', location.longitude);
      if (location.province) formData.append('province', location.province);
      if (location.district) formData.append('district', location.district);
    }

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.DIAGNOSE}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Get diagnosis details by ID
   */
  async getDiagnosisById(diagnosisId) {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.DIAGNOSIS_DETAIL(diagnosisId)}`
    );
    return response.data;
  },

  /**
   * Get diagnosis history
   */
  async getHistory({ farmerId, limit = 50 }) {
    const params = {};
    if (farmerId) params.farmer_id = farmerId;
    if (limit) params.limit = limit;

    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.DIAGNOSIS_HISTORY}`,
      { params }
    );

    return response.data;
  },
};

export default diagnosisService;
