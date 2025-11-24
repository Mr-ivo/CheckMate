"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter,
  ChevronDown,
  X,
  Loader
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

// Layout components
import DashboardLayout from "@/components/DashboardLayout";
import Footer from "@/components/Footer";

// Import ProtectedRoute component
import ProtectedRoute from "@/components/ProtectedRoute";

// Export the protected interns page
export default function InternsPage() {
  // Wrap in ProtectedRoute to ensure authentication
  return (
    <ProtectedRoute>
      <Interns />
    </ProtectedRoute>
  );
}

// Main Interns component
function Interns() {
  return <InternsDashboard />;
}

function InternsDashboard() {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [interns, setInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  
  // API service for making authenticated requests
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
    
    updateData: async (endpoint, data) => {
      try {
        // Get auth token for authenticated requests
        const token = localStorage.getItem('checkmate_auth_token');
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        console.log(`Updating ${endpoint}:`, data); // Debug log
        
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          // Try to get detailed error information
          let errorText;
          try {
            errorText = await response.text();
            console.error('API Error response body:', errorText);
            
            // Try to parse as JSON
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              throw new Error(`API Error: ${errorJson.message}`);
            }
          } catch (parseErr) {
            // If can't parse JSON or no message, use default error
          }
          
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error(`Error updating ${endpoint}:`, err);
        throw err;
      }
    },
    
    postData: async (endpoint, data) => {
      try {
        // Get auth token for authenticated requests
        const token = localStorage.getItem('checkmate_auth_token');
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        console.log(`Sending to ${endpoint}:`, data); // Debug log
        
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          // Try to get detailed error information
          let errorText;
          try {
            errorText = await response.text();
            console.error('API Error response body:', errorText);
            
            // Try to parse as JSON
            const errorJson = JSON.parse(errorText);
            if (errorJson.message) {
              throw new Error(`API Error: ${errorJson.message}`);
            }
          } catch (parseErr) {
            // If can't parse JSON or no message, use default error
          }
          
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error(`Error posting to ${endpoint}:`, err);
        throw err;
      }
    },
    
    deleteData: async (endpoint) => {
      try {
        // Get auth token for authenticated requests
        const token = localStorage.getItem('checkmate_auth_token');
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'DELETE',
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
        console.error(`Error deleting ${endpoint}:`, err);
        throw err;
      }
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    employeeId: "", 
    department: "",
    email: "",
    phone: "", 
    password: "", 
    supervisor: "", 
  });
  
  // Function to generate a unique email based on name and timestamp
  const generateUniqueEmail = (name) => {
    if (!name) return "";
    const timestamp = new Date().getTime().toString().slice(-4);
    const cleanName = name.toLowerCase().replace(/[^a-z]/g, "");
    return `${cleanName}${timestamp}@example.com`;
  };
  
  // Fetch interns data from API
  const fetchInterns = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching interns data...');
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('Using API URL:', `${API_BASE}/interns`);
      
      // Direct fetch for debugging
      const token = localStorage.getItem('checkmate_auth_token');
      console.log('Auth token available:', !!token);
      
      const response = await apiService.fetchData('interns');
      console.log('FULL Interns API response:', JSON.stringify(response, null, 2));
      
      // Handle different response formats
      let internsData = [];
      
      if (response.status === 'success' && response.data && response.data.interns) {
        internsData = response.data.interns;
        console.log('Found interns in response.data.interns');
      } else if (response.data && Array.isArray(response.data)) {
        internsData = response.data;
        console.log('Found interns in response.data array');
      } else if (Array.isArray(response)) {
        internsData = response;
        console.log('Response itself is an array of interns');
      } else if (response.interns && Array.isArray(response.interns)) {
        internsData = response.interns;
        console.log('Found interns in response.interns');
      } else {
        console.error('Could not locate interns array in response:', response);
        toast.error('Failed to locate interns data in API response');
        setInterns([]);
        setFilteredInterns([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Raw interns data count:', internsData.length);
      console.log('First intern raw data:', internsData[0] ? JSON.stringify(internsData[0], null, 2) : 'No interns');
      
      // Check if the array is empty
      if (internsData.length === 0) {
        console.log('No interns found in the database');
        toast('No interns found in the database');
        setInterns([]);
        setFilteredInterns([]);
        setIsLoading(false);
        return;
      }
      
      // Transform API data to match our UI format with extensive debugging
      const formattedInterns = internsData.map((intern, index) => {
        console.log(`Processing intern ${index}:`, JSON.stringify(intern, null, 2));
        
        console.log(`Intern ${index} keys:`, Object.keys(intern));
        
        console.log(`Checking userId object for intern ${index}:`, intern.userId);
        
        let name, email;
        
        // First priority: populated userId object
        if (intern.userId && typeof intern.userId === 'object') {
          console.log(`Intern ${index} has populated userId with name=${intern.userId.name}, email=${intern.userId.email}`);
          name = intern.userId.name;
          email = intern.userId.email;
        } 
        // Second priority: check other possible fields
        else {
          // Check for common name fields
          const possibleNames = [
            intern.name,
            intern.fullName,
            intern.firstName ? `${intern.firstName} ${intern.lastName || ''}`.trim() : null,
            intern.user?.name,
            intern.userName,
          ].filter(Boolean);
          
          console.log(`Possible names for intern ${index}:`, possibleNames);
          name = possibleNames.length > 0 ? possibleNames[0] : null;
          
          // Check for common email fields
          const possibleEmails = [
            intern.email,
            intern.emailAddress,
            intern.user?.email,
            intern.userEmail,
          ].filter(Boolean);
          
          console.log(`Possible emails for intern ${index}:`, possibleEmails);
          email = possibleEmails.length > 0 ? possibleEmails[0] : null;
        }
        
        // Final fallback values if nothing was found
        name = name || 'Unknown';
        email = email || '';
        
        console.log(`Final name and email for intern ${index}:`, { name, email });
        
        // Create a safe formatted intern object
        const formattedIntern = {
          _id: intern._id || intern.id || `temp-${index}`,
          id: intern._id || intern.id || `temp-${index}`,
          name: name,
          employeeId: intern.internId || intern.employeeId || intern.id || '',
          internId: intern.internId || intern.employeeId || intern.id || '',
          department: intern.department || intern.dept || '',
          email: email,
          attendance: typeof intern.attendanceRate === 'number' ? intern.attendanceRate : 
                    typeof intern.attendance === 'number' ? intern.attendance : 0,
          status: intern.status || 'active',
          startDate: intern.startDate || '',
          supervisor: intern.supervisorName || intern.supervisor || '',
          supervisorName: intern.supervisorName || intern.supervisor || '',
        };
        
        console.log(`Formatted intern ${index}:`, formattedIntern);
        return formattedIntern;
      });
      
      console.log('Final formatted interns:', formattedInterns);
      
      if (formattedInterns.length > 0) {
        setInterns(formattedInterns);
        setFilteredInterns(formattedInterns);
        
        // Show count in toast
        toast.success(`Loaded ${formattedInterns.length} interns successfully`);
      } else {
        toast.error('Failed to format interns data properly');
        setInterns([]);
        setFilteredInterns([]);
      }
    } catch (error) {
      console.error('Error fetching interns:', error);
      toast.error('Failed to load interns: ' + error.message);
      setInterns([]);
      setFilteredInterns([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load interns on component mount
  useEffect(() => {
    fetchInterns();
  }, []);

  // No longer need local dark mode toggle since we're using global ThemeContext

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInterns(interns);
    } else {
      const filtered = interns.filter(
        intern =>
          intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          intern.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInterns(filtered);
    }
  }, [searchTerm, interns]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddIntern = async (e) => {
    e.preventDefault();
    
    // Add validation here
    if (!formData.name || !formData.employeeId || !formData.department || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const internData = {
        name: formData.name.trim(), 
        email: formData.email.trim(),
        internEmail: formData.email.trim(), 
        phone: formData.phone ? formData.phone.trim() : undefined, 
        password: formData.password ? formData.password : "temppassword123", 
        internId: formData.employeeId.trim(),
        department: formData.department,
        startDate: new Date().toISOString() 
      };
     
      if (formData.supervisor && formData.supervisor.trim() !== "") {
        internData.supervisorName = formData.supervisor.trim();
      }
      
      console.log('Sending intern data:', JSON.stringify(internData, null, 2)); // Debug payload
      
      // Call API
      const response = await apiService.postData('interns', internData);
      console.log('API Response:', response); 
      
      if (response.status === 'success' && response.data?.intern) {
        console.log('Successfully added intern with response:', JSON.stringify(response.data.intern, null, 2));
        
        await fetchInterns();
        
        // Reset form and close modal
        
        // Reset form
        setFormData({
          name: "",
          employeeId: "",
          department: "",
          email: "",
          password: "",
          supervisor: "",
        });
        
        // Close modal
        setShowAddModal(false);
        
        toast.success("Intern added successfully!");
        
        // Reload data from the database to ensure we have the latest data
        fetchInterns();
      } else {
        toast.error("Failed to add intern");
      }
    } catch (error) {
      console.error('Error adding intern:', error);
      
      // Check for specific error types
      if (error.message?.includes('duplicate key') && error.message?.includes('email')) {
        toast.error("This email address is already in use. Please use a different email.");
      } else if (error.message?.includes('duplicate key') && error.message?.includes('internId')) {
        toast.error("This Intern ID is already in use. Please use a different ID.");
      } else if (error.message?.includes('Cast to ObjectId failed')) {
        toast.error("Invalid ID format for a reference field. Please check your input.");
      } else if (error.message?.includes('validation failed')) {
        toast.error("Validation failed. Please check all required fields.");
      } else {
        // Generic error message
        const errorMessage = error.response?.data?.message || error.message || "Failed to add intern";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle edit button click and open the edit modal
  const handleEditClick = (intern) => {
    console.log('Edit clicked for intern:', intern.name);
    
    // Step 1: Update form data first
    const formDataToSet = {
      name: intern.name || '',
      employeeId: intern.internId || intern.employeeId || '',
      department: intern.department || '',
      email: intern.email || intern.user?.email || '', // Try intern email first, then user email
      phone: intern.phone || '', // Include phone field
      password: '', // Don't pre-fill for security
      supervisor: intern.supervisorName || intern.supervisor || '',
    };
    setFormData(formDataToSet);
    
    // Step 2: Set the selected intern
    setSelectedIntern(intern);
    
    // Step 3: Show the modal immediately - React batches state updates
    setShowEditModal(true);
    
    // Log for debugging
    console.log('Edit modal should be visible now');
  };
  
  // Custom function to update intern with PUT method
  const updateIntern = async (internId, data) => {
    try {
      // Get auth token for authenticated requests
      const token = localStorage.getItem('checkmate_auth_token');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      console.log(`Updating intern ${internId}:`, data); // Debug log
      
      const response = await fetch(`${API_BASE}/interns/${internId}`, {
        method: 'PUT', // Explicitly using PUT for intern updates
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        // Try to get detailed error information
        const errorText = await response.text();
        console.error('API Error response body:', JSON.stringify(errorText));
        throw new Error(`API Error response body: ${JSON.stringify(errorText)}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error(`Error updating intern:`, err);
      throw err;
    }
  };

  // Handle edit form submission
  const handleEditIntern = async () => {
    try {
      setIsLoading(true);
      
      // Enhanced validation for required fields
      const validationErrors = [];
      
      // Check required fields
      if (!formData.name.trim()) validationErrors.push('Name is required');
      if (!formData.employeeId.trim()) validationErrors.push('Employee ID is required');
      if (!formData.email.trim()) validationErrors.push('Email is required');
      if (!formData.department.trim()) validationErrors.push('Department is required');
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
        validationErrors.push('Please enter a valid email address');
      }
      
      // Validate employee ID format (alphanumeric)
      const employeeIdRegex = /^[a-zA-Z0-9-]+$/;
      if (formData.employeeId.trim() && !employeeIdRegex.test(formData.employeeId.trim())) {
        validationErrors.push('Employee ID should contain only letters, numbers, and hyphens');
      }
      
      // Check password if provided
      if (formData.password && formData.password.length < 6) {
        validationErrors.push('Password must be at least 6 characters long');
      }
      
      // Display validation errors if any
      if (validationErrors.length > 0) {
        toast.error(
          <div>
            <strong>Please fix the following errors:</strong>
            <ul className="mt-2 list-disc pl-5">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        );
        setIsLoading(false);
        return;
      }
      
      // Prepare payload for API
      const payload = {
        name: formData.name.trim(),
        internId: formData.employeeId.trim(),
        department: formData.department.trim(),
        email: formData.email.trim(), // User account email
        internEmail: formData.email.trim(), // Intern-specific email
        phone: formData.phone ? formData.phone.trim() : undefined, // Optional phone number
        supervisor: formData.supervisor.trim() || undefined, // Changed from supervisorName to supervisor to match backend model
        status: 'active', // Ensure status is included
      };
      
      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password.trim();
      }
      
      console.log('Update payload:', payload);
      
      // Call our custom function to update the intern with PUT method
      const response = await updateIntern(selectedIntern._id, payload);
      
      if (response.status === 'success') {
        toast.success('Intern updated successfully!');
        
        // Refresh the interns list
        await fetchInterns();
        
        // Close the modal and reset form
        setShowEditModal(false);
        setSelectedIntern(null);
        setFormData({
          name: '',
          employeeId: '',
          department: '',
          email: '',
          phone: '',
          password: '',
          supervisor: '',
        });
      }
    } catch (error) {
      console.error('Error updating intern:', error);
      
      // Handle specific errors
      if (error.message.includes('duplicate key')) {
        if (error.message.includes('email')) {
          toast.error('Email already exists. Please use a different email.');
        } else if (error.message.includes('internId')) {
          toast.error('Intern ID already exists. Please use a different ID.');
        } else {
          toast.error(error.message || 'Failed to update intern');
        }
      } else {
        toast.error(error.message || 'Failed to update intern');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIntern = async (id) => {
    try {
      // Confirm deletion
      if (!confirm('Are you sure you want to delete this intern? This will also delete their user account and all associated data.')) {
        return;
      }
      
      setIsLoading(true);
      
      // Call API to delete
      const response = await apiService.deleteData(`interns/${id}`);
      
      if (response.status === 'success') {
        // Filter out the deleted intern from our state
        const updated = interns.filter(intern => intern._id !== id);
        setInterns(updated);
        setFilteredInterns(updated);
        
        toast.success("Intern removed successfully!");
      } else {
        toast.error("Failed to delete intern");
      }
    } catch (error) {
      console.error('Error deleting intern:', error);
      toast.error(error.message || "Failed to delete intern");
    } finally {
      setIsLoading(false);
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

  return (
    <DashboardLayout>
      
      <main className="flex-grow p-4 md:p-6">
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <Loader className="animate-spin text-emerald-600 h-6 w-6" />
              <p className="text-gray-800">Loading...</p>
            </div>
          </div>
        )}
        <div className="p-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <motion.div variants={itemVariants} className="flex items-center mb-4 md:mb-0">
              <Users className="h-6 w-6 text-emerald-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Intern Management</h1>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search interns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              
              <div className="flex space-x-4 mb-4">
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Intern
                </button>
                <button
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                  onClick={() => {
                    toast('Refreshing interns data...');
                    fetchInterns();
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </motion.div>
          </motion.div>

          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center h-64"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th key="name" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th key="employeeId" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                      <th key="department" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th key="email" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th key="attendance" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                      <th key="actions" scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredInterns.map((intern) => (
                      <motion.tr 
                        key={intern._id}
                        variants={itemVariants}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {intern.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{intern.internId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{intern.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {intern.email || `intern${intern.internId || ''}@checkmate.com`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            intern.attendance >= 90 
                              ? 'text-green-600' 
                              : intern.attendance >= 75
                                ? 'text-amber-600'
                                : 'text-red-600'
                          }`}>
                            {intern.attendance}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <div key={`edit-${intern._id}`}>
                              <button 
                                className="text-blue-600 hover:text-blue-800"
                                onClick={(e) => {
                                  // Stop propagation to prevent bubbling
                                  e.stopPropagation();
                                  // Call edit handler
                                  handleEditClick(intern);
                                }}
                                title="Edit Intern"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div key={`delete-${intern._id}`}>
                              <button 
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteIntern(intern._id)}
                                title="Delete Intern"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Add Intern Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
          >
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-5 w-5" /> Add New Intern
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white hover:text-gray-100 focus:outline-none transition-transform hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleAddIntern} className="space-y-5">
                {/* Personal Information Section */}
                <div className="mb-2">
                  <h4 className="text-sm uppercase font-semibold text-emerald-600 mb-3 border-b border-gray-200 pb-1">Personal Information</h4>
                  
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="jane.doe@example.com"  
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                    <div className="flex items-center mt-2">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, email: generateUniqueEmail(formData.name)})}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-1 px-2 rounded transition-all duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generate Unique Email
                      </button>
                      <p className="text-xs italic text-amber-600 ml-2">
                        Each intern needs a unique email that doesn't exist in the system.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                    <p className="mt-1 text-xs text-gray-500">Optional: Contact phone number for the intern</p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Mobile Carrier
                    </label>
                    <select
                      id="carrier"
                      name="carrier"
                      value={formData.carrier || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    >
                      <option value="">Select Carrier (for SMS)</option>
                      <option value="mtn">MTN Cameroon</option>
                      <option value="orange">Orange Cameroon</option>
                      <option value="camtel">Camtel Mobile</option>
                      <option value="nexttel">Nexttel</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">📱 Required for SMS notifications. Select the intern's mobile carrier in Cameroon.</p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Leave blank for default password"
                    />
                    <p className="mt-1 text-xs text-gray-500 italic flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      If left blank, a secure temporary password will be generated
                    </p>
                  </div>
                </div>
                
                {/* Work Information Section */}
                <div>
                  <h4 className="text-sm uppercase font-semibold text-emerald-600 mb-3 border-b border-gray-200 pb-1">Work Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Intern ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Example: INT-2025-001"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="QA Testing">QA Testing</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      Supervisor Name
                    </label>
                    <input
                      type="text"
                      id="supervisor"
                      name="supervisor"
                      placeholder="Enter supervisor's name"
                      value={formData.supervisor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: Enter the name of the intern's supervisor</p>
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Add Intern
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Intern Modal - Simplified version without animation */}
      {showEditModal && selectedIntern && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75"
          onClick={(e) => {
            // Only close when clicking directly on the backdrop
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center pb-3 mb-2 border-b">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <Edit2 className="h-5 w-5 text-emerald-500 mr-2" />
                    Edit Intern: {selectedIntern?.name || 'Intern'}
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1 ml-auto bg-transparent border-0 text-gray-500 hover:text-gray-700 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleEditIntern} className="space-y-5">
                  {/* Personal Information Section */}
                  <div className="mb-2">
                    <h4 className="text-sm uppercase font-semibold text-emerald-600 mb-3 border-b border-gray-200 pb-1">Personal Information</h4>
                    
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="jane.doe@example.com"  
                        value={formData.email}
                        onChange={handleInputChange}
                        name="email"
                        id="email"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Enter phone number"
                      />
                      <p className="mt-1 text-xs text-gray-500">Optional: Contact phone number for the intern</p>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        Mobile Carrier
                      </label>
                      <select
                        id="carrier"
                        name="carrier"
                        value={formData.carrier || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      >
                        <option value="">Select Carrier (for SMS)</option>
                        <option value="mtn">MTN Cameroon</option>
                        <option value="orange">Orange Cameroon</option>
                        <option value="camtel">Camtel Mobile</option>
                        <option value="nexttel">Nexttel</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">📱 Required for SMS notifications. Select the intern's mobile carrier in Cameroon.</p>
                    </div>
                    
                    <div className="mb-4">
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                        </svg>
                        Password (Optional)
                      </label>
                      <input
                        type="password"
                        placeholder="Leave empty to keep current password"
                        value={formData.password}
                        onChange={handleInputChange}
                        name="password"
                        id="password"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password</p>
                    </div>
                  </div>
                  
                  {/* Employment Information Section */}
                  <div>
                    <h4 className="text-sm uppercase font-semibold text-emerald-600 mb-3 border-b border-gray-200 pb-1">Employment Information</h4>
                    
                    <div className="mb-4">
                      <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Intern ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="employeeId"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Enter intern ID (e.g., INT-001)"
                        required
                      />
                    </div>
                  
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="w-full">
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                          </svg>
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                          required
                        >
                          <option key="empty" value="">Select Department</option>
                          <option key="Web Development" value="Web Development">Web Development</option>
                          <option key="Mobile Development" value="Mobile Development">Mobile Development</option>
                          <option key="Graphic Design" value="Graphic Design">Graphic Design</option>
                          <option key="Video Editing" value="Video Editing">Video Editing</option>
                          <option key="QA Testing" value="QA Testing">QA Testing</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Supervisor Name
                      </label>
                      <input
                        type="text"
                        id="supervisor"
                        name="supervisor"
                        placeholder="Enter supervisor's name"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional: Enter the name of the intern's supervisor</p>
                    </div>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedIntern(null);
                      }}
                      className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-all duration-200 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" /> Update Intern
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

