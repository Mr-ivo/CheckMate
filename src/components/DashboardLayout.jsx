"use client";

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '@/context/ThemeContext';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Start expanded on desktop
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode } = useTheme();

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse on small screens
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };



  return (
    <div 
      data-dashboard="true"
      className={`flex flex-col md:flex-row h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-dark-bg dark' : 'bg-gray-100'
      }`} 
      style={{ overflowY: 'auto', overflowX: 'hidden' }}>
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50" 
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed z-50' : 'relative'} ${sidebarCollapsed && isMobile ? 'hidden' : ''}`}>
        <Sidebar isCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-dark-bg' 
          : 'bg-gray-50'
      } ${!isMobile && !sidebarCollapsed ? 'ml-64' : !isMobile && sidebarCollapsed ? 'ml-16' : 'ml-0'}`}>
        {/* Top Navigation Bar */}
        <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Main Content */}
        <main className={`flex-1 pb-20 md:pb-0 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-dark-bg text-dark-text' 
            : 'bg-gray-50 text-gray-900'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
