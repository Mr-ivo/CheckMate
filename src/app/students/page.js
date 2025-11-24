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
  X
} from "lucide-react";
import { toast } from "react-hot-toast";

// Layout components
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function Students() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // Mock student data
  const mockStudents = [
    { id: 1, name: "Alex Johnson", rollNumber: "S001", class: "10A", email: "alex@example.com", attendance: 92 },
    { id: 2, name: "Sophia Williams", rollNumber: "S002", class: "10A", email: "sophia@example.com", attendance: 88 },
    { id: 3, name: "James Brown", rollNumber: "S003", class: "9B", email: "james@example.com", attendance: 95 },
    { id: 4, name: "Emma Davis", rollNumber: "S004", class: "9B", email: "emma@example.com", attendance: 79 },
    { id: 5, name: "Michael Wilson", rollNumber: "S005", class: "11C", email: "michael@example.com", attendance: 85 },
    { id: 6, name: "Olivia Taylor", rollNumber: "S006", class: "11C", email: "olivia@example.com", attendance: 91 },
    { id: 7, name: "William Martinez", rollNumber: "S007", class: "12D", email: "william@example.com", attendance: 86 },
    { id: 8, name: "Ava Anderson", rollNumber: "S008", class: "12D", email: "ava@example.com", attendance: 93 },
  ];

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    class: "",
    email: "",
  });
  
  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setStudents(mockStudents);
      setFilteredStudents(mockStudents);
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

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        student =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    
    // Add validation here
    if (!formData.name || !formData.rollNumber || !formData.class || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Create new student
    const newStudent = {
      id: students.length + 1,
      name: formData.name,
      rollNumber: formData.rollNumber,
      class: formData.class,
      email: formData.email,
      attendance: 0
    };
    
    // Add to list
    setStudents([...students, newStudent]);
    setFilteredStudents([...students, newStudent]);
    
    // Reset form and close modal
    setFormData({ name: "", rollNumber: "", class: "", email: "" });
    setShowAddModal(false);
    
    toast.success("Student added successfully");
  };

  const handleDeleteStudent = (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      const updatedStudents = students.filter(student => student.id !== id);
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents.filter(
        student =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
      toast.success("Student deleted successfully");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl flex items-center">
                <Users className="mr-2" /> Students
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage all student records in one place
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 w-full"
                />
                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
              >
                <Plus size={18} className="mr-1" /> Add Student
              </button>
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
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Roll #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.rollNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.class}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      student.attendance > 90 ? 'bg-green-500' : 
                                      student.attendance > 80 ? 'bg-emerald-500' : 
                                      student.attendance > 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${student.attendance}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs text-gray-500">
                                  {student.attendance}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-emerald-600 hover:text-emerald-900 mr-4">
                                <Edit2 size={16} />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            No students found matching your search criteria.
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Student</h3>
                      <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                        <X size={20} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleAddStudent}>
                      <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <input
                          type="text"
                          id="rollNumber"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <input
                          type="text"
                          id="class"
                          name="class"
                          value={formData.class}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                          required
                        />
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none rounded-md"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 focus:outline-none"
                        >
                          Add Student
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

