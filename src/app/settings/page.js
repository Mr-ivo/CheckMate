"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Clock, 
  Bell, 
  Shield, 
  Database,
  Save,
  Building,
  Calendar,
  Users,
  RefreshCw,
  Upload
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import apiService from "@/services/api.service";

// Layout components
import DashboardLayout from "@/components/DashboardLayout";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("organization");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Organization Settings
  const [organizationSettings, setOrganizationSettings] = useState({
    name: "CheckMate Organization",
    logo: "",
    address: "",
    email: "",
    phone: ""
  });
  
  // Work Schedule Settings
  const [workSchedule, setWorkSchedule] = useState({
    workDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    workHours: {
      start: "09:00",
      end: "17:00"
    },
    graceTime: 15, // minutes
    lateThreshold: 15 // minutes
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      dailyReport: true,
      weeklyReport: true,
      lateArrivals: true,
      absentees: true
    },
    recipients: []
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
    defaultTheme: "system",
    language: "en"
  });

  // Handle organization settings changes
  const handleOrganizationChange = (field, value) => {
    setOrganizationSettings({
      ...organizationSettings,
      [field]: value
    });
  };

  // Handle logo upload
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error("Logo size should be less than 2MB");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await apiService.uploadLogo(formData);
      
      if (response.status === 'success' && response.data?.logo) {
        setOrganizationSettings({
          ...organizationSettings,
          logo: response.data.logo
        });
        toast.success("Logo uploaded successfully");
      }
    } catch (err) {
      console.error("Failed to upload logo:", err);
      toast.error("Failed to upload logo");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle work schedule changes
  const handleWorkDayToggle = (day) => {
    setWorkSchedule({
      ...workSchedule,
      workDays: {
        ...workSchedule.workDays,
        [day]: !workSchedule.workDays[day]
      }
    });
  };

  const handleWorkHoursChange = (type, value) => {
    setWorkSchedule({
      ...workSchedule,
      workHours: {
        ...workSchedule.workHours,
        [type]: value
      }
    });
  };

  const handleGraceTimeChange = (value) => {
    setWorkSchedule({
      ...workSchedule,
      graceTime: parseInt(value) || 0
    });
  };

  const handleLateThresholdChange = (value) => {
    setWorkSchedule({
      ...workSchedule,
      lateThreshold: parseInt(value) || 0
    });
  };

  // Handle notification settings changes
  const handleEmailNotificationToggle = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      email: {
        ...notificationSettings.email,
        [setting]: !notificationSettings.email[setting]
      }
    });
  };

  const handleNotificationRecipientsChange = (value) => {
    setNotificationSettings({
      ...notificationSettings,
      recipients: value.split(',').map(email => email.trim()).filter(email => email)
    });
  };

  // Handle system settings changes
  const handleSystemSettingChange = (setting, value) => {
    setSystemSettings({
      ...systemSettings,
      [setting]: value
    });
  };

  // Save settings to backend
  const saveSettings = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const settingsData = {
        organization: organizationSettings,
        attendance: {
          workingHours: workSchedule.workHours,
          lateThreshold: workSchedule.lateThreshold,
          graceTime: workSchedule.graceTime,
          workingDays: workSchedule.workDays
        },
        notifications: notificationSettings,
        system: systemSettings
      };

      const response = await apiService.updateSettings(settingsData);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings. Please try again.");
      toast.error("Failed to save settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    if (confirm("Are you sure you want to reset all settings to their defaults? This cannot be undone.")) {
      try {
        setIsSubmitting(true);
        setError(null);
        
        const response = await apiService.resetSettings();
        
        if (response.status === 'success' && response.data) {
          const { organization, attendance, notifications, system } = response.data;
          
          // Update state with default settings
          if (organization) setOrganizationSettings(organization);
          
          if (attendance) {
            setWorkSchedule({
              workDays: attendance.workingDays || workSchedule.workDays,
              workHours: attendance.workingHours || workSchedule.workHours,
              graceTime: attendance.graceTime || 15,
              lateThreshold: attendance.lateThreshold || 15
            });
          }
          
          if (notifications) setNotificationSettings(notifications);
          if (system) setSystemSettings(system);
          
          toast.success("Settings reset to defaults");
        }
      } catch (err) {
        console.error("Failed to reset settings:", err);
        setError("Failed to reset settings. Please try again.");
        toast.error("Failed to reset settings");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getSettings();
        
        if (response.status === 'success' && response.data) {
          const { organization, attendance, notifications, system } = response.data;
          
          // Update state with fetched settings
          if (organization) {
            setOrganizationSettings({
              name: organization.name || "CheckMate Organization",
              logo: organization.logo || "/images/default-logo.png",
              address: organization.address || "",
              email: organization.email || "",
              phone: organization.phone || ""
            });
          }
          
          if (attendance) {
            setWorkSchedule({
              workDays: attendance.workingDays || workSchedule.workDays,
              workHours: attendance.workingHours || workSchedule.workHours,
              graceTime: attendance.graceTime || 15,
              lateThreshold: attendance.lateThreshold || 15
            });
          }
          
          if (notifications) {
            setNotificationSettings({
              email: notifications.email || notificationSettings.email,
              recipients: notifications.recipients || []
            });
          }
          
          if (system) {
            setSystemSettings({
              dateFormat: system.dateFormat || "YYYY-MM-DD",
              timeFormat: system.timeFormat || "24h",
              defaultTheme: system.defaultTheme || "system",
              language: system.language || "en"
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Failed to load settings. Using default values.");
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
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
    <DashboardLayout>
      <main className="flex-grow p-4 md:p-6">
        <div className="p-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <motion.div variants={itemVariants} className="flex items-center mb-4 md:mb-0">
              <Settings className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
            </motion.div>
            
            <motion.button
              variants={itemVariants}
              onClick={saveSettings}
              disabled={isSubmitting}
              className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
<motion.div
  variants={itemVariants}
  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
>
  <nav>
    <ul className="space-y-2">
      <li>
        <button
          onClick={() => setActiveTab("organization")}
          className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === "organization"
              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Building className="h-5 w-5 mr-3" />
          Organization
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveTab("workSchedule")}
          className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === "workSchedule"
              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Calendar className="h-5 w-5 mr-3" />
          Work Schedule
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === "notifications"
              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Bell className="h-5 w-5 mr-3" />
          Notifications
        </button>
      </li>
      <li>
        <button
          onClick={() => setActiveTab("system")}
          className={`w-full flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === "system"
              ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Settings className="h-5 w-5 mr-3" />
          System
        </button>
      </li>
    </ul>
  </nav>
</motion.div>

            {/* Settings Content */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                    <p>{error}</p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Organization Settings Tab */}
                  {activeTab === "organization" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Organization Settings
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Organization Name
                          </label>
                          <input
                            type="text"
                            value={organizationSettings.name}
                            onChange={(e) => handleOrganizationChange("name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter organization name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={organizationSettings.email}
                            onChange={(e) => handleOrganizationChange("email", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={organizationSettings.phone}
                            onChange={(e) => handleOrganizationChange("phone", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            value={organizationSettings.address}
                            onChange={(e) => handleOrganizationChange("address", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter address"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Organization Logo
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                            <img 
                              src={organizationSettings.logo} 
                              alt="Logo" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/default-logo.png";
                              }}
                            />
                          </div>
                          <div>
                            <label className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={isSubmitting}
                              />
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum size: 2MB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Work Schedule Settings Tab */}
                  {activeTab === "workSchedule" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Work Schedule Settings
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Working Hours
                          </label>
                          <input
                            type="time"
                            value={workSchedule.workHours}
                            onChange={(e) => handleWorkScheduleChange("workHours", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter working hours"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Late Threshold
                          </label>
                          <input
                            type="number"
                            value={workSchedule.lateThreshold}
                            onChange={(e) => handleWorkScheduleChange("lateThreshold", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter late threshold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Grace Time
                          </label>
                          <input
                            type="number"
                            value={workSchedule.graceTime}
                            onChange={(e) => handleWorkScheduleChange("graceTime", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter grace time"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Working Days
                          </label>
                          <select
                            value={workSchedule.workDays}
                            onChange={(e) => handleWorkScheduleChange("workDays", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Settings Tab */}
                  {activeTab === "notifications" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Notifications Settings
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Notifications
                          </label>
                          <input
                            type="email"
                            value={notificationSettings.email}
                            onChange={(e) => handleNotificationChange("email", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Recipients
                          </label>
                          <input
                            type="text"
                            value={notificationSettings.recipients}
                            onChange={(e) => handleNotificationChange("recipients", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter recipients"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System Settings Tab */}
                  {activeTab === "system" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        System Settings
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date Format
                          </label>
                          <select
                            value={systemSettings.dateFormat}
                            onChange={(e) => handleSystemSettingChange("dateFormat", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                            <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Time Format
                          </label>
                          <select
                            value={systemSettings.timeFormat}
                            onChange={(e) => handleSystemSettingChange("timeFormat", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="24h">24h</option>
                            <option value="12h">12h</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Default Theme
                          </label>
                          <select
                            value={systemSettings.defaultTheme}
                            onChange={(e) => handleSystemSettingChange("defaultTheme", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="system">System</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Language
                          </label>
                          <select
                            value={systemSettings.language}
                            onChange={(e) => handleSystemSettingChange("language", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="en">English</option>
                            <option value="fr">French</option>
                            <option value="es">Spanish</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Departments Settings Tab */}
                  {activeTab === "departments" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Departments Settings
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Department Name
                          </label>
                          <input
                            type="text"
                            value={departmentSettings.name}
                            onChange={(e) => handleDepartmentChange("name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter department name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Department Description
                          </label>
                          <textarea
                            value={departmentSettings.description}
                            onChange={(e) => handleDepartmentChange("description", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Enter department description"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
