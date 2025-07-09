"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  PlusCircle, 
  Trash2, 
  Edit, 
  X, 
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

// Layout components
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function Staff() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState([]);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Mock data for staff
  const mockStaff = [
    { id: 1, name: "John Smith", employeeId: "EMP001", department: "Engineering", position: "Software Engineer", status: "Active", joinDate: "2023-05-15" },
    { id: 2, name: "Emily Johnson", employeeId: "EMP002", department: "Marketing", position: "Marketing Specialist", status: "Active", joinDate: "2023-06-02" },
    { id: 3, name: "Michael Brown", employeeId: "EMP003", department: "HR", position: "HR Associate", status: "On Leave", joinDate: "2023-04-10" },
    { id: 4, name: "Jessica Davis", employeeId: "EMP004", department: "Finance", position: "Financial Analyst", status: "Active", joinDate: "2023-03-22" },
    { id: 5, name: "David Wilson", employeeId: "EMP005", department: "IT", position: "Systems Administrator", status: "Active", joinDate: "2023-07-08" },
    { id: 6, name: "Sarah Martinez", employeeId: "EMP006", department: "Operations", position: "Operations Manager", status: "Active", joinDate: "2023-01-15" },
    { id: 7, name: "Robert Taylor", employeeId: "EMP007", department: "Engineering", position: "QA Engineer", status: "Inactive", joinDate: "2023-02-28" },
    { id: 8, name: "Jennifer Thomas", employeeId: "EMP008", department: "Sales", position: "Sales Representative", status: "Active", joinDate: "2023-08-05" },
  ];

  // Load mock data with delay to simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setStaff(mockStaff);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle dark mode toggle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', !isDarkMode);
    
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const onAddStaff = (data) => {
    // Create new staff object
    const newStaff = {
      id: staff.length + 1,
      name: data.name,
      employeeId: data.employeeId,
      department: data.department,
      position: data.position,
      status: data.status,
      joinDate: data.joinDate
    };

    // Update staff list
    setStaff([...staff, newStaff]);
    
    // Close modal and reset form
    setShowAddModal(false);
    reset();
    
    // Show success message
    toast.success("Staff member added successfully!");
  };

  const handleDeleteClick = (staffId) => {
    const staffMember = staff.find(s => s.id === staffId);
    setStaffToDelete(staffMember);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!staffToDelete) return;
    
    // Filter out the staff member to delete
    const updatedStaff = staff.filter(s => s.id !== staffToDelete.id);
    setStaff(updatedStaff);
    
    // Close modal
    setShowDeleteModal(false);
    setStaffToDelete(null);
    
    // Show success message
    toast.success("Staff member removed successfully!");
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort staff list
  const filteredStaff = staff.filter(staffMember => {
    const query = searchQuery.toLowerCase();
    return (
      staffMember.name.toLowerCase().includes(query) ||
      staffMember.employeeId.toLowerCase().includes(query) ||
      staffMember.department.toLowerCase().includes(query) ||
      staffMember.position.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    // Handle sorting
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField === 'employeeId') {
      return sortDirection === 'asc'
        ? a.employeeId.localeCompare(b.employeeId)
        : b.employeeId.localeCompare(a.employeeId);
    } else if (sortField === 'department') {
      return sortDirection === 'asc'
        ? a.department.localeCompare(b.department)
        : b.department.localeCompare(a.department);
    } else if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    } else if (sortField === 'joinDate') {
      return sortDirection === 'asc'
        ? new Date(a.joinDate) - new Date(b.joinDate)
        : new Date(b.joinDate) - new Date(a.joinDate);
    }
    return 0;
  });

  const exportStaffList = () => {
    toast.success("Staff list exported successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <Sidebar isOpen={sidebarOpen} />

      <main className={`pt-20 pb-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarOpen ? 'md:ml-60' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl flex items-center">
                <Users className="mr-2" /> Staff Management
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage interns and workers in your organization
              </p>
            </div>
          </div>

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
              <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
                {/* Search Bar */}
                <div className="relative md:w-72">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-3">
                  {/* Export Button */}
                  <button
                    onClick={exportStaffList}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  
                  {/* Add Staff Button */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Staff
                  </button>
                </div>
              </div>

              {/* Staff Table */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Name
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('employeeId')}
                        >
                          <div className="flex items-center">
                            Employee ID
                            {sortField === 'employeeId' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('department')}
                        >
                          <div className="flex items-center">
                            Department
                            {sortField === 'department' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Position
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            {sortField === 'status' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('joinDate')}
                        >
                          <div className="flex items-center">
                            Join Date
                            {sortField === 'joinDate' && (
                              sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredStaff.length > 0 ? (
                        filteredStaff.map((staffMember) => (
                          <tr key={staffMember.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {staffMember.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {staffMember.employeeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {staffMember.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {staffMember.position}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                staffMember.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                staffMember.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              }`}>
                                {staffMember.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {new Date(staffMember.joinDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 mr-3"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => handleDeleteClick(staffMember.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No staff members found
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

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Add New Staff Member
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onAddStaff)} className="px-6 py-4">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className={`mt-1 block w-full border ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    id="employeeId"
                    className={`mt-1 block w-full border ${errors.employeeId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    {...register("employeeId", { required: "Employee ID is required" })}
                  />
                  {errors.employeeId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.employeeId.message}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <select
                    id="department"
                    className={`mt-1 block w-full border ${errors.department ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    {...register("department", { required: "Department is required" })}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">IT</option>
                    <option value="Operations">Operations</option>
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position
                  </label>
                  <input
                    type="text"
                    id="position"
                    className={`mt-1 block w-full border ${errors.position ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    {...register("position", { required: "Position is required" })}
                  />
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.position.message}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    className={`mt-1 block w-full border ${errors.status ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    {...register("status", { required: "Status is required" })}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                {/* Join Date */}
                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Join Date
                  </label>
                  <input
                    type="date"
                    id="joinDate"
                    className={`mt-1 block w-full border ${errors.joinDate ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm`}
                    {...register("joinDate", { required: "Join date is required" })}
                  />
                  {errors.joinDate && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.joinDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
                Confirm Deletion
              </h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Are you sure you want to remove <span className="font-medium text-gray-900 dark:text-white">{staffToDelete?.name}</span> from the staff list? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-center space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
