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
   * Upload logo file
   * @param {FormData} formData - Form data containing the logo file
   * @returns {Promise} - Promise resolving to response data
   */
  async uploadLogo(formData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Remove Content-Type header to let the browser set it with the boundary parameter
      const response = await fetch(`${this.baseUrl}/settings/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
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

  /**
   * Send email notification to absent intern
   * @param {Object} emailData - Email data containing intern info and date
   * @returns {Promise} - Promise resolving to email send result
   */
  async sendAbsenteeEmail(emailData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/email/absent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `API error: ${response.status}`);
        }
        return data;
      } else {
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
   * Send bulk email notifications to multiple absent interns
   * @param {Array} absentInterns - Array of absent intern data
   * @param {string} date - Date of absence
   * @returns {Promise} - Promise resolving to bulk email send results
   */
  async sendBulkAbsenteeEmails(absentInterns, date) {
    try {
      const emailData = {
        internData: absentInterns,
        date: date,
        type: 'bulk'
      };
      return await this.sendAbsenteeEmail(emailData);
    } catch (error) {
      console.error('Bulk email error:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   * @returns {Promise} - Promise resolving to email configuration test result
   */
  async testEmailConfiguration() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/email/absent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Email configuration test error:', error);
      throw error;
    }
  }

  /**
   * Get notifications for the authenticated user
   * @param {Object} params - Query parameters (page, limit, unreadOnly)
   * @returns {Promise} - Promise resolving to notifications data
   */
  async getNotifications(params = {}) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const queryParams = new URLSearchParams(params).toString();
      const url = `${this.baseUrl}/notifications${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise} - Promise resolving to updated notification
   */
  async markNotificationAsRead(notificationId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise} - Promise resolving to update result
   */
  async markAllNotificationsAsRead() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - ID of the notification to delete
   * @returns {Promise} - Promise resolving to deletion result
   */
  async deleteNotification(notificationId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Get all geofences
   * @returns {Promise} - Promise resolving to geofences data
   */
  async getGeofences() {
    return this.fetchData('geofences');
  }

  /**
   * Create a new geofence
   * @param {Object} geofenceData - Geofence data
   * @returns {Promise} - Promise resolving to created geofence
   */
  async createGeofence(geofenceData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/geofences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geofenceData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Create geofence error:', error);
      throw error;
    }
  }

  /**
   * Update a geofence
   * @param {string} geofenceId - ID of the geofence to update
   * @param {Object} geofenceData - Updated geofence data
   * @returns {Promise} - Promise resolving to updated geofence
   */
  async updateGeofence(geofenceId, geofenceData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/geofences/${geofenceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geofenceData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Update geofence error:', error);
      throw error;
    }
  }

  /**
   * Delete a geofence
   * @param {string} geofenceId - ID of the geofence to delete
   * @returns {Promise} - Promise resolving to deletion result
   */
  async deleteGeofence(geofenceId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/geofences/${geofenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Delete geofence error:', error);
      throw error;
    }
  }

  /**
   * Get audit logs
   * @param {Object} params - Query parameters (action, page, limit)
   * @returns {Promise} - Promise resolving to audit logs
   */
  async getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.fetchData(`audit-logs${queryString ? '?' + queryString : ''}`);
  }

  /**
   * Get user security status
   * @returns {Promise} - Promise resolving to users security data
   */
  async getUserSecurityStatus() {
    // For now, use the regular users endpoint
    // TODO: Backend needs to implement /users/security-status endpoint
    const response = await this.fetchData('users?limit=100');
    console.log('API Response:', response); // DEBUG
    // Backend returns: { status, count, total, pagination, data: { users } }
    return { users: response.data?.users || response.users || [] };
  }

  /**
   * Force logout a user from all sessions
   * @param {string} userId - ID of the user to logout
   * @returns {Promise} - Promise resolving to logout result
   */
  async forceLogoutUser(userId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/sessions/force-logout/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Force logout error:', error);
      throw error;
    }
  }

  /**
   * Validate user location against geofences
   * @param {Object} location - User location {latitude, longitude}
   * @returns {Promise} - Promise resolving to validation result
   */
  async validateLocation(location) {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No auth token for location validation');
        return { isValid: true, message: 'Location validation unavailable' };
      }

      const response = await fetch(`${this.baseUrl}/geofences/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(location)
      });

      // If no geofences configured (404), allow check-in
      if (response.status === 404) {
        console.info('No geofences configured - allowing check-in');
        return { isValid: true, message: 'No geofences configured' };
      }

      const data = await response.json();
      
      // If response is not ok but has a message, still return it
      if (!response.ok) {
        console.warn('Location validation failed:', data.message);
        return { isValid: false, message: data.message || 'Location validation failed' };
      }
      
      return data;
    } catch (error) {
      console.error('Location validation error:', error);
      // Return valid by default if validation fails (don't block check-in)
      return { isValid: true, message: 'Location validation unavailable' };
    }
  }

  /**
   * Get today's attendance for current user
   * @returns {Promise} - Promise resolving to today's attendance
   */
  async getTodayAttendance() {
    try {
      const user = JSON.parse(localStorage.getItem('checkmate_user'));
      const userId = user?._id || user?.id;
      if (!userId) {
        console.warn('No user ID found for attendance check');
        return { attendance: null };
      }
      
      // First get intern ID from user ID
      const internResponse = await this.fetchData(`interns/user/${userId}`);
      const internId = internResponse?.data?.intern?._id;
      
      if (!internId) {
        console.warn('No intern record found for user');
        return { attendance: null };
      }
      
      return this.fetchData(`attendance/intern/${internId}/today`);
    } catch (error) {
      console.error('Get today attendance error:', error);
      return { attendance: null };
    }
  }

  /**
   * Get recent attendance records for current user
   * @param {number} limit - Number of records to fetch
   * @returns {Promise} - Promise resolving to recent attendance
   */
  async getRecentAttendance(limit = 5) {
    try {
      const user = JSON.parse(localStorage.getItem('checkmate_user'));
      const userId = user?._id || user?.id;
      if (!userId) {
        console.warn('No user ID found for recent attendance');
        return { attendance: [] };
      }
      
      // First get intern ID from user ID
      const internResponse = await this.fetchData(`interns/user/${userId}`);
      const internId = internResponse?.data?.intern?._id;
      
      if (!internId) {
        console.warn('No intern record found for user');
        return { attendance: [] };
      }
      
      const response = await this.fetchData(`attendance/intern/${internId}`);
      // Return last N records
      const records = response.data?.attendance || response.attendance || [];
      return { attendance: records.slice(0, limit) };
    } catch (error) {
      console.error('Get recent attendance error:', error);
      return { attendance: [] };
    }
  }

  /**
   * Submit check-out
   * @param {Object} checkOutData - Check-out data
   * @returns {Promise} - Promise resolving to check-out result
   */
  async submitCheckOut(checkOutData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/attendance/check-out`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkOutData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Promise resolving to registration result
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Registration failed: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @returns {Promise} - Promise resolving to users list
   */
  async getAllUsers() {
    return this.fetchData('users?limit=1000');
  }

  /**
   * Approve a pending user
   * @param {string} userId - ID of the user to approve
   * @returns {Promise} - Promise resolving to approval result
   */
  async approveUser(userId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Approval failed: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Approve user error:', error);
      throw error;
    }
  }

  /**
   * Reject a pending user
   * @param {string} userId - ID of the user to reject
   * @returns {Promise} - Promise resolving to rejection result
   */
  async rejectUser(userId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Rejection failed: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Reject user error:', error);
      throw error;
    }
  }

  /**
   * Deactivate a user
   * @param {string} userId - ID of the user to deactivate
   * @returns {Promise} - Promise resolving to deactivation result
   */
  async deactivateUser(userId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/users/${userId}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Deactivation failed: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  }

  /**
   * Activate a user
   * @param {string} userId - ID of the user to activate
   * @returns {Promise} - Promise resolving to activation result
   */
  async activateUser(userId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${this.baseUrl}/users/${userId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Activation failed: ${response.status}`);
      }
      return data;
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
