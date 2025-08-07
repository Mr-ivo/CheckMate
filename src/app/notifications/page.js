"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Check, ChevronLeft, Trash2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "react-hot-toast";
import apiService from "../../services/api.service";

// Import DashboardLayout
import DashboardLayout from "@/components/DashboardLayout";

export default function Notifications() {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: 1,
        limit: 50,
        unreadOnly: filter === 'unread' ? 'true' : 'false'
      };
      
      const response = await apiService.getNotifications(params);
      
      if (response.status === 'success') {
        // Transform backend data to match frontend format
        const transformedNotifications = response.data.notifications.map(notif => ({
          id: notif._id,
          title: notif.title,
          message: notif.message,
          time: formatTimeAgo(notif.createdAt),
          read: notif.isRead,
          type: notif.type || 'info',
          date: new Date(notif.createdAt).toISOString().split('T')[0],
          priority: notif.priority,
          _id: notif._id
        }));
        setNotifications(transformedNotifications);
      } else {
        console.error('Failed to fetch notifications:', response);
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return '1 week ago';
    return `${diffInWeeks} weeks ago`;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      
      // Update local state
      setNotifications(
        notifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiService.deleteNotification(id);
      
      // Remove from local state
      setNotifications(
        notifications.filter(notification => notification.id !== id)
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
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
