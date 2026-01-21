/**
 * Chat Service
 * Handles chat and multimodal communication with AI
 */

import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const chatService = {
  /**
   * Send a chat message (text, image, audio, or combination)
   */
  async sendMessage({ mode, message, image, audio, farmerId, sessionId, location, weather }) {
    const formData = new FormData();

    // Append mode (chatbot or diagnosis)
    if (mode) {
      formData.append('mode', mode);
    }

    formData.append('message', message);
    
    if (image) {
      formData.append('image', image);
    }
    
    if (audio) {
      // Determine file extension based on MIME type
      let extension = 'webm'; // default
      if (audio.type.includes('ogg')) extension = 'ogg';
      else if (audio.type.includes('mp4')) extension = 'm4a';
      else if (audio.type.includes('wav')) extension = 'wav';

      // Create a new File object with proper filename and MIME type
      const audioFile = new File([audio], `recording-${Date.now()}.${extension}`, { type: audio.type });
      formData.append('audio', audioFile);
    }
    
    if (farmerId) {
      formData.append('farmer_id', farmerId);
    }
    
    if (sessionId) {
      formData.append('session_id', sessionId);
    }
    
    if (location) {
      if (location.latitude) formData.append('latitude', location.latitude);
      if (location.longitude) formData.append('longitude', location.longitude);
      if (location.province) formData.append('province', location.province);
      if (location.district) formData.append('district', location.district);
    }
    
    if (weather) {
      if (weather.temperature) formData.append('temperature', weather.temperature);
      if (weather.humidity) formData.append('humidity', weather.humidity);
    }

    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.CHAT}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
};

export default chatService;
