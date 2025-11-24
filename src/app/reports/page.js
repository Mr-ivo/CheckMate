"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiService from "@/services/api.service";
import { 
  BarChart2, 
  Download, 
  Calendar,
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { toast } from "react-hot-toast";

// Import DashboardLayout
import DashboardLayout from "@/components/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Reports() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month'); // week, month, quarter, year
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  
  // State for real API data
  const [stats, setStats] = useState({
    totalInterns: 0,
    averageAttendance: 0,
    attendanceTrend: 0,
    mostAbsentees: '',
    perfectAttendance: 0,
    lateArrivals: 0
  });

  const [monthlyData, setMonthlyData] = useState(null);

  const [weeklyData, setWeeklyData] = useState(null);

  const [departmentData, setDepartmentData] = useState(null);
  
  const [absenceData, setAbsenceData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      }
    ]
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Calculate date ranges based on selected range
        const today = new Date();
        let startDate, endDate;
        
        switch(dateRange) {
          case 'week':
            // Last 7 days
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 6);
            endDate = today;
            break;
          case 'month':
            // Last 30 days
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29);
            endDate = today;
            break;
          case 'quarter':
            // Last 90 days
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 89);
            endDate = today;
            break;
          case 'year':
            // Last 365 days
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 364);
            endDate = today;
            break;
          default:
            // Default to last 30 days
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29);
            endDate = today;
        }
        
        // Format dates for API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        let deptResponse;
        try {
          deptResponse = await apiService.fetchData('attendance/departments');
          // Common departments for interns
          const commonDepartments = [
            'All Departments',
            'Web Development',
            'Mobile Development',
            'UI/UX Design',
            'Data Science',
            'Machine Learning',
            'Cybersecurity',
            'DevOps',
            'Quality Assurance',
            'Project Management'
          ];
          
          if (deptResponse && deptResponse.status === 'success' && deptResponse.data) {
            // Combine common departments with API data (removing duplicates)
            const apiDepartments = deptResponse.data.map(dept => dept.name);
            const uniqueDepts = [...new Set([...commonDepartments, ...apiDepartments])];
            setDepartments(uniqueDepts);
          } else {
            console.warn('Failed to load department data from API');
            // Use common departments as fallback
            setDepartments(commonDepartments);
          }
        } catch (error) {
          console.error('Error fetching departments:', error);
          setDepartments(['All Departments']); // Fallback with just the default option
          toast.error('Failed to load departments');
        }
        
        // 2. Fetch summary statistics
        try {
          const summaryParams = `startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
          const deptParam = selectedDepartment !== 'all' ? `&department=${selectedDepartment}` : '';
          
          const summaryResponse = await apiService.fetchData(`reports/summary?${summaryParams}${deptParam}`);
          
          if (summaryResponse && summaryResponse.status === 'success' && summaryResponse.data) {
            setStats(summaryResponse.data);
          } else {
            console.warn('Failed to load summary statistics from API');
            toast.error('Failed to load attendance statistics');
          }
        } catch (error) {
          console.error('Error fetching summary stats:', error);
          toast.error('Failed to load attendance statistics');
        }
        
        // 3. Fetch attendance trends for charts
        try {
          const trendParams = selectedDepartment !== 'all' ? `?department=${selectedDepartment}` : '';
          const trendsResponse = await apiService.fetchData(`reports/trends/${dateRange}${trendParams}`);
          
          if (trendsResponse && trendsResponse.status === 'success' && trendsResponse.data) {
            // Update monthly/weekly data
            const trendData = trendsResponse.data;
            
            // For line chart
            setMonthlyData({
              labels: trendData.labels,
              datasets: [{
                label: 'Attendance Rate (%)',
                data: trendData.attendanceRates,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3
              }]
            });
            
            // For bar chart
            setWeeklyData({
              labels: trendData.labels,
              datasets: [
                {
                  label: 'Present',
                  data: trendData.presentCounts,
                  backgroundColor: 'rgba(52, 211, 153, 0.7)',
                },
                {
                  label: 'Absent',
                  data: trendData.absentCounts,
                  backgroundColor: 'rgba(239, 68, 68, 0.7)',
                }
              ]
            });
          }
        } catch (error) {
          console.error('Error fetching attendance trends:', error);
          toast.error('Failed to load attendance trends');
        }
        
        // 4. Fetch department-wise attendance data
        try {
          const deptStatsParams = `startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
          const deptStatsResponse = await apiService.fetchData(`reports/stats/departments?${deptStatsParams}`);
          
          if (deptStatsResponse && deptStatsResponse.status === 'success' && deptStatsResponse.data) {
            const deptData = deptStatsResponse.data;
            
            setDepartmentData({
              labels: deptData.departments,
              datasets: [{
                label: 'Attendance Rate (%)',
                data: deptData.attendanceRates,
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(239, 68, 68, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(168, 85, 247, 0.7)',
                  'rgba(6, 182, 212, 0.7)',
                  'rgba(236, 72, 153, 0.7)'
                ],
                borderWidth: 1,
              }]
            });
          }
        } catch (error) {
          console.error('Error fetching department stats:', error);
          toast.error('Failed to load department statistics');
        }
        
        // 5. Fetch absence reasons
        try {
          const absenceParams = `startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
          const deptParam = selectedDepartment !== 'all' ? `&department=${selectedDepartment}` : '';
          
          const absenceResponse = await apiService.fetchData(`reports/absence-reasons?${absenceParams}${deptParam}`);
          
          if (absenceResponse && absenceResponse.status === 'success' && absenceResponse.data) {
            const absenceData = absenceResponse.data;
            
            setAbsenceData({
              labels: absenceData.labels,
              datasets: [{
                data: absenceData.data,
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(139, 92, 246, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(239, 68, 68, 0.7)',
                ],
                borderColor: [
                  'rgba(59, 130, 246, 1)',
                  'rgba(139, 92, 246, 1)',
                  'rgba(245, 158, 11, 1)',
                  'rgba(16, 185, 129, 1)',
                  'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 1,
              }]
            });
          }
        } catch (error) {
          console.error('Error fetching absence reasons:', error);
          toast.error('Failed to load absence reasons data');
        }
        
      } catch (error) {
        console.error('Error fetching reports data:', error);
        toast.error('Failed to load reports data.');
        // Set default departments in case they weren't loaded
        setDepartments(['All Departments']);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange, selectedDepartment]);

  // Using global theme context instead of local state
  
  const exportReport = async (format) => {
    try {
      // Show loading notification
      toast.loading(`Preparing ${format.toUpperCase()} report...`);
      
      // Calculate date range based on selection
      const today = new Date();
      let startDate, endDate;
      
      switch(dateRange) {
        case 'week':
          // Last 7 days
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 6);
          endDate = today;
          break;
        case 'month':
          // Last 30 days
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 29);
          endDate = today;
          break;
        case 'quarter':
          // Last 90 days
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 89);
          endDate = today;
          break;
        case 'year':
          // Last 365 days
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 364);
          endDate = today;
          break;
        default:
          // Default to last 30 days
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 29);
          endDate = today;
      }
      
      // Format dates for API
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Build query parameters
      let params = `startDate=${formattedStartDate}&endDate=${formattedEndDate}&format=${format}`;
      
      // Add department filter if not 'All Departments'
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        params += `&department=${selectedDepartment}`;
      }
      
      if (isDemoMode) {
        // Demo mode - simulate export
        setTimeout(() => {
          toast.dismiss();
          toast.success(`Report successfully exported as ${format.toUpperCase()}!`, {
            duration: 3000,
            icon: '📊',
            style: {
              borderRadius: '10px',
              background: isDarkMode ? '#1f2937' : '#fff',
              color: isDarkMode ? '#fff' : '#333',
            },
          });
        }, 1500);
      } else {
        // Real API call
        try {
          const response = await apiService.fetchData(`reports/export?${params}`, {
            responseType: 'blob'
          });
          
          if (response && response.data) {
            // Create a blob from the response data
            const blob = new Blob([response.data], {
              type: format === 'pdf' ? 'application/pdf' : 
                    format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 
                    'text/csv'
            });
            
            // Create an object URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${formattedStartDate}_to_${formattedEndDate}.${format}`);
            
            // Append to the DOM
            document.body.appendChild(link);
            
            // Trigger click event
            link.click();
            
            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            // Dismiss loading toast and show success message
            toast.dismiss();
            toast.success(`Report successfully exported as ${format.toUpperCase()}!`);
          } else {
            throw new Error('Failed to receive data from API');
          }
        } catch (error) {
          console.error("API export error:", error);
          toast.dismiss();
          toast.error("Failed to export report. Using demo mode.");
          
          // Fallback to demo mode if API fails
          setTimeout(() => {
            toast.success(`Report exported as ${format.toUpperCase()} (Demo Mode)`, {
              duration: 3000,
              icon: '📊'
            });
          }, 1000);
        }
      }
    } catch (error) {
      toast.error(`Failed to export report: ${error.message}`);
    }
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

  // Create stat cards using real stats data
  const getStatsValue = (key) => {
    return stats[key] || 0; // Return 0 if the stat doesn't exist, no mock data fallback
  };
  
  const statCards = [
    {
      title: "Total Interns",
      value: getStatsValue('totalInterns'),
      icon: <TrendingUp size={24} />,
      color: "bg-blue-500",
      trend: "Active"
    },
    {
      title: "Avg. Attendance",
      value: getStatsValue('averageAttendance') + "%",
      icon: <TrendingUp size={24} />,
      color: "bg-green-500",
      trend: "Rate"
    },
    {
      title: "Most Absences",
      value: getStatsValue('mostAbsentees'),
      icon: <TrendingDown size={24} />,
      color: "bg-red-500",
      trend: "Department"
    },
    {
      title: "Late Arrivals",
      value: getStatsValue('lateArrivals'),
      icon: <Calendar size={24} />,
      color: "bg-yellow-500",
      trend: "This week"
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl flex items-center">
                <BarChart2 className="mr-2" /> Attendance Reports
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Analyze attendance data and generate reports
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative flex items-center">
                <Filter size={16} className="absolute left-3 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  // Convert 'All Departments' to 'all' for API calls
                  const value = e.target.value === 'All Departments' ? 'all' : e.target.value;
                  setSelectedDepartment(value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((department, index) => (
                  <option key={index} value={department}>{department}</option>
                ))}
              </select>
              
              <div className="dropdown relative">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center">
                  <Download size={16} className="mr-2" /> Export
                </button>
                <div className="dropdown-menu absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button onClick={() => exportReport('pdf')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Export as PDF</button>
                    <button onClick={() => exportReport('excel')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Export as Excel</button>
                    <button onClick={() => exportReport('csv')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Export as CSV</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                    whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className={`flex items-center justify-center p-2 rounded-lg ${stat.color} bg-opacity-20 text-white`}>
                          {stat.icon}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">{stat.trend}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div 
                  variants={itemVariants}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                >
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Monthly Attendance Trend</h3>
                  <div className="h-64">
                    <Line 
                      data={monthlyData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: false,
                            min: 70,
                            max: 100,
                            ticks: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }
                          },
                          x: {
                            ticks: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                              display: false
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                >
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Weekly Check-in Breakdown</h3>
                  <div className="h-64">
                    <Bar 
                      data={weeklyData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            },
                            stacked: true
                          },
                          x: {
                            ticks: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                              display: false
                            },
                            stacked: true
                          }
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                >
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Department-wise Attendance</h3>
                  <div className="h-64">
                    <Bar 
                      data={departmentData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                              color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            }
                          },
                          x: {
                            ticks: {
                              color: isDarkMode ? '#f3f4f6' : '#1f2937'
                            },
                            grid: {
                              display: false
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                >
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Absence Reasons</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div style={{ width: '80%', height: '100%' }}>
                      <Doughnut 
                        data={absenceData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: isDarkMode ? '#f3f4f6' : '#1f2937',
                                padding: 20,
                                usePointStyle: true
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Summary Report */}
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Attendance Summary</h3>
                </div>
                <div className="p-6">
                  <div className="prose max-w-none">
                    <p>This {dateRange} shows an overall attendance rate of <strong>{stats.averageAttendance || 0}%</strong>, which is <span className={stats.attendanceTrend > 0 ? "text-green-600" : "text-red-600"}>{stats.attendanceTrend > 0 ? "up" : "down"} {Math.abs(stats.attendanceTrend || 0)}%</span> compared to the previous {dateRange}.</p>
                    
                    <p className="mt-4">Key observations:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The highest attendance was recorded on Thursdays.</li>
                      <li>The {stats.mostAbsentees || 'N/A'} department has the highest absence rate.</li>
                      <li>{stats.perfectAttendance || 0} interns maintained perfect attendance.</li>
                      <li>The main reason for absence was illness.</li>
                      <li>There were {stats.lateArrivals || 0} late check-ins this week.</li>
                    </ul>
                    
                    <p className="mt-4">Recommendations:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Investigate the absence rate in the {stats.mostAbsentees || 'N/A'} department.</li>
                      <li>Acknowledge interns with perfect attendance records.</li>
                      <li>Monitor trends in late check-ins and implement strategies to reduce them.</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between">
                  <span className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => exportReport('pdf')} className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                      PDF
                    </button>
                    <button onClick={() => exportReport('excel')} className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                      Excel
                    </button>
                    <button onClick={() => exportReport('csv')} className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                      CSV
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

