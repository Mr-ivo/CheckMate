"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  BarChart,
  Filter
} from "lucide-react";


import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CardSkeleton, ChartSkeleton, TableRowSkeleton } from "@/components/SkeletonLoader";
import DateRangeFilter from "@/components/DateRangeFilter";
import InternDashboard from "@/components/InternDashboard";
import { useTheme } from "@/context/ThemeContext";
import { AttendanceChart, WeeklyChart } from "@/components/DashboardCharts";




import { useApi } from "@/hooks/useApi";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Protect the Dashboard route
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

// Main Dashboard component
function Dashboard() {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false); // Start as false for faster initial render
  const [stats, setStats] = useState({
    totalStaff: 0,
    checkInRate: 0,
    absentToday: 0,
    lateArrivals: 0
  });
  
  // Import individual API hooks
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
    },
    
    postData: async (endpoint, data) => {
      try {
        // Get auth token for authenticated requests
        const token = localStorage.getItem('checkmate_auth_token');
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error(`Error posting to ${endpoint}:`, err);
        throw err;
      }
    }
  };
  
  // Check if user is logged in
  const [userRole, setUserRole] = useState(null);

  // Intern-specific data state
  const [internData, setInternData] = useState({
    checkInStatus: null, // 'checked-in', 'checked-out', 'not-checked-in'
    attendanceHistory: [],
    stats: {
      daysPresent: 0,
      daysLate: 0,
      daysAbsent: 0,
      checkInStreak: 0
    },
    weeklyAttendance: {
      percentage: 0,
      presentDays: 0,
      excusedDays: 0,
      lateDays: 0,
      absentDays: 0,
      totalDays: 7
    }
  });

  // Initialize chart and activity data state
  const [attendanceData, setAttendanceData] = useState({
    labels: ['Present', 'Absent', 'Late', 'Excused'],
    datasets: [
      {
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',  
          'rgba(239, 68, 68, 0.7)',   
          'rgba(234, 179, 8, 0.7)',   
          'rgba(16, 185, 129, 0.7)',  
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',     
          'rgba(239, 68, 68, 1)',     
          'rgba(234, 179, 8, 1)',     
          'rgba(16, 185, 129, 1)',    
        ],
        borderWidth: 1,
      },
    ],
  });

  const [weeklyData, setWeeklyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Attendance Rate (%)',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  });
  
  const [recentActivity, setRecentActivity] = useState([]);

  // Handler for check-in action
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });
  
  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      setActionMessage({ text: '', type: '' });
      
      // Get intern ID from localStorage
      const internId = localStorage.getItem('checkmate_user_id');
      if (!internId) {
        setActionMessage({ text: 'User ID not found. Please log out and log in again.', type: 'error' });
        return;
      }
      
      // Call the check-in endpoint
      const response = await apiService.postData('attendance/check-in', {
        internId,
        signature: 'Dashboard digital signature', 
      });
      
      if (response.status === 'success') {
        setActionMessage({ text: 'Successfully checked in!', type: 'success' });
        // Update intern data to reflect the new check-in status
        setInternData(prev => ({
          ...prev,
          checkInStatus: 'checked-in'
        }));
        
        // Refetch dashboard data to update all stats
        fetchDashboardData();
      } else {
        setActionMessage({ text: response.message || 'Error checking in', type: 'error' });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setActionMessage({ text: error.message || 'Failed to check in. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for check-out action
  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      setActionMessage({ text: '', type: '' });
      
      // Get intern ID from localStorage
      const internId = localStorage.getItem('checkmate_user_id');
      if (!internId) {
        setActionMessage({ text: 'User ID not found. Please log out and log in again.', type: 'error' });
        return;
      }
      
      // Call the check-out endpoint
      const response = await apiService.postData('attendance/check-out', {
        internId,
        signature: 'Dashboard digital signature', 
        location: 'Dashboard check-out'
      });
      
      if (response.status === 'success') {
        setActionMessage({ text: 'Successfully checked out!', type: 'success' });
        // Update intern data to reflect the new check-out status
        setInternData(prev => ({
          ...prev,
          checkInStatus: 'checked-out'
        }));
        
        // Refetch dashboard data to update all stats
        fetchDashboardData();
      } else {
        setActionMessage({ text: response.message || 'Error checking out', type: 'error' });
      }
    } catch (error) {
      console.error('Check-out error:', error);
      setActionMessage({ text: error.message || 'Failed to check out. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check user role on component mount
  useEffect(() => {
    const role = localStorage.getItem('checkmate_user_role');
    setUserRole(role);
  }, []);
  
  // Fetch dashboard data when component mounts or userRole changes
  useEffect(() => {
    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole]);

  // Define fetchDashboardData function outside of useEffect
  const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch today's attendance data (backend will handle authorization)
        let todayData = { data: [] };
        let statsData = { data: {} };
        let usersData = { data: [] };
        
        // Try to fetch admin data, backend will return 403 if not authorized
        try {
          todayData = await apiService.fetchData('attendance/today');
        } catch (error) {
          console.log('Not authorized for today attendance data');
        }
        
        try {
          statsData = await apiService.fetchData('attendance/stats');
        } catch (error) {
          console.log('Not authorized for stats data');
        }
        
        try {
          usersData = await apiService.fetchData('users');
        } catch (error) {
          console.log('Not authorized for users data');
        }
        
        // Fetch intern-specific data if user is an intern
        if (userRole === 'intern') {
          try {
            // Get user ID from localStorage
            const userId = localStorage.getItem('checkmate_user_id');
            if (userId) {
              // First, get the intern record for this user
              const userIntern = await apiService.fetchData(`interns/user/${userId}`);
              const internId = userIntern?.data?.intern?._id || userIntern?.data?._id;
              
              if (!internId) {
                console.warn('No intern record found for user');
                setInternData(null);
                return;
              }
              
              // Fetch intern's personal attendance data
              const internAttendanceData = await apiService.fetchData(`attendance/intern/${internId}`);
              
              // Check if the intern has checked in today
              const todayCheckIn = await apiService.fetchData(`attendance/intern/${internId}/today`);
              
              // Fetch weekly attendance percentage
              const weeklyAttendance = await apiService.fetchData(`attendance/weekly/${internId}`);
              
              setInternData({
                checkInStatus: todayCheckIn?.data?.status || 'not-checked-in',
                attendanceHistory: internAttendanceData?.data?.history || [],
                stats: {
                  daysPresent: internAttendanceData?.data?.stats?.present || 0,
                  daysLate: internAttendanceData?.data?.stats?.late || 0,
                  daysAbsent: internAttendanceData?.data?.stats?.absent || 0,
                  checkInStreak: internAttendanceData?.data?.stats?.streak || 0
                },
                weeklyAttendance: weeklyAttendance?.data ? {
                  percentage: weeklyAttendance.data.attendancePercentage || 0,
                  presentDays: weeklyAttendance.data.presentDays || 0,
                  excusedDays: weeklyAttendance.data.excusedDays || 0,
                  lateDays: weeklyAttendance.data.lateDays || 0,
                  absentDays: weeklyAttendance.data.absentDays || 0,
                  totalDays: weeklyAttendance.data.totalDays || 7
                } : {
                  percentage: 0,
                  presentDays: 0,
                  excusedDays: 0,
                  lateDays: 0,
                  absentDays: 0,
                  totalDays: 7
                }
              });
            }
          } catch (error) {
            console.error('Error fetching intern data:', error);
          }
        }
        
        // Update state with fetched data
        if (todayData && todayData.data && todayData.data.summary) {
          const summary = todayData.data.summary || {};
          
          setStats({
            totalStaff: summary.totalInterns || 0,
            checkInRate: parseFloat(summary.attendance) || 0,
            absentToday: summary.absent || 0,
            lateArrivals: summary.late || 0
          });
          
          // Update attendance chart data
          setAttendanceData({
            labels: ['Present', 'Absent', 'Late', 'Excused'],
            datasets: [
              {
                data: [
                  summary.present || 0, 
                  summary.absent || 0, 
                  summary.late || 0,
                  summary.excused || 0  
                ],
                backgroundColor: [
                  'rgba(34, 197, 94, 0.7)', 
                  'rgba(239, 68, 68, 0.7)',  
                  'rgba(234, 179, 8, 0.7)',   
                  'rgba(16, 185, 129, 0.7)',  
                ],
                borderColor: [
                  'rgba(34, 197, 94, 1)',    
                  'rgba(239, 68, 68, 1)',    
                  'rgba(234, 179, 8, 1)',   
                  'rgba(16, 185, 129, 1)',    
                ],
                borderWidth: 1,
              },
            ],
          });
          
          // Update recent activity with actual attendance records
          if (todayData.data.records && Array.isArray(todayData.data.records) && todayData.data.records.length > 0) {
            console.log('Dashboard records FULL DATA:', JSON.stringify(todayData.data.records, null, 2));
            
            const recentRecords = todayData.data.records
              .filter(record => record && record._id)
              .slice(0, 5)
              .map(record => {
              let internName = 'Unknown Intern';
              
              // Directly access the exact path used in the backend's getTodayAttendance function
              if (record.internId && typeof record.internId === 'object') {
                // Match the backend's nested population structure: internId -> userId -> name
                if (record.internId.userId && typeof record.internId.userId === 'object') {
                  if (record.internId.userId.name) {
                    internName = record.internId.userId.name;
                    console.log('✅ Found name in correct path: record.internId.userId.name =', internName);
                  }
                }
              }
              
              // Fallbacks only if the primary path isn't available
              if (internName === 'Unknown Intern') {
                if (record.internName) {
                  internName = record.internName;
                  console.log('Found fallback internName:', internName);
                } else if (record.intern && record.intern.userId && record.intern.userId.name) {
                  internName = record.intern.userId.name;
                  console.log('Found fallback in intern.userId.name:', internName);
                } else {
                  console.log('⚠️ Could not find intern name in record:', record);
                }
              }
              
              return {
                id: record._id,
                name: internName,
                action: record.checkOutTime ? 'checked out at' : 'checked in at',
                time: new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: record.status
              };
            });
            
            setRecentActivity(recentRecords);
          }
        }
        
        // Update weekly chart if stats data is available
        if (statsData && statsData.data && statsData.data.chartData) {
          const chartData = statsData.data.chartData;
          const weekData = processWeeklyData(chartData);
          setWeeklyData(weekData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setIsLoading(false);
      }
    };
    
  // Fetch data when component mounts if authenticated
  useEffect(() => {
    // Only fetch data if user is authenticated
    const token = localStorage.getItem('checkmate_auth_token');
    if (token) {
      fetchDashboardData();
    }
  }, [userRole]);
  
  // Helper function to process weekly data from API response
  const processWeeklyData = (chartData) => {
    // Get the last 5 days of data
    const lastFiveDays = chartData.slice(-5);
    
    return {
      labels: lastFiveDays.map(day => {
        const date = new Date(day.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: lastFiveDays.map(day => {
            const total = day.present + day.late + day.absent + day.excused;
            // Updated formula to include excused absences as positive attendance
            return total > 0 ? ((day.present + day.late + day.excused) / total * 100).toFixed(0) : 0;
          }),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  };


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

  const statCards = [
    {
      title: "Total Staff",
      value: stats.totalStaff,
      icon: <Users size={24} />,
      color: "bg-emerald-500",
      change: "+5% from last month"
    },
    {
      title: "Check-in Rate",
      value: `${stats.checkInRate}%`,
      icon: <ClipboardCheck size={24} />,
      color: "bg-green-500",
      change: "+4% from last month"
    },
    {
      title: "Absent Today",
      value: stats.absentToday,
      icon: <AlertCircle size={24} />,
      color: "bg-red-500",
      change: "-2% from last month"
    },
    {
      title: "Late Arrivals",
      value: stats.lateArrivals,
      icon: <TrendingUp size={24} />,
      color: "bg-purple-500",
      change: "+3% from last month"
    }
  ];

  // recentActivity is now managed via useState above

  // Show different dashboard based on role
  if (userRole === 'intern') {
    return (
      <ErrorBoundary>
        <DashboardLayout>
          <div className="pt-6 pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <InternDashboard />
            </div>
          </div>
        </DashboardLayout>
      </ErrorBoundary>
    );
  }

  // Admin/Supervisor Dashboard
  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="pt-6 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
          {/* Dashboard Header with Date Filter */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Overview of attendance and check-ins
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <DateRangeFilter 
                onDateRangeChange={(range) => console.log('Selected range:', range)} 
                className="w-full md:w-auto" 
              />
            </div>
          </div>

          {isLoading ? (
            // Enhanced loading state with skeleton components
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                {[...Array(5)].map((_, i) => (
                  <TableRowSkeleton key={i} columns={4} />
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="relative bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg border border-emerald-200 hover:scale-[1.03] transition-transform duration-200 group"
                  >
                    <div className="absolute -top-4 -right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-200">
                      {stat.icon}
                    </div>
                    <div className="p-6 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center p-3 rounded-full ${stat.color} bg-opacity-30 text-white shadow-md`}>
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 animate-pulse">{stat.value}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-500 mt-2">{stat.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <motion.div 
                  variants={itemVariants}
                  className="bg-white/80 p-8 rounded-2xl shadow-lg border border-emerald-200 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardCheck className="text-emerald-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
                  </div>
                  <div className="h-64">
                    <AttendanceChart 
                      isDarkMode={isDarkMode} 
                      chartData={attendanceData}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="bg-white/80 p-8 rounded-2xl shadow-lg border border-emerald-200 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart className="text-blue-500" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">Weekly Attendance</h3>
                  </div>
                  <div className="h-64">
                    <WeeklyChart 
                      isDarkMode={isDarkMode} 
                      chartData={weeklyData}
                    />
                  </div>
                </motion.div>
              </div>
              
              {/* Intern-specific section */}
              {userRole === 'intern' && (
                <motion.div
                  variants={itemVariants}
                  className="mb-10"
                >
                  <div className="bg-white/80 p-8 rounded-2xl shadow-lg border border-emerald-200">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">My Attendance Dashboard</h3>
                      <p className="text-gray-600">Your personal attendance statistics and check-in status</p>
                    </div>
                    
                    {/* Check-in status card */}
                    <div className={`p-6 rounded-xl mb-8 ${internData.checkInStatus === 'checked-in' ? 'bg-green-50 border border-green-200' : 
                      internData.checkInStatus === 'checked-out' ? 'bg-blue-50 border border-blue-200' : 
                      'bg-yellow-50 border border-yellow-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold mb-1 text-gray-900">Today's Status</h4>
                          {internData.checkInStatus === 'checked-in' && (
                            <p className="text-green-700">You've checked in today!</p>
                          )}
                          {internData.checkInStatus === 'checked-out' && (
                            <p className="text-blue-700">You've completed today's check-in/out.</p>
                          )}
                          {internData.checkInStatus === 'not-checked-in' && (
                            <p className="text-yellow-700">You haven't checked in yet today.</p>
                          )}
                          
                          {/* Action message feedback */}
                          {actionMessage.text && (
                            <div className={`mt-2 text-sm ${actionMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                              {actionMessage.text}
                            </div>
                          )}
                        </div>
                        <div>
                          {internData.checkInStatus === 'not-checked-in' && (
                            <button
                              onClick={handleCheckIn}
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? 'Processing...' : 'Check In Now'}
                            </button>
                          )}
                          {internData.checkInStatus === 'checked-in' && (
                            <button
                              onClick={handleCheckOut}
                              disabled={isSubmitting}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? 'Processing...' : 'Check Out'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Weekly Attendance Percentage */}
                    <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-100">
                      <h4 className="text-lg font-semibold mb-3 text-gray-900">Weekly Attendance</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Your attendance for the past 7 days</p>
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-3xl font-bold text-blue-600">
                                {internData.weeklyAttendance.percentage}%
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-600">Present: {internData.weeklyAttendance.presentDays}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span className="text-xs text-gray-600">Late: {internData.weeklyAttendance.lateDays}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-gray-600">Excused: {internData.weeklyAttendance.excusedDays}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-xs text-gray-600">Absent: {internData.weeklyAttendance.absentDays}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-24 h-24">
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-sm font-medium text-gray-700">7 days</div>
                            </div>
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="2"></circle>
                              <circle 
                                cx="18" 
                                cy="18" 
                                r="16" 
                                fill="none" 
                                className="stroke-blue-500" 
                                strokeWidth="2" 
                                strokeDasharray={`${internData.weeklyAttendance.percentage} 100`} 
                                strokeLinecap="round" 
                                transform="rotate(-90 18 18)"
                              ></circle>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Note: Attendance percentage includes both present days and excused absences.
                      </p>
                    </div>
                    
                    {/* Attendance stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <p className="text-sm text-gray-500">Days Present</p>
                        <p className="text-2xl font-bold text-emerald-600">{internData.stats.daysPresent}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <p className="text-sm text-gray-500">Days Late</p>
                        <p className="text-2xl font-bold text-yellow-600">{internData.stats.daysLate}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <p className="text-sm text-gray-500">Days Absent</p>
                        <p className="text-2xl font-bold text-red-600">{internData.stats.daysAbsent}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <p className="text-sm text-gray-500">Check-in Streak</p>
                        <p className="text-2xl font-bold text-blue-600">{internData.stats.checkInStreak}</p>
                      </div>
                    </div>
                    
                    {/* Recent attendance history */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-900">My Recent Attendance</h4>
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {internData.attendanceHistory.slice(0, 5).map((record, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  {record.status === 'present' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Present</span>
                                  )}
                                  {record.status === 'late' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Late</span>
                                  )}
                                  {record.status === 'absent' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Absent</span>
                                  )}
                                  {record.status === 'excused' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Excused</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {internData.attendanceHistory.length === 0 && (
                              <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                                  No attendance records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Recent Activity */}
              <motion.div 
                variants={itemVariants}
                className="bg-white/80 rounded-2xl shadow-lg border border-emerald-200 overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-emerald-100 flex items-center gap-2">
                  <Clock className="text-emerald-500" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivity.map((item, index) => (
                    <div key={index} className="px-8 py-5 flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                          {item.name ? item.name.split(' ').map(n => n[0]).join('') : '?'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">
                          <span className="font-semibold">{item.name}</span> {item.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.time}
                        </p>
                      </div>
                      <div>
                        {item.status === 'present' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Present</span>
                        )}
                        {item.status === 'late' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Late</span>
                        )}
                        {item.status === 'absent' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Absent</span>
                        )}
                        {item.status === 'excused' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Excused</span>
                        )}
                        {item.status === 'leave' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Leave</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 px-8 py-4">
                  <Link href="/activity" className="text-sm font-medium text-emerald-600 hover:text-blue-500">
                    View all activity →
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}




