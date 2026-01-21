/**
 * Auth Service
 * Handles authentication API calls
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const authService = {
  /**
   * Login with phone and password
   */
  async login(phone, password) {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/login`,
      { phone, password }
    );
    return response.data;
  },

  /**
   * Register new user
   */
  async signup(userData) {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/signup`,
      userData
    );
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  /**
   * Logout (client-side only)
   */
  logout() {
    localStorage.removeItem('auth_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem('auth_token');
  }
};

export default authService;
