"use client";

/**
 * API service for handling data operations
 */
class ApiService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  /**
   * Get authentication token
   * @returns {string|null} JWT token or null
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('checkmate_auth_token');
    }
    return null;
  }

  /**
   * Fetch data from API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise} - Promise resolving to response data
   */
  async fetchData(endpoint, options = {}) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        ...options
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `API error: ${response.status}`);
        }
        
        return data;
      } else if (options.responseType === 'blob') {
        // Handle blob response for file downloads
        const blob = await response.blob();
        return { status: 'success', data: blob };
      } else {
        // Handle non-JSON response
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`API returned non-JSON response. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  /**
   * Post data to API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to post
   * @returns {Promise} - Promise resolving to response data
   */
  async postData(endpoint, data) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || `API error: ${response.status}`);
        }
        
        return responseData;
      } else {
        // Handle non-JSON response
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`API returned non-JSON response. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  /**
   * Update data via API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Data to update
   * @returns {Promise} - Promise resolving to response data
   */
  async updateData(endpoint, data = {}) {
    try {
      // Ensure data is an object and has a notes property with a default value
      const safeData = { ...data };
      if (!safeData.notes) {
        safeData.notes = "System generated note";
      }
      
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(safeData)
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.message || `API error: ${response.status}`);
        }
        
        return responseData;
      } else {
        // Handle non-JSON response
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`API returned non-JSON response. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  /**
   * Delete data via API
   * @param {string} endpoint - API endpoint
   * @returns {Promise} - Promise resolving to response data
   */
  async deleteData(endpoint) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || `API error: ${response.status}`);
        }
        
        return data;
      } else {
        // Handle non-JSON response
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`API returned non-JSON response. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  }

  /**
   * Submit check-in data
   * @param {Object} checkInData - Check-in data
   * @returns {Promise} - Promise resolving to response data
   */
  async submitCheckIn(checkInData) {
    return this.postData('attendance/check-in', checkInData);
  }

  /**
   * Submit check-out data
   * @param {Object} checkOutData - Check-out data
   * @returns {Promise} - Promise resolving to response data
   */
  async submitCheckOut(checkOutData) {
    return this.postData('attendance/check-out', checkOutData);
  }

  /**
   * Get attendance history for a user
   * @param {string} userId - User ID
   * @returns {Promise} - Promise resolving to attendance history
   */
  async getAttendanceHistory(userId) {
    return this.fetchData(`attendance/history/${userId}`);
  }

  /**
   * Get application settings
   * @returns {Promise} - Promise resolving to settings data
   */
  async getSettings() {
    return this.fetchData('settings');
  }

  /**
   * Update application settings
   * @param {Object} settingsData - Settings data to update
   * @returns {Promise} - Promise resolving to updated settings
   */
  async updateSettings(settingsData) {
    return this.fetchData('settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData)
    });
  }

  /**
   * Upload organization logo
   * @param {string} logoUrl - URL of the logo image
   * @returns {Promise} - Promise resolving to updated logo data
   */
  async uploadLogo(logoUrl) {
    return this.postData('settings/logo', { logoUrl });
  }

  /**
   * Reset settings to defaults
   * @returns {Promise} - Promise resolving to default settings
   */
  async resetSettings() {
    return this.postData('settings/reset', {});
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
