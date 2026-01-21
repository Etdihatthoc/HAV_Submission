/**
 * API Configuration
 * Backend running on port 5050
 */

export const API_BASE_URL = 'https://aiotlab3-5050.fdn.li';

export const API_ENDPOINTS = {
  // Chat
  CHAT: '/api/v1/chat',
  
  // Diagnosis
  DIAGNOSE: '/api/v1/diagnose',
  DIAGNOSIS_DETAIL: (id) => `/api/v1/diagnose/${id}`,
  DIAGNOSIS_HISTORY: '/api/v1/diagnose/history',
  
  // Epidemic
  EPIDEMIC_ALERTS: '/api/v1/epidemic/alerts',
  EPIDEMIC_MAP: '/api/v1/epidemic/map',
  EPIDEMIC_STATS: '/api/v1/epidemic/stats',
  
  // Expert
  EXPERT_LOGIN: '/api/v1/auth/expert/login',
  EXPERT_PENDING: '/api/v1/expert/pending',
  EXPERT_REVIEW: (id) => `/api/v1/expert/review/${id}`,
  
  // Uploads (static files)
  UPLOADS: '/uploads',
};

export default API_BASE_URL;
