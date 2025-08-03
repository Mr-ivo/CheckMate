"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Building, 
  Clock,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

// Layout components
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

// Export the protected intern detail page
export default function InternDetailPage() {
  return (
    <ProtectedRoute>
      <InternDetail />
    </ProtectedRoute>
  );
}

function InternDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [intern, setIntern] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  
  const router = useRouter();
  const params = useParams();
  const internId = params.id;

  // API service
  const apiService = {
    fetchData: async (endpoint) => {
      try {
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

  useEffect(() => {
    if (internId) {
      fetchInternData();
      fetchAttendanceData();
    }
  }, [internId]);

  const fetchInternData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.fetchData(`interns/${internId}`);
      setIntern(response.data.intern);
    } catch (error) {
      console.error('Error fetching intern:', error);
      toast.error('Failed to load intern details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const response = await apiService.fetchData(`attendance?internId=${internId}&limit=10`);
      setAttendanceRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleEditClick = () => {
    if (intern) {
      setEditForm({
        name: intern.userId?.name || '',
        email: intern.userId?.email || '',
        department: intern.department || '',
        status: intern.status || 'active',
        internId: intern.internId || ''
      });
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('checkmate_auth_token');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE}/interns/${internId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update intern');
      }

      toast.success('Intern updated successfully');
      setShowEditModal(false);
      fetchInternData(); // Refresh data
    } catch (error) {
      console.error('Error updating intern:', error);
      toast.error('Failed to update intern');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'completed':
        return <CheckCircle size={16} className="text-blue-500" />;
      case 'terminated':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'absent':
        return <XCircle size={16} className="text-red-500" />;
      case 'late':
        return <AlertCircle size={16} className="text-amber-500" />;
      case 'excused':
        return <AlertCircle size={16} className="text-blue-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!intern) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex">
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
              <div className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Intern Not Found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The intern you're looking for doesn't exist or has been removed.
                  </p>
                  <button
                    onClick={() => router.push('/interns')}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Interns
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/interns')}
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Interns
              </button>
              
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {intern.userId?.name || 'Unknown Intern'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Intern ID: {intern.internId}
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Edit2 size={16} className="mr-2" />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Intern Details Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Intern Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User size={20} className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {intern.userId?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail size={20} className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {intern.userId?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Building size={20} className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {intern.department || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar size={20} className="text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {intern.startDate ? new Date(intern.startDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="text-gray-400 mr-3">
                        {getStatusIcon(intern.status)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <p className="text-gray-900 dark:text-white font-medium capitalize">
                          {intern.status || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {intern.attendanceRate !== undefined && (
                      <div className="flex items-center">
                        <Clock size={20} className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {intern.attendanceRate}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Recent Attendance */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Attendance
                  </h2>
                  
                  {attendanceRecords.length > 0 ? (
                    <div className="space-y-3">
                      {attendanceRecords.map((record) => (
                        <div
                          key={record._id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="mr-3">
                              {getAttendanceStatusIcon(record.status)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                {record.status}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {record.checkInTime && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(record.checkInTime).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No attendance records found
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Intern
            </h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 