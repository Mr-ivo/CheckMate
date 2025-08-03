"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API interactions with optimistic updates
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @returns {Object} API methods and state
 */
export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optimisticData, setOptimisticData] = useState(null);
  
  // Helper to get the JWT token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('checkmate_auth_token');
    }  
    return null;
  };

  // Base API URL - connect to our backend server
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://checkmate-backend-fm9d.onrender.com/api'
      : 'http://localhost:5000/api');
  
  // Set to false to use real backend API
  const MOCK_ENABLED = false;
  const MOCK_DELAY = 600; // milliseconds to simulate network when mocking
  
  // Mock data store (simulates backend)
  const mockDataStore = {
    interns: [],
    attendance: [],
    departments: [],
    // Add other resources as needed
  };

  // Function to simulate API delay
  const mockApiDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (MOCK_ENABLED) {
        await mockApiDelay();
        
        // Return mock data based on endpoint
        const resourceType = endpoint.split('/')[0];
        setData(mockDataStore[resourceType] || []);
      } else {
        // Get auth token for authenticated requests
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
          },
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      setError(err.message);
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options.headers]);

  /**
   * Create a new resource
   * @param {Object} itemData - Data for the new resource
   * @returns {Promise} Promise resolving to created resource
   */
  const createItem = async (itemData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimistic = { ...itemData, id: tempId, _isOptimistic: true };
      
      setOptimisticData(prev => 
        Array.isArray(prev || data) 
          ? [...(prev || data), optimistic]
          : optimistic
      );
      
      if (MOCK_ENABLED) {
        await mockApiDelay();
        
        // Add to mock store with a real ID
        const realId = `real-${Date.now()}`;
        const newItem = { ...itemData, id: realId };
        
        const resourceType = endpoint.split('/')[0];
        mockDataStore[resourceType] = [...(mockDataStore[resourceType] || []), newItem];
        
        setData(prev => {
          if (Array.isArray(prev)) {
            return prev.map(item => item.id === tempId ? newItem : item);
          }
          return newItem;
        });
        
        return newItem;
      } else {
        // Get auth token for authenticated requests
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
          },
          body: JSON.stringify(itemData),
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const createdItem = await response.json();
        
        // Update with real data
        setData(prev => {
          if (Array.isArray(prev)) {
            return prev.map(item => item.id === tempId ? createdItem : item);
          }
          return createdItem;
        });
        
        return createdItem;
      }
    } catch (err) {
      // Revert optimistic update
      setData(data);
      setError(err.message);
      console.error('API create error:', err);
      throw err;
    } finally {
      setLoading(false);
      setOptimisticData(null);
    }
  };

  /**
   * Update an existing resource
   * @param {string} id - ID of the resource to update
   * @param {Object} updates - Update data
   * @returns {Promise} Promise resolving to updated resource
   */
  const updateItem = async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      // Optimistic update
      const originalData = JSON.parse(JSON.stringify(data));
      
      setOptimisticData(
        Array.isArray(data)
          ? data.map(item => item.id === id ? { ...item, ...updates, _isOptimistic: true } : item)
          : { ...data, ...updates, _isOptimistic: true }
      );
      
      if (MOCK_ENABLED) {
        await mockApiDelay();
        
        const resourceType = endpoint.split('/')[0];
        
        if (Array.isArray(mockDataStore[resourceType])) {
          mockDataStore[resourceType] = mockDataStore[resourceType].map(item => 
            item.id === id ? { ...item, ...updates } : item
          );
          
          setData(mockDataStore[resourceType]);
          return mockDataStore[resourceType].find(item => item.id === id);
        }
        
        throw new Error('Resource not found');
      } else {
        // Get auth token for authenticated requests
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
          },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const updatedItem = await response.json();
        
        // Update with real data
        setData(prev => {
          if (Array.isArray(prev)) {
            return prev.map(item => item.id === id ? updatedItem : item);
          }
          return updatedItem;
        });
        
        return updatedItem;
      }
    } catch (err) {
      // Revert optimistic update
      setData(data);
      setError(err.message);
      console.error('API update error:', err);
      throw err;
    } finally {
      setLoading(false);
      setOptimisticData(null);
    }
  };

  /**
   * Delete a resource
   * @param {string} id - ID of the resource to delete
   * @returns {Promise} Promise resolving when delete completes
   */
  const deleteItem = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      // Optimistic update
      const originalData = JSON.parse(JSON.stringify(data));
      
      setOptimisticData(
        Array.isArray(data)
          ? data.filter(item => item.id !== id)
          : null
      );
      
      if (MOCK_ENABLED) {
        await mockApiDelay();
        
        const resourceType = endpoint.split('/')[0];
        
        if (Array.isArray(mockDataStore[resourceType])) {
          mockDataStore[resourceType] = mockDataStore[resourceType].filter(item => item.id !== id);
          setData(mockDataStore[resourceType]);
          return { success: true };
        }
        
        throw new Error('Resource not found');
      } else {
        // Get auth token for authenticated requests
        const token = getAuthToken();
        
        const response = await fetch(`${API_BASE}/${endpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
          }
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Update local data
        setData(prev => {
          if (Array.isArray(prev)) {
            return prev.filter(item => item.id !== id);
          }
          return null;
        });
        
        return { success: true };
      }
    } catch (err) {
      // Revert optimistic update
      setData(data);
      setError(err.message);
      console.error('API delete error:', err);
      throw err;
    } finally {
      setLoading(false);
      setOptimisticData(null);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (options.fetchOnMount !== false) {
      fetchData();
    }
  }, [fetchData, options.fetchOnMount]);

  return {
    data: optimisticData || data,
    isLoading: loading,
    error,
    refetch: fetchData,
    create: createItem,
    update: updateItem,
    delete: deleteItem
  };
};

// Pre-configured hooks for common resources
export const useInterns = (options = {}) => useApi('interns', options);
export const useAttendance = (options = {}) => useApi('attendance', options);
export const useDepartments = (options = {}) => useApi('departments', options);
export const useNotifications = (options = {}) => useApi('notifications', options);

export default useApi;
