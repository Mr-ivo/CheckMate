"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ClipboardCheck, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Clock,
  Download,
  HelpCircle,
  Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

// Layout components
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

// Services
import apiService from "@/services/api.service";
import authService from "@/services/auth.service";

// Help tooltip component
const InfoTooltip = ({ message }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block ml-2">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400 focus:outline-none"
      >
        <Info size={16} />
      </button>
      {showTooltip && (
        <div className="absolute z-10 w-64 p-3 text-sm text-left bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 -left-4 bottom-full mb-2">
          <div className="text-gray-700 dark:text-gray-300">{message}</div>
          <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 transform rotate-45 left-5 -bottom-1.5"></div>
        </div>
      )}
    </div>
  );
};

export default function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // 'today', 'week', 'month'
  const [selectedDepartment, setSelectedDepartment] = useState('Web Development');
  const [departments, setDepartments] = useState(['All Departments']);
  const [interns, setInterns] = useState([]);

  // Store intern lookup map for ID conversion
  const [internMap, setInternMap] = useState({});

  // Fetch departments and interns from backend
  useEffect(() => {
    const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch data from backend API
        // Try to fetch departments
        try {
          const departmentsResponse = await apiService.fetchData('attendance/departments');
          if (departmentsResponse && departmentsResponse.status === 'success' && departmentsResponse.data) {
            console.log('Department data from API:', departmentsResponse.data);
            
            // Extract department names directly from the response
            let deptNames = [];
            if (Array.isArray(departmentsResponse.data)) {
              // If it's an array of department objects with name property
              if (departmentsResponse.data[0] && departmentsResponse.data[0].name) {
                deptNames = departmentsResponse.data.map(dept => dept.name);
              } 
              // If it's an array of strings
              else if (typeof departmentsResponse.data[0] === 'string') {
                deptNames = departmentsResponse.data;
              }
              // Otherwise try to extract from first record's properties
              else if (departmentsResponse.data[0]) {
                deptNames = Object.values(departmentsResponse.data[0]);
              }
            }
            
            // Add "All Departments" as the first option, then add API-provided departments
            setDepartments(['All Departments', ...deptNames]);
          } else {
            console.warn('Department data not available or invalid format');
            // Just keep the default "All Departments"
          }
        } catch (deptError) {
          console.error('Failed to fetch departments:', deptError);
          toast.error('Error loading department data. Please refresh.')
        }
        
        // Try to fetch attendance data
        try {
          const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          const attendanceResponse = await apiService.fetchData(`attendance/date/${formattedDate}`);
          
          if (attendanceResponse && attendanceResponse.status === 'success' && attendanceResponse.data) {
            // Add detailed logging to identify data structure issues
            console.log('Raw attendance data:', attendanceResponse.data);
            
            // Map backend data to our format and build intern ID lookup map
            const lookupMap = {};
            const attendanceData = attendanceResponse.data.map(record => {
              // Log individual record for debugging
              console.log('Processing record:', record);
              
              // Store mapping between string internId and MongoDB _id
              if (record.internId && record._id) {
                lookupMap[record.internId._id || record.internId] = record._id;
              }
              
              // Extract department directly from the record, with fallbacks
              // Based on the logs, department is directly on the record, not nested in internId
              let department = 'Unassigned';
              if (record.department) {
                department = record.department;
              } else if (record.internId && typeof record.internId === 'object' && record.internId.department) {
                // Fallback to nested location if direct property doesn't exist
                department = record.internId.department;
              }
              
              // Based on console logs, record.internId is a string, not an object
              const mappedRecord = {
                id: record._id, // MongoDB _id for API operations
                mongoId: record._id, // Use record's _id as the mongo ID for API calls
                internId: typeof record.internId === 'string' ? record.internId : 
                         (record.internId && record.internId.internId) || 'N/A', // Handle string or object
                name: record.name || 'Unknown', // Name is directly on the record
                employeeId: typeof record.internId === 'string' ? record.internId : 
                           (record.internId && record.internId.internId) || 'N/A',
                department: department,
                status: record.status || '',
                checkInTime: record.checkInTime || null,
                checkOutTime: record.checkOutTime || null
              };
              
              // Log the mapped record
              console.log('Mapped to:', mappedRecord);
              
              return mappedRecord;
            });
            
            // Save lookup map for future API calls
            setInternMap(lookupMap);
            
            // Extract unique departments from attendance records
            // This ensures the dropdown has the actual departments used in records
            const uniqueDepartments = [...new Set(attendanceData.map(record => record.department).filter(Boolean))];
            if (uniqueDepartments.length > 0) {
              console.log('Extracted departments from records:', uniqueDepartments);
              setDepartments(['All Departments', ...uniqueDepartments]);
            }
            
            // Set interns array with data or empty array if no records found
            setInterns(attendanceData.length > 0 ? attendanceData : []);
            
            if (attendanceData.length === 0) {
              console.warn('No attendance records found for this date');
              toast.info('No attendance records found for this date.');
            }
          } else {
            console.warn('No attendance data available');
            setInterns([]);
            toast.error('Unable to load attendance data');
          }
        } catch (attendanceError) {
          console.error('Failed to fetch attendance data:', attendanceError.message);
          setInterns([]);
          toast.error('Failed to load attendance data. Please try again later.');
        }
      } catch (error) {
        console.error('Error in data fetching process:', error.message);
        // Set defaults when data can't be loaded
        setDepartments(['All Departments']);
        setInterns([]);
        toast.error('Failed to connect to the server. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentDate, selectedDepartment]); // Re-fetch when date or department changes

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDateChange = (amount) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'today') {
      newDate.setDate(newDate.getDate() + amount);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (amount * 7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + amount);
    }
    setCurrentDate(newDate);
  };

  const handleStatusChange = async (internId, newStatus) => {
    // Define the admin note upfront
    const adminNote = "Attendance marked by admin - no signature required";
    
    try {
      // Ensure first letter is capitalized to match backend validation requirements
      const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();
      
      // Find the intern in the current list and update UI immediately (optimistic update)
      const updatedInterns = interns.map(intern => {
        if (intern.id === internId) {
          return { ...intern, status: newStatus };
        }
        return intern;
      });
      setInterns(updatedInterns);
      
      // Get the target intern record
      const targetIntern = interns.find(intern => intern.id === internId);
      if (!targetIntern) {
        toast.error('Intern record not found');
        return;
      }
      
      // Use the MongoDB ID of the intern
      const targetMongoId = targetIntern.mongoId;
      
      // If we don't have a MongoDB ID, try fallback options
      if (!targetMongoId) {
        console.warn('MongoDB ID not found for intern. Attempting fallback...');
        console.log('Intern object:', targetIntern);
        
        if (targetIntern.internId && targetIntern.internId.match(/^[0-9a-f]{24}$/)) {
          // Use internId as fallback
          toast.warning('Using fallback ID method');
          try {
            const response = await apiService.updateData(`attendance/${targetIntern.internId}`, {
              status: capitalizedStatus,
              date: currentDate.toISOString().split('T')[0],
              notes: adminNote
            });
            
            if (response.status === 'success') {
              toast.success(`Marked ${capitalizedStatus}`);
            } else {
              toast.error('Failed to update: ' + (response.message || 'Unknown error'));
              setInterns(interns); // Revert to previous state
            }
          } catch (error) {
            console.error('Error in fallback update:', error);
            toast.error(error.message || 'Failed to update attendance');
            setInterns(interns); // Revert to previous state
          }
          return;
        } else {
          toast.error('Cannot determine intern database ID. Please refresh.');
          return;
        }
      }
      
      // Main update path using MongoDB ID
      try {
        console.log(`Updating attendance for intern with ID: ${targetMongoId}, status: ${capitalizedStatus}`);
        
        const response = await apiService.updateData(`attendance/${targetMongoId}`, {
          status: capitalizedStatus,
          date: currentDate.toISOString().split('T')[0],
          notes: adminNote
        });
        
        if (response.status === 'success') {
          toast.success(`Marked ${capitalizedStatus}`);
        } else {
          toast.error('Failed to update attendance status');
          setInterns(interns); // Revert to previous state
        }
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error(`Failed to update attendance status. Please try again.`);
        setInterns(interns); // Revert UI to previous state
      }
    } catch (error) {
      console.error('Error in status change handler:', error);
      toast.error('Failed to update attendance status');
      setInterns(interns); // Revert to previous state
    }
  };

  const handleBulkMarkPresent = async () => {
    try {
      setIsSaving(true);
      
      // Update UI immediately (optimistic update)
      const updatedInterns = interns.map(intern => ({
        ...intern,
        status: 'present'
      }));
      
      setInterns(updatedInterns);
      
      // Add a note that this was admin-marked attendance (no signature required)
      const attendanceNote = `Bulk attendance marked by admin - no signatures required`;
      
      // Send update to backend
      const formattedDate = currentDate.toISOString().split('T')[0];
      const response = await apiService.postData('attendance/bulk-update', {
        date: formattedDate,
        status: 'Present',
        department: selectedDepartment === 'All Departments' ? null : selectedDepartment,
        notes: attendanceNote
      });
      
      if (response.status === 'success') {
        toast.success('All interns marked as present');
      } else {
        toast.error('Failed to mark all as present');
        setInterns(interns); // Revert to previous state
      }
      
      setIsSaving(false);
    } catch (error) {
      console.error('Error in bulk mark present handler:', error);
      toast.error('Failed to mark all as present');
      setInterns(interns); // Revert UI
      setIsSaving(false);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      
      // Prepare data to send to backend
      const attendanceData = {
        date: currentDate.toISOString().split('T')[0],
        records: interns.map(intern => ({
          internId: intern.id,
          status: intern.status || 'Absent', // Default to absent if no status set
          checkInTime: intern.checkInTime || null,
          checkOutTime: intern.checkOutTime || null
        }))
      };
      
      try {
        // Send to backend
        const response = await apiService.postData('attendance/save', attendanceData);
        
        if (response.status === 'success') {
          toast.success('Attendance saved successfully');
        } else {
          toast.error('Failed to save attendance data');
        }
      } catch (error) {
        console.error('Error saving attendance:', error.message);
        toast.error('Failed to communicate with server. Please try again.');
      }
    } catch (error) {
      console.error('Error in save attendance handler:', error);
      toast.error('Failed to save attendance data');
    } finally {
      setIsSaving(false);
    }
  };

  const exportAttendanceReport = async () => {
    try {
      // Request export from backend
      try {
        // Prepare query params for the department filter
        const deptParam = selectedDepartment === 'All Departments' ? '' : `&department=${encodeURIComponent(selectedDepartment)}`;
        
        const response = await apiService.fetchData(`attendance/export?date=${currentDate.toISOString().split('T')[0]}${deptParam}`, {
          responseType: 'blob'
        });
        
        if (response.data) {
          // Create a download link for the exported file
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `attendance-report-${currentDate.toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          toast.success("Attendance report exported successfully");
        } else {
          throw new Error(response.message || 'Failed to export attendance report');
        }
      } catch (error) {
        console.error('Error exporting attendance report from API:', error.message);
        toast.error('Failed to export attendance report. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting attendance report:', error);
      toast.error(error.message || 'Failed to export attendance report');
    }
  };

  // Filter interns by the selected department with debug logging
  const filteredInterns = interns.filter(intern => {
    console.log(`Filtering intern: ${intern.name}, Department: ${intern.department}, Selected: ${selectedDepartment}`);
    // Check if it's "All Departments" or if the departments match (case insensitive)
    return selectedDepartment === 'All Departments' || 
           (intern.department && intern.department.toLowerCase() === selectedDepartment.toLowerCase());
  });
  
  // Log filtering results
  console.log(`Filtered ${filteredInterns.length} out of ${interns.length} interns for department: ${selectedDepartment}`);

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'excused': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <Check size={16} />;
      case 'absent': return <X size={16} />;
      case 'late': return <Clock size={16} />;
      case 'excused': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5">
          <div className="flex items-center mb-6">
            <ClipboardCheck className="h-6 w-6 text-emerald-500 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Attendance Management</h1>
            <InfoTooltip message="Signatures are only required during initial intern registration. Daily attendance can be managed by administrators without requiring interns to sign in each day." />
          </div>
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
            <div className="flex items-start">
              <HelpCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-emerald-700 dark:text-emerald-300">Admin-Managed Attendance</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  Once interns are registered with their signatures, you can mark their daily attendance as present, absent, late, or excused without requiring them to sign in each day.
                </p>
              </div>
            </div>
          </div>
          
          <div className="attendance-content">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loader"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Date and View Selector */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center mb-4 md:mb-0">
                      <button 
                        onClick={() => handleDateChange(-1)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <div className="mx-3 flex items-center">
                        <Calendar size={18} className="mr-2 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {formatDate(currentDate)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDateChange(1)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex">
                        <button
                          onClick={() => setViewMode('today')}
                          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                            viewMode === 'today' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setViewMode('week')}
                          className={`px-4 py-2 text-sm font-medium ${
                            viewMode === 'week' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Week
                        </button>
                        <button
                          onClick={() => setViewMode('month')}
                          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                            viewMode === 'month' 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Month
                        </button>
                      </div>
                      
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {departments.map((department, index) => (
                          <option key={index} value={department}>{department}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mb-6 flex flex-wrap gap-3">
                  <button
                    onClick={handleBulkMarkPresent}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    <Check size={16} className="mr-2" /> Mark All Present
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 flex items-center"
                  >
                    <ClipboardCheck size={16} className="mr-2" /> Save Attendance
                  </button>
                  <button
                    onClick={exportAttendanceReport}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  >
                    <Download size={16} className="mr-2" /> Export Report
                  </button>
                </div>
                
                {/* Attendance Table */}
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Mark Attendance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredInterns.length > 0 ? (
                          filteredInterns.map((intern) => (
                            <tr key={intern.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {intern.employeeId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {intern.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {intern.department}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                {intern.status ? (
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    intern.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    intern.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                    intern.status === 'late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                                  }`}>
                                    <span className="mr-1">
                                      {getStatusIcon(intern.status)}
                                    </span>
                                    {intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500">Not marked</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="inline-flex space-x-1">
                                  <button 
                                    onClick={() => handleStatusChange(intern.id, 'present')}
                                    className={`p-2 rounded-full ${
                                      intern.status === 'present' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'hover:bg-green-100 text-gray-500 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-300'
                                    }`}
                                    title="Present"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(intern.id, 'absent')}
                                    className={`p-2 rounded-full ${
                                      intern.status === 'absent' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 'hover:bg-red-100 text-gray-500 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300'
                                    }`}
                                    title="Absent"
                                  >
                                    <X size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(intern.id, 'late')}
                                    className={`p-2 rounded-full ${
                                      intern.status === 'late' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' : 'hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 dark:hover:bg-yellow-900 dark:hover:text-yellow-300'
                                    }`}
                                    title="Late"
                                  >
                                    <Clock size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleStatusChange(intern.id, 'excused')}
                                    className={`p-2 rounded-full ${
                                      intern.status === 'excused' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' : 'hover:bg-emerald-100 text-gray-500 hover:text-emerald-600 dark:hover:bg-emerald-900 dark:hover:text-emerald-300'
                                    }`}
                                    title="Excused"
                                  >
                                    <AlertCircle size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                              No interns found for the selected department.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
