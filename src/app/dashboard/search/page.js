"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { searchAllSources } from '@/utils/search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { fetchData } = useApi();
  
  // Search configuration
  const searchConfig = {
    interns: {
      fields: ['name', 'user.name', 'email', 'user.email', 'supervisor', 'status']
    },
    attendance: {
      fields: ['status', 'date', 'intern.name', 'intern.user.name', 'internName']
    }
  };
  
  // Fetch data and perform search
  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch data from APIs
        const [internsResponse, attendanceResponse] = await Promise.all([
          fetchData('/interns'),
          fetchData('/attendance')
        ]);
        
        const dataSources = {
          interns: internsResponse?.data || [],
          attendance: attendanceResponse?.records || attendanceResponse?.data || []
        };
        
        // Perform the search
        const results = searchAllSources(query, dataSources, searchConfig);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({});
      } finally {
        setIsLoading(false);
      }
    }
    
    performSearch();
  }, [query, fetchData]);
  
  // Count total results
  const totalResults = Object.values(searchResults).reduce((total, items) => total + items.length, 0);
  
  // Get filtered results based on active tab
  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return searchResults;
    }
    
    return {
      [activeTab]: searchResults[activeTab] || []
    };
  };
  
  // Render result item based on its type
  const renderResultItem = (item, type) => {
    if (type === 'interns') {
      return (
        <Link 
          href={`/dashboard/interns/${item.id || item._id}`} 
          key={item.id || item._id}
          className="block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.name || (item.user && item.user.name) || 'Unknown Intern'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.email || (item.user && item.user.email) || ''}
              </p>
              <div className="mt-1 flex items-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  item.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {item.status || 'Unknown status'}
                </span>
                {item.supervisor && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    Supervisor: {item.supervisor}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      );
    } else if (type === 'attendance') {
      // Determine icon based on status
      let StatusIcon = Search;
      let statusColor = 'text-gray-400';
      let bgColor = 'bg-gray-100 dark:bg-gray-800';
      
      if (item.status === 'present') {
        StatusIcon = CheckCircle;
        statusColor = 'text-green-600 dark:text-green-400';
        bgColor = 'bg-green-100 dark:bg-green-900/30';
      } else if (item.status === 'absent') {
        StatusIcon = XCircle;
        statusColor = 'text-red-600 dark:text-red-400';
        bgColor = 'bg-red-100 dark:bg-red-900/30';
      } else if (item.status === 'late') {
        StatusIcon = Clock;
        statusColor = 'text-amber-600 dark:text-amber-400';
        bgColor = 'bg-amber-100 dark:bg-amber-900/30';
      } else if (item.status === 'excused') {
        StatusIcon = AlertCircle;
        statusColor = 'text-blue-600 dark:text-blue-400';
        bgColor = 'bg-blue-100 dark:bg-blue-900/30';
      }
      
      const date = new Date(item.date);
      const formattedDate = date.toLocaleDateString();
      const internName = item.internName || 
                        (item.intern && item.intern.name) || 
                        (item.intern && item.intern.user && item.intern.user.name) || 
                        'Unknown';
      
      return (
        <Link 
          href={`/dashboard/attendance?date=${formattedDate}`}
          key={item.id || item._id}
          className="block p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${bgColor} p-2 rounded-full`}>
              <StatusIcon size={20} className={statusColor} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {internName} - <span className="capitalize">{item.status}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formattedDate}
                {item.checkInTime && (
                  <span className="ml-2">
                    Check-in: {new Date(item.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
                {item.checkOutTime && (
                  <span className="ml-2">
                    Check-out: {new Date(item.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                )}
              </p>
            </div>
          </div>
        </Link>
      );
    }
    
    return null;
  };
  
  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Search Results for "{query}"
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Found {totalResults} results
            </p>
          </div>
          
          {/* Tabs for filtering */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
              >
                All Results ({totalResults})
              </button>
              <button
                onClick={() => setActiveTab('interns')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'interns'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
              >
                Interns ({searchResults.interns?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'attendance'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
              >
                Attendance ({searchResults.attendance?.length || 0})
              </button>
            </nav>
          </div>
          
          {/* Results */}
          <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Searching...</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-block rounded-full p-3 bg-gray-100 dark:bg-gray-800 mb-4">
                  <Search size={24} className="text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(getFilteredResults()).map(([type, items]) => (
                  items.map(item => renderResultItem(item, type))
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
