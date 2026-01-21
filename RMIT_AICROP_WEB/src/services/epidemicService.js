/**
 * Epidemic Service
 * Handles epidemic alerts and map data
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const epidemicService = {
  /**
   * Get active epidemic alerts
   */
  async getAlerts({ province, district, disease, days } = {}) {
    const params = {};
    if (province) params.province = province;
    if (district) params.district = district;
    if (disease) params.disease = disease;
    if (days) params.days = days;

    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.EPIDEMIC_ALERTS}`,
      { params }
    );

    return response.data;
  },

  /**
   * Get heatmap data for map visualization
   */
  async getHeatmapData({ province, district, disease, days = 30 } = {}) {
    const params = {};
    if (province) params.province = province;
    if (district) params.district = district;
    if (disease) params.disease = disease;
    if (days) params.days = days;

    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.EPIDEMIC_MAP}`,
      { params }
    );

    return response.data;
  },

  /**
   * Get epidemic statistics
   */
  async getStats() {
    const response = await axios.get(
      `${API_BASE_URL}${API_ENDPOINTS.EPIDEMIC_STATS}`
    );

    return response.data;
  },
};

export default epidemicService;
