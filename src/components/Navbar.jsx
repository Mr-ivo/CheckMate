"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, Moon, Sun, Bell, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar({ toggleSidebar }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const pathname = usePathname();
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Ignore clicks on the toggle button itself
      if (event.target.closest('[aria-label="Toggle navigation menu"]')) {
        return;
      }
      
      // Close menu when clicking outside
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);
  
  // Handle click outside to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationRef]);

  // Mock notifications
  const notifications = [
    { id: 1, text: "New intern joined the Mobile Development team", time: "5 minutes ago", read: false },
    { id: 2, text: "Marketing department meeting at 2:00 PM", time: "1 hour ago", read: false },
    { id: 3, text: "Attendance report ready for review", time: "3 hours ago", read: true },
  ];

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Interns', href: '/interns' },
    { name: 'Attendance', href: '/attendance' },
    { name: 'Reports', href: '/reports' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 fixed w-full z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image 
                  src="/Screenshot__9_-removebg-preview.png" 
                  alt="CheckMate Logo" 
                  width={70} 
                  height={70} 
                  className="h-9 w-auto" 
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-gray-700 dark:text-emerald-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            {toggleSidebar && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none mr-2"
                aria-label="Toggle sidebar"
              >
                <ChevronRight size={16} />
              </button>
            )}
            <div className="relative" ref={notificationRef}>
              <button
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none relative"
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div 
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</h3>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">Mark all as read</span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notification.read ? '' : 'bg-blue-50 dark:bg-gray-700/60'}`}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              {notification.read ? null : <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="text-sm text-gray-800 dark:text-gray-200">{notification.text}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No new notifications
                      </div>
                    )}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Link href="/notifications" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Force state to toggle properly
                setShowMobileMenu(prevState => !prevState);
                console.log('Mobile menu toggled!');
              }}
              className="ml-2 md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
              aria-expanded={showMobileMenu}
              aria-label="Toggle navigation menu"
              type="button"
              style={{ 
                touchAction: 'manipulation',
                position: 'relative',
                zIndex: 60 
              }}
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay and container */}
      {showMobileMenu && (
        <>
          {/* Backdrop overlay - higher z-index than navbar but lower than content */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: 55 }}
            onClick={() => setShowMobileMenu(false)}
          />
          
          {/* Menu container - highest z-index */}
          <div 
            className="fixed top-16 inset-x-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800"
            style={{ zIndex: 59 }}
            ref={mobileMenuRef}
          >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: 0.05 * index,
                      type: "spring",
                      stiffness: 300,
                      damping: 15
                    }}
                  >
                    <Link
                      href={link.href}
                      className={`block px-3 py-3 rounded-md text-base font-medium flex items-center ${
                        pathname === link.href
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-gray-700 dark:text-emerald-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <motion.div 
                        className="mr-3 flex items-center justify-center w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-900/30"
                        whileHover={{ scale: 1.1 }}
                      >
                        {link.name === 'Dashboard' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
                        {link.name === 'Interns' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>}
                        {link.name === 'Attendance' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
                        {link.name === 'Reports' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" clipRule="evenodd" /></svg>}
                        {link.name === 'Settings' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>}
                      </motion.div>
                      <span>{link.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
          </div>
        </>
      )}
    </nav>
  );
}
