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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      if (data.data?.token) {
        // Store token in localStorage
        localStorage.setItem('checkmate_auth_token', data.data.token);
        
        // Store user data
        localStorage.setItem('checkmate_user', JSON.stringify(data.data.user));
      }
      
      return data.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('checkmate_auth_token');
    localStorage.removeItem('checkmate_user');
    // Optionally call the backend logout endpoint
    // fetch('http://localhost:5000/api/auth/logout', {...})
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
