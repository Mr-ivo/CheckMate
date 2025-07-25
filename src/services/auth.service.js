"use client";

/**
 * Authentication service for handling login, logout, and token management
 */
class AuthService {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - Promise resolving to user data including token
   */
  async login(email, password) {
    try {
      // Log the API URL being used for debugging
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('Using API URL:', API_BASE);
      
      // Add credentials: 'include' for better cross-origin support
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in cross-origin requests
        body: JSON.stringify({ email, password })
      });

      // Enhanced error handling
      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON
          errorMessage = `Login failed (${response.status}: ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login response:', data); // For debugging
      
      if (data.data?.token) {
        // Store token in localStorage
        localStorage.setItem('checkmate_auth_token', data.data.token);
        
        // Store user data
        localStorage.setItem('checkmate_user', JSON.stringify(data.data.user));
        
        // Also store in sessionStorage as a backup (more reliable on some mobile browsers)
        sessionStorage.setItem('checkmate_auth_token', data.data.token);
        sessionStorage.setItem('checkmate_user', JSON.stringify(data.data.user));
      } else {
        console.error('No token received in login response');
      }
      
      return data.data;
    } catch (error) {
      console.error('Authentication error:', error);
      // More detailed error logging
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.error('Network error - API might be unreachable or blocked by CORS');
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('checkmate_auth_token');
    localStorage.removeItem('checkmate_user');
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} User data or null if not authenticated
   */
  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('checkmate_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('checkmate_auth_token');
    }
    return false;
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
   * Check if user has required role
   * @param {string|Array} requiredRole - Role or array of roles to check
   * @returns {boolean} True if user has required role
   */
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  }
}

// Create a singleton instance
const authService = new AuthService();

export default authService;
