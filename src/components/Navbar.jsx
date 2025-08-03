"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Bell, ChevronRight, Search, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { searchAllSources } from '@/utils/search';
import SearchResults from './SearchResults';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // Don't initialize useApi without an endpoint - we'll use direct fetch calls instead
  // This prevents the 404 errors to /api/undefined

  // Search configuration - define which fields to search in each data type
  const searchConfig = {
    interns: {
      // Search in user name, email, and other intern fields
      fields: ['userId.name', 'userId.email', 'internId', 'department', 'status', 'supervisor.name', 'name', 'email']
    },
    attendance: {
      fields: ['status', 'date', 'internId.userId.name', 'internId.userId.email', 'internId.internId', 'internName']
    }
  };

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults({});
        if (searchQuery.length === 0) {
          setShowSearchResults(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search function
  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) return;

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Fetch data from APIs using direct API calls since fetchData doesn't take parameters
      // We need to make these calls directly
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
          ? 'https://checkmate-backend-fm9d.onrender.com/api'
          : 'http://localhost:5000/api');
          
      const getAuthToken = () => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('checkmate_auth_token');
        }  
        return null;
      };
      
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      
      const [internsResponse, attendanceResponse] = await Promise.all([
        fetch(`${API_BASE}/interns`, { headers }).then(res => res.json()),
        fetch(`${API_BASE}/attendance`, { headers }).then(res => res.json())
      ]);
      
      console.log('INTERN SEARCH DEBUG - Raw API responses:', { 
        interns: internsResponse, 
        attendance: attendanceResponse 
      });
      


      // Process the intern data to ensure name fields are accessible
      // Debug the API response structure
      console.log('INTERN SEARCH DEBUG - Raw API response:', internsResponse);
      console.log('INTERN SEARCH DEBUG - Response structure:', {
        hasData: !!internsResponse?.data,
        dataType: typeof internsResponse?.data,
        hasInterns: !!internsResponse?.data?.interns,
        internsType: typeof internsResponse?.data?.interns,
        isArray: Array.isArray(internsResponse?.data?.interns)
      });
      
      // The API returns { data: { interns: [...] } }
      let internsDataRaw = [];
      if (Array.isArray(internsResponse?.data?.interns)) {
        internsDataRaw = internsResponse.data.interns;
      } else if (Array.isArray(internsResponse?.data)) {
        internsDataRaw = internsResponse.data;
      } else if (Array.isArray(internsResponse)) {
        internsDataRaw = internsResponse;
      } else if (internsResponse?.data?.interns && typeof internsResponse.data.interns === 'object') {
        // If it's an object, try to convert to array
        internsDataRaw = Object.values(internsResponse.data.interns);
      }
      
      console.log('INTERN SEARCH DEBUG - Processed internsDataRaw:', {
        length: internsDataRaw.length,
        type: typeof internsDataRaw,
        isArray: Array.isArray(internsDataRaw),
        sample: internsDataRaw[0]
      });
      
      // Then map over the array safely - no need to flatten since we're using nested paths
      const internsData = Array.isArray(internsDataRaw) ? internsDataRaw.map(intern => {
        if (!intern) return {};
        
        // Return the intern object as-is since we're using nested property paths
        return intern;
      }) : [];

      // Process attendance data with similar debugging
      console.log('ATTENDANCE SEARCH DEBUG - Raw API response:', attendanceResponse);
      
      let attendanceData = [];
      if (Array.isArray(attendanceResponse?.data?.records)) {
        attendanceData = attendanceResponse.data.records;
      } else if (Array.isArray(attendanceResponse?.records)) {
        attendanceData = attendanceResponse.records;
      } else if (Array.isArray(attendanceResponse?.data)) {
        attendanceData = attendanceResponse.data;
      } else if (Array.isArray(attendanceResponse)) {
        attendanceData = attendanceResponse;
      }
      
      console.log('ATTENDANCE SEARCH DEBUG - Processed attendanceData:', {
        length: attendanceData.length,
        type: typeof attendanceData,
        isArray: Array.isArray(attendanceData),
        sample: attendanceData[0]
      });

      const dataSources = {
        interns: internsData,
        attendance: attendanceData
      };
      
      console.log('Search debug - Data sources for search:', {
        internsCount: dataSources.interns?.length || 0,
        attendanceCount: dataSources.attendance?.length || 0,
        sampleIntern: dataSources.interns?.[0],
        sampleAttendance: dataSources.attendance?.[0]
      });

      // Perform the search across all data sources
      const results = searchAllSources(query, dataSources, searchConfig);
      console.log('Search debug - Search query:', query);
      console.log('Search debug - Search config:', searchConfig);
      console.log('Search debug - Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({});
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For form submission, we'll navigate to a dedicated search page
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchRef]);

  // Handle click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationRef]);

  // Handle click outside to close profile menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuRef]);

  // Mock notifications
  const notifications = [
    { id: 1, text: "New intern joined the Mobile Development team", time: "5 minutes ago", read: false },
    { id: 2, text: "Marketing department meeting at 2:00 PM", time: "1 hour ago", read: false },
    { id: 3, text: "Attendance report ready for review", time: "3 hours ago", read: true },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 w-full z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section - Logo only */}
          <div className="flex items-center -ml-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image 
                  src="/checkmate-logo.png" 
                  alt="CheckMate Logo" 
                  width={400} 
                  height={400} 
                  className="h-48 w-auto" 
                />
              </div>
            </Link>
          </div>
          
          {/* Center section - Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-2 lg:mx-4 items-center -ml-8" ref={searchRef}>
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                placeholder="Search interns, attendance..."
                className="block w-full pl-10 pr-12 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/70 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200 shadow-sm"
                aria-label="Search"
                autoComplete="off"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-500 mr-1"></div>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center rounded px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 mr-1">
                    ⌘K
                  </kbd>
                )}
                <button 
                  type="submit" 
                  className="p-0.5 rounded-md text-gray-400 hover:text-emerald-500 dark:text-gray-500 dark:hover:text-emerald-400 focus:outline-none"
                  aria-label="Submit search"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              
              {/* Search results dropdown */}
              {showSearchResults && (
                <SearchResults 
                  results={searchResults} 
                  isLoading={isSearching} 
                  onResultClick={() => setShowSearchResults(false)}
                />
              )}
            </div>
          </form>
          
          {/* Right section - User actions */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none relative"
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div 
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">Mark all as read</span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notification.read ? '' : 'bg-blue-50 dark:bg-gray-700/60'}`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              {notification.read ? null : <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm text-gray-800 dark:text-gray-200">{notification.text}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No new notifications
                      </div>
                    )}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link href="/notifications" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white focus:outline-none"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Profile menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                className="p-1 rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label="User menu"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  <User size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
              </button>
              
              {/* Profile Dropdown */}
              {showProfileMenu && (
                <motion.div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin User</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">admin@example.com</p>
                  </div>
                  
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Your Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Settings
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Sign out
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
