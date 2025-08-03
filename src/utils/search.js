/**
 * Search utility functions for CheckMate application
 */

/**
 * Search through a collection of items based on a query
 * @param {Array} items - Array of items to search through
 * @param {string} query - Search query
 * @param {Array} searchableFields - Fields to search within each item
 * @returns {Array} - Filtered items that match the query
 */
export const searchItems = (items, query, searchableFields) => {
  if (!query || !items?.length) return items;
  
  console.log('Search debug - Searching items:', { itemsCount: items.length, query, searchableFields });
  
  const lowercaseQuery = query.toLowerCase();
  
  const results = items.filter(item => {
    // Log sample items for debugging
    if (items.indexOf(item) < 3) {
      console.log('Search debug - Sample item:', { item, fields: searchableFields });
    }
    
    return searchableFields.some(field => {
      const fieldValue = getNestedProperty(item, field);
      
      // Log field values for debugging
      if (items.indexOf(item) < 3) {
        console.log(`Search debug - Field '${field}' value:`, fieldValue);
      }
      
      if (fieldValue === null || fieldValue === undefined) return false;
      
      // Handle dates specially
      if (fieldValue instanceof Date) {
        const dateStr = fieldValue.toLocaleDateString();
        return dateStr.toLowerCase().includes(lowercaseQuery);
      }
      
      // Convert to string and search
      const stringValue = String(fieldValue).toLowerCase();
      const matched = stringValue.includes(lowercaseQuery);
      
      // Log matches for debugging
      if (matched && items.indexOf(item) < 3) {
        console.log(`Search debug - MATCH FOUND in '${field}':`, { value: fieldValue, query: lowercaseQuery });
      }
      
      return matched;
    });
  });
  
  console.log('Search debug - Results count:', results.length);
  return results;
};

/**
 * Get a nested property from an object using dot notation
 * @param {Object} obj - The object to search in
 * @param {string} path - Path to the property, e.g. "user.name"
 * @returns {*} - The value of the property, or undefined if not found
 */
export const getNestedProperty = (obj, path) => {
  if (!obj || !path) return undefined;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  
  return current;
};

/**
 * Format search results for display
 * @param {Array} results - Search results
 * @param {string} query - Search query
 * @param {Object} displayConfig - Configuration for how to display each result type
 * @returns {Array} - Formatted results for display
 */
export const formatSearchResults = (results, query, displayConfig) => {
  return results.map(item => {
    const type = item.type || 'unknown';
    const config = displayConfig[type] || displayConfig.default;
    
    return {
      id: item.id || item._id,
      title: config.titleField ? getNestedProperty(item, config.titleField) : 'Untitled',
      description: config.descriptionField ? getNestedProperty(item, config.descriptionField) : '',
      icon: config.icon || 'search',
      url: config.generateUrl ? config.generateUrl(item) : '#',
      originalItem: item
    };
  });
};

/**
 * Search through multiple data sources
 * @param {Object} query - Search query
 * @param {Object} dataSources - Object containing arrays of different data types
 * @param {Object} searchConfig - Configuration for searchable fields in each data type
 * @returns {Object} - Results grouped by data type
 */
export const searchAllSources = (query, dataSources, searchConfig) => {
  if (!query) return {};
  
  const results = {};
  
  Object.keys(dataSources).forEach(sourceKey => {
    if (dataSources[sourceKey] && searchConfig[sourceKey]) {
      // Ensure the data source is an array
      const dataArray = Array.isArray(dataSources[sourceKey]) 
        ? dataSources[sourceKey] 
        : (dataSources[sourceKey]?.data || dataSources[sourceKey]?.records || []);
      
      // Perform search on the array
      const sourceResults = searchItems(
        dataArray, 
        query, 
        searchConfig[sourceKey].fields
      );
      
      // Ensure sourceResults is an array before mapping
      if (Array.isArray(sourceResults)) {
        // Add type to each result
        results[sourceKey] = sourceResults.map(item => ({
          ...item,
          type: sourceKey
        }));
      } else {
        console.error(`Search results for ${sourceKey} is not an array:`, sourceResults);
        results[sourceKey] = [];
      }
    }
  });
  
  return results;
};
