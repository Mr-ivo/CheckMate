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
      
      // Only store token if it exists (not present when 2FA is required)
      if (data.data?.token) {
        // Store token in localStorage
        localStorage.setItem('checkmate_auth_token', data.data.token);
        
        // Store user data
        localStorage.setItem('checkmate_user', JSON.stringify(data.data.user));
        
        // Also store in sessionStorage as a backup (more reliable on some mobile browsers)
        sessionStorage.setItem('checkmate_auth_token', data.data.token);
        sessionStorage.setItem('checkmate_user', JSON.stringify(data.data.user));
      }
      
      // Return full response (includes requires2FA flag)
      return data;
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

  // ============ 2FA METHODS ============

  /**
   * Send OTP code to email
   */
  async sendOTP(email) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE}/2fa/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    
    return await response.json();
  }

  /**
   * Complete login with 2FA code
   */
  async loginWith2FA(email, code, useBackupCode = false) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE}/auth/login-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, useBackupCode })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '2FA verification failed');
    }
    
    const data = await response.json();
    
    if (data.data?.token) {
      localStorage.setItem('checkmate_auth_token', data.data.token);
      localStorage.setItem('checkmate_user', JSON.stringify(data.data.user));
      if (data.data.refreshToken) {
        localStorage.setItem('checkmate_refresh_token', data.data.refreshToken);
      }
    }
    
    return data.data;
  }

  /**
   * Enable 2FA for current user
   */
  async enable2FA() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/2fa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enable 2FA');
    }
    
    return await response.json();
  }

  /**
   * Disable 2FA for current user
   */
  async disable2FA(password) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/2fa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to disable 2FA');
    }
    
    return await response.json();
  }

  /**
   * Get 2FA status
   */
  async get2FAStatus() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/2fa/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to get 2FA status');
    return await response.json();
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(password) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/2fa/regenerate-backup-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to regenerate codes');
    }
    
    return await response.json();
  }

  // ============ BIOMETRIC METHODS ============

  /**
   * Check if WebAuthn is supported
   */
  isWebAuthnSupported() {
    return typeof window !== 'undefined' && 
           window.PublicKeyCredential !== undefined &&
           navigator.credentials !== undefined;
  }

  /**
   * Get biometric registration options
   */
  async getBiometricRegistrationOptions() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/webauthn/register/options`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to get registration options');
    const data = await response.json();
    return data.data.options;
  }

  /**
   * Verify biometric registration
   */
  async verifyBiometricRegistration(credential, deviceName) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/webauthn/register/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ credential, deviceName })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return await response.json();
  }

  /**
   * Get biometric authentication options
   */
  async getBiometricAuthOptions(email) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    console.log('🔐 Getting biometric auth options for:', email);
    console.log('🔐 API URL:', `${API_BASE}/webauthn/auth/options`);
    
    const response = await fetch(`${API_BASE}/webauthn/auth/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    console.log('🔐 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Failed to get auth options:', errorData);
      throw new Error(errorData.message || 'Failed to get auth options');
    }
    
    const data = await response.json();
    console.log('✅ Got auth options:', data);
    return data.data.options;
  }

  /**
   * Verify biometric authentication
   */
  async verifyBiometricAuth(email, credential) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    console.log('🔐 Verifying biometric auth for:', email);
    console.log('🔐 Credential:', credential);
    
    const response = await fetch(`${API_BASE}/webauthn/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, credential })
    });
    
    console.log('🔐 Verify response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('❌ Verification failed:', error);
      throw new Error(error.message || 'Authentication failed');
    }
    
    const data = await response.json();
    console.log('✅ Verification successful:', data);
    
    if (data.data?.token) {
      localStorage.setItem('checkmate_auth_token', data.data.token);
      localStorage.setItem('checkmate_user', JSON.stringify(data.data.user));
      if (data.data.refreshToken) {
        localStorage.setItem('checkmate_refresh_token', data.data.refreshToken);
      }
    }
    
    return data.data;
  }

  /**
   * Get biometric credentials
   */
  async getBiometricCredentials() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/webauthn/credentials`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to get credentials');
    return await response.json();
  }

  /**
   * Delete biometric credential
   */
  async deleteBiometricCredential(credentialId) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/webauthn/credentials/${credentialId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to delete credential');
    return await response.json();
  }

  // ============ SESSION METHODS ============

  /**
   * Get active sessions
   */
  async getSessions() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to get sessions');
    return await response.json();
  }

  /**
   * Logout specific session
   */
  async logoutSession(sessionId) {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to logout session');
    return await response.json();
  }

  /**
   * Logout all other sessions
   */
  async logoutAllOtherSessions() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE}/sessions/logout-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Failed to logout sessions');
    return await response.json();
  }

  /**
   * Authenticate with biometric (for check-in)
   * Uses the current user's email from localStorage
   */
  async authenticateBiometric() {
    try {
      console.log('🔐 Starting biometric authentication for check-in');
      
      // Get current user email
      const user = this.getCurrentUser();
      if (!user || !user.email) {
        throw new Error('No user logged in');
      }
      
      console.log('🔐 User email:', user.email);
      
      // Import startAuthentication dynamically
      const { startAuthentication } = await import('@simplewebauthn/browser');
      
      // Step 1: Get authentication options
      const options = await this.getBiometricAuthOptions(user.email);
      
      // Step 2: Trigger biometric prompt
      console.log('🔐 Triggering biometric prompt...');
      const credential = await startAuthentication(options);
      
      // Step 3: Verify with server
      console.log('🔐 Verifying credential...');
      const result = await this.verifyBiometricAuth(user.email, credential);
      
      console.log('✅ Biometric authentication successful');
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Biometric authentication failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const refreshToken = localStorage.getItem('checkmate_refresh_token');
    
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await fetch(`${API_BASE}/sessions/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) throw new Error('Failed to refresh token');
    
    const data = await response.json();
    if (data.data?.token) {
      localStorage.setItem('checkmate_auth_token', data.data.token);
    }
    
    return data.data;
  }
}

// Create a singleton instance
const authService = new AuthService();

export default authService;
