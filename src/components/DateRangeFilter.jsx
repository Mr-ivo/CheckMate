"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, Filter } from 'lucide-react';

const DateRangeFilter = ({ onFilterChange, initialRange = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [presetFilter, setPresetFilter] = useState('custom');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get date for 7 days ago
  const getLastWeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };
  
  // Get date for 30 days ago
  const getLastMonthDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };
  
  // Get first day of current month
  const getFirstDayOfMonth = () => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  };
  
  // Set initial dates
  useEffect(() => {
    if (initialRange) {
      setStartDate(initialRange.start);
      setEndDate(initialRange.end);
    } else {
      // Default to current month
      setStartDate(getFirstDayOfMonth());
      setEndDate(today);
      setPresetFilter('thisMonth');
    }
  }, []);

  // Apply filter based on preset selection
  const handlePresetChange = (preset) => {
    setPresetFilter(preset);
    
    switch (preset) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'lastWeek':
        setStartDate(getLastWeekDate());
        setEndDate(today);
        break;
      case 'lastMonth':
        setStartDate(getLastMonthDate());
        setEndDate(today);
        break;
      case 'thisMonth':
        setStartDate(getFirstDayOfMonth());
        setEndDate(today);
        break;
      case 'custom':
        // Keep current dates for custom
        break;
      default:
        break;
    }
  };
  
  // Handle date input changes
  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    setStartDate(newDate);
    setPresetFilter('custom');
  };
  
  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    setEndDate(newDate);
    setPresetFilter('custom');
  };
  
  // Apply filter
  const applyFilter = () => {
    if (startDate && endDate) {
      onFilterChange({ start: startDate, end: endDate });
      setIsOpen(false);
    }
  };
  
  // Reset filter
  const resetFilter = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(today);
    setPresetFilter('thisMonth');
    onFilterChange({ start: getFirstDayOfMonth(), end: today });
    setIsOpen(false);
  };
  
  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Get current filter description
  const getFilterDescription = () => {
    if (presetFilter !== 'custom') {
      switch (presetFilter) {
        case 'today':
          return 'Today';
        case 'lastWeek':
          return 'Last 7 days';
        case 'lastMonth':
          return 'Last 30 days';
        case 'thisMonth':
          return 'This month';
        default:
          return 'Custom range';
      }
    }
    
    return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
  };
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('date-range-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" id="date-range-dropdown">
      <button
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Calendar size={16} className="mr-2" />
        <span className="text-sm">{getFilterDescription()}</span>
        <ChevronDown size={14} className="ml-2" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 right-0 w-72 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-4">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <Filter size={16} className="mr-2" />
              Date Range
            </h3>
            
            <div className="space-y-3 mb-4">
              <button
                className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                  presetFilter === 'today' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'
                }`}
                onClick={() => handlePresetChange('today')}
              >
                Today
              </button>
              <button
                className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                  presetFilter === 'lastWeek' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'
                }`}
                onClick={() => handlePresetChange('lastWeek')}
              >
                Last 7 days
              </button>
              <button
                className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                  presetFilter === 'lastMonth' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'
                }`}
                onClick={() => handlePresetChange('lastMonth')}
              >
                Last 30 days
              </button>
              <button
                className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                  presetFilter === 'thisMonth' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'
                }`}
                onClick={() => handlePresetChange('thisMonth')}
              >
                This month
              </button>
              <button
                className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                  presetFilter === 'custom' ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-gray-100'
                }`}
                onClick={() => handlePresetChange('custom')}
              >
                Custom range
              </button>
            </div>
            
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                    value={startDate}
                    onChange={handleStartDateChange}
                    max={endDate || today}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900"
                    value={endDate}
                    onChange={handleEndDateChange}
                    min={startDate}
                    max={today}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={applyFilter}
                className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
              >
                Apply
              </button>
              <button
                onClick={resetFilter}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;

