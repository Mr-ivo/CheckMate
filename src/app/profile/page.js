"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Clock, 
  Save, 
  Edit, 
  Camera,
  X
} from "lucide-react";
import toast from "react-hot-toast";

// Import components
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}

function Profile() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState("/avatar-placeholder.png");
  const [showImageUpload, setShowImageUpload] = useState(false);
  
  // User profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    joinDate: "",
    bio: ""
  });
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    bio: ""
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Get auth token
        const token = localStorage.getItem('checkmate_auth_token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        // Mock data for now - replace with actual API call
        const userData = {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+234 800 123 4567",
          department: "Engineering",
          position: "Software Developer",
          joinDate: "2023-01-15",
          bio: "Experienced software developer with a passion for building user-friendly applications."
        };
        
        // Set profile data
        setProfile(userData);
        setFormData(userData);
        
        // Simulate API delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [router]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update profile with form data
      setProfile({
        ...profile,
        ...formData
      });
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
        setShowImageUpload(false);
        toast.success("Profile picture updated");
      };
      reader.readAsDataURL(file);
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
      transition: { duration: 0.5 }
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-4xl mx-auto"
        >
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </motion.div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="logo-loader">
                <img src="/checkmate-logo.png" alt="Loading" width="100" height="100" />
              </div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          ) : (
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-blue-500">
                  <div className="absolute -bottom-16 left-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                        <Image 
                          src={profileImage} 
                          alt="Profile" 
                          width={128} 
                          height={128} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditing && (
                        <button 
                          onClick={() => setShowImageUpload(true)}
                          className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors"
                        >
                          <Camera size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Profile Content */}
                <div className="pt-20 px-8 pb-8">
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <User size={16} />
                            </span>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <Mail size={16} />
                            </span>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <Phone size={16} />
                            </span>
                            <input
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <Building size={16} />
                            </span>
                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                              <User size={16} />
                            </span>
                            <input
                              type="text"
                              name="position"
                              value={formData.position}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {profile.name}
                      </h2>
                      <p className="text-emerald-600 mb-6">
                        {profile.position}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Mail size={16} className="text-gray-500" />
                              <span className="text-gray-900">{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone size={16} className="text-gray-500" />
                              <span className="text-gray-900">{profile.phone}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                            Work Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Building size={16} className="text-gray-500" />
                              <span className="text-gray-900">{profile.department}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar size={16} className="text-gray-500" />
                              <span className="text-gray-900">
                                Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                          About
                        </h3>
                        <p className="text-gray-700">
                          {profile.bio || "No bio available."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Update Profile Picture
              </h3>
              <button 
                onClick={() => setShowImageUpload(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select an image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowImageUpload(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowImageUpload(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

