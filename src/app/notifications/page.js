"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Check, ChevronLeft, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "react-hot-toast";

// Import DashboardLayout
import DashboardLayout from "@/components/DashboardLayout";

export default function Notifications() {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: "New intern joined",
      message: "Alex Johnson has joined the Mobile Development department",
      time: "10 minutes ago",
      read: false,
      type: "info",
      date: "2025-07-08"
    },
    {
      id: 2,
      title: "Meeting reminder",
      message: "Graphic design department meeting at 2:00 PM in Conference Room A",
      time: "1 hour ago",
      read: false,
      type: "reminder",
      date: "2025-07-08"
    },
    {
      id: 3,
      title: "Attendance report ready",
      message: "June monthly attendance report is now ready for review",
      time: "3 hours ago",
      read: true,
      type: "report",
      date: "2025-07-08"
    },
    {
      id: 4,
      title: "Web Development project deadline",
      message: "Web Development project deadline has been extended to July 15",
      time: "Yesterday",
      read: true,
      type: "deadline",
      date: "2025-07-07"
    },
    {
      id: 5,
      title: "Intern evaluation",
      message: "Please complete the evaluation for all interns by Friday",
      time: "2 days ago",
      read: true,
      type: "task",
      date: "2025-07-06"
    },
    {
      id: 6, 
      title: "System update",
      message: "CheckMate will undergo a system update on Saturday night. Expect 30 minutes of downtime.",
      time: "1 week ago",
      read: true,
      type: "system",
      date: "2025-07-01"
    }
  ];

  useEffect(() => {
    // Simulate loading notifications
    const timer = setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    toast.success("Notification marked as read");
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
    toast.success("Notification deleted");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
        return <Bell size={16} className="text-blue-500" />;
      case "reminder":
        return <Bell size={16} className="text-amber-500" />;
      case "report":
        return <Bell size={16} className="text-emerald-500" />;
      case "deadline":
        return <Bell size={16} className="text-purple-500" />;
      case "task":
        return <Bell size={16} className="text-red-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Notifications</h1>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All notifications</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                  </select>
                </div>
                
                <button 
                  onClick={markAllAsRead}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center"
                >
                  <Check size={16} className="mr-1" />
                  <span>Mark all read</span>
                </button>
                
                <button 
                  onClick={clearAllNotifications}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                >
                  <Trash2 size={16} className="mr-1" />
                  <span>Clear all</span>
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={itemVariants}
                      className={`p-4 border ${
                        notification.read 
                          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                          : 'bg-blue-50 dark:bg-gray-700/80 border-blue-100 dark:border-gray-600'
                      } rounded-lg shadow-sm`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900 dark:text-white' : 'text-blue-800 dark:text-blue-200'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {notification.message}
                          </p>
                        </div>
                        <div className="ml-3 flex flex-col space-y-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-red-500"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Bell size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filter !== 'all' ? `You don't have any ${filter} notifications.` : 'You have no notifications at this time.'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
}
