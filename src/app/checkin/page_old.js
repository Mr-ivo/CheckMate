"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  User,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";

// Components
import SignatureCanvas from "@/components/SignatureCanvas";
import Footer from "@/components/Footer";

// Services
import apiService from "@/services/api.service";
import authService from "@/services/auth.service";

export default function CheckIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [signature, setSignature] = useState(null);
  const [isLate, setIsLate] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Mock work hours (9 AM to 5 PM)
  const workStartTime = new Date();
  workStartTime.setHours(9, 0, 0);

  // Check if current time is after work start time
  useEffect(() => {
    if (currentTime > workStartTime) {
      setIsLate(true);
    }
  }, [currentTime]);

  // Update current time every second
  useEffect(() => {
    // Set initial time only on client-side
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
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

  const formatTime = (date) => {
    // Only run on client side to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return ''; // Return empty on server side
    }
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
    toast.success("Signature captured successfully!");
  };

  const onSubmit = async (data) => {
    if (!signature) {
      toast.error("Please provide your signature");
      return;
    }

    setIsLoading(true);
    
    try {
      // Get current user
      const currentUser = authService.getCurrentUser();
      
      // Get intern ID from current user or form data
      const internId = currentUser?._id || data.employeeId;
      if (!internId) {
        toast.error("Intern ID not found. Please make sure you're logged in or enter a valid ID.");
        setIsLoading(false);
        return;
      }
      
      // Prepare check-in data to match the backend API structure
      const checkInData = {
        internId: internId,
        signature: signature,
        location: "Check-in Kiosk",
        notes: data.notes || '',
        name: data.name,             // Additional data that might be useful
        department: data.department,  // Additional data that might be useful
        timestamp: new Date().toISOString(),
        isLate: isLate
      };
      
      console.log("Submitting check-in data:", checkInData);
      
      // Send to backend
      const response = await apiService.submitCheckIn(checkInData);
      
      console.log("Check-in response:", response);
      
      // Show success message
      toast.success(`Successfully checked in, ${data.name}!`);
      setCheckedIn(true);
      reset();
      setSignature(null);
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.message || "Check-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        duration: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header with Theme Toggle */}
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              CheckMate
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Date and Time Display */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formatDate(currentTime)}
                </h2>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" suppressHydrationWarning>
                {formatTime(currentTime)}
              </div>
              {isLate && !checkedIn && (
                <div className="mt-2 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 mr-1" />
                  <span>You are checking in after the start time (9:00 AM)</span>
                </div>
              )}
            </motion.div>
            
            {checkedIn ? (
              <motion.div
                variants={itemVariants}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg shadow-md p-8 text-center"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Check-In Successful!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your attendance has been recorded.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Check-in time: {formatTime(new Date())}
                  </div>
                  
                  <button
                    onClick={() => setCheckedIn(false)}
                    className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-300"
                  >
                    Check-in Another Person
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Daily Check-In
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    {/* Employee ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="employeeId">
                        Intern ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="employeeId"
                          className={`pl-10 block w-full py-2 px-3 border ${errors.employeeId ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          placeholder="Enter your intern ID (e.g., INT-001)"
                          {...register("employeeId", { required: "Intern ID is required" })}
                        />
                      </div>
                      {errors.employeeId && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.employeeId.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className={`block w-full py-2 px-3 border ${errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="Enter your full name"
                        {...register("name", { required: "Full name is required" })}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="department">
                        Department
                      </label>
                      <select
                        id="department"
                        className={`block w-full py-2 px-3 border ${errors.department ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        {...register("department", { required: "Department is required" })}
                      >
                        <option value="">Select your department</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Graphic Design">Graphic Design</option>
                        <option value="Video Editing">Video Editing</option>
                        <option value="QA Testing">QA Testing</option>
                      </select>
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.department.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="notes">
                        Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                        placeholder="Add any notes about your arrival (e.g., reason for late arrival)"
                        {...register("notes")}
                      />
                    </div>
                    
                    {/* Signature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Signature
                      </label>
                      <SignatureCanvas onSave={handleSignatureSave} />
                      {!signature && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Your signature is required to complete check-in
                        </p>
                      )}
                    </div>
                    
                    {/* Submit Button */}
                    <div>
                      <motion.button
                        type="submit"
                        className={`w-full py-3 px-4 flex justify-center items-center rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <>
                            <span className="loader-sm mr-2"></span>
                            Processing...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
            
            {/* Quick Info */}
            <motion.div
              variants={itemVariants}
              className="mt-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    Office Location Check-In
                  </h3>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    This check-in system is for the main office location. Make sure you're physically present at the office when signing in.
                  </p>
                  {isLate && (
                    <div className="mt-2 flex items-center text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-medium">You are checking in after 9:00 AM. This will be recorded as a late arrival.</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
