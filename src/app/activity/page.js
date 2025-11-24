"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Layout components
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { TableRowSkeleton } from "@/components/SkeletonLoader";
import DateRangeFilter from "@/components/DateRangeFilter";
import { useTheme } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Protect the Activity page route
export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <AllActivity />
    </ProtectedRoute>
  );
}

// Main Activity component
function AllActivity() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [allActivity, setAllActivity] = useState([]);
  const [filteredActivity, setFilteredActivity] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Default to last 30 days
    endDate: new Date()
  });
  const [userRole, setUserRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // API service
  const apiService = {
    fetchData: async (endpoint) => {
      try {
        // Get auth token for authenticated requests
        const token = localStorage.getItem('checkmate_auth_token');
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        throw err;
      }
    }
  };

  // Fetch all activity data
  const fetchAllActivity = async () => {
    try {
      setIsLoading(true);
      
      // Get user role from localStorage
      const storedRole = localStorage.getItem('checkmate_user_role');
      setUserRole(storedRole);
      
      // Fetch all attendance records
      const attendanceResponse = await apiService.fetchData('attendance');
      
      if (attendanceResponse.status === 'success' && attendanceResponse.data && attendanceResponse.data.records) {
        // Process and format the activity data
        const activityData = attendanceResponse.data.records.map(record => {
          // Extract intern name from the record
          let internName = 'Unknown';
          if (record.internId && record.internId.userId && record.internId.userId.name) {
            internName = record.internId.userId.name;
          } else if (record.internName) {
            internName = record.internName;
          }
          
          return {
            id: record._id,
            name: internName,
            action: record.checkOutTime ? 'checked out at' : 'checked in at',
            checkInTime: record.checkInTime ? new Date(record.checkInTime) : null,
            checkOutTime: record.checkOutTime ? new Date(record.checkOutTime) : null,
            time: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(record.checkInTime).toLocaleDateString(),
            status: record.status,
            fullRecord: record
          };
        });
        
        // Sort by date (newest first)
        activityData.sort((a, b) => b.checkInTime - a.checkInTime);
        
        setAllActivity(activityData);
        applyFilters(activityData, dateRange, filterStatus);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setIsLoading(false);
    }
  };
  
  // Apply filters to activity data
  const applyFilters = (data, dates, status) => {
    let filtered = [...data];
    
    // Apply date range filter
    if (dates.startDate && dates.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.checkInTime);
        return itemDate >= dates.startDate && itemDate <= new Date(dates.endDate.setHours(23, 59, 59, 999));
      });
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    setFilteredActivity(filtered);
  };
  
  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    applyFilters(allActivity, newRange, filterStatus);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setFilterStatus(newStatus);
    applyFilters(allActivity, dateRange, newStatus);
  };

  // Fetch data when component mounts
  useEffect(() => {
    // Only fetch data if user is authenticated
    const token = localStorage.getItem('checkmate_auth_token');
    if (token) {
      fetchAllActivity();
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <ErrorBoundary>
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-6 flex items-center justify-between"
          >
            <div>
              <Link href="/dashboard" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-2">
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">All Activity</h1>
              <p className="text-gray-600">View and filter all attendance records</p>
            </div>
          </motion.div>
          
          {/* Filters */}
          <motion.div 
            variants={itemVariants}
            className="mb-6 bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center gap-4"
          >
            <div className="flex-1">
              <DateRangeFilter 
                startDate={dateRange.startDate} 
                endDate={dateRange.endDate} 
                onChange={handleDateRangeChange}
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={handleStatusFilterChange}
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused</option>
              </select>
            </div>
          </motion.div>
          
          {/* Activity List */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
              <Clock className="text-emerald-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Activity Records</h3>
              <span className="ml-2 text-sm text-gray-500">
                {filteredActivity.length} records found
              </span>
            </div>
            
            {isLoading ? (
              <div className="p-6">
                {[...Array(5)].map((_, i) => (
                  <TableRowSkeleton key={i} columns={5} />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivity.length > 0 ? (
                      filteredActivity.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                                {item.name ? item.name.split(' ').map(n => n[0]).join('') : '?'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.checkInTime ? item.checkInTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.checkOutTime ? item.checkOutTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.status === 'present' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Present</span>
                            )}
                            {item.status === 'late' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Late</span>
                            )}
                            {item.status === 'absent' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Absent</span>
                            )}
                            {item.status === 'excused' && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Excused</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No activity records found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
    </ErrorBoundary>
  );
}

