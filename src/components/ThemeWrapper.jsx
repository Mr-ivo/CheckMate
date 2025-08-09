"use client";

import { useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';

/**
 * ThemeWrapper component ensures consistent dark mode application
 * across all child components by applying theme classes to the wrapper
 */
export default function ThemeWrapper({ children, className = "" }) {
  const { isDarkMode, isInitialized } = useTheme();

  useEffect(() => {
    // Ensure theme is applied to document when component mounts
    if (isInitialized) {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
    }
  }, [isDarkMode, isInitialized]);

  // Don't render until theme is initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div 
      className={`${
        isDarkMode ? 'dark bg-dark-bg text-dark-text' : 'bg-white text-gray-900'
      } transition-colors duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Hook to get theme-aware CSS classes for common UI elements
 */
export function useThemeClasses() {
  const { isDarkMode } = useTheme();

  return {
    // Background classes
    bg: {
      primary: isDarkMode ? 'bg-dark-bg' : 'bg-white',
      secondary: isDarkMode ? 'bg-dark-surface' : 'bg-gray-50',
      card: isDarkMode ? 'bg-dark-card' : 'bg-white',
      hover: isDarkMode ? 'hover:bg-dark-surface' : 'hover:bg-gray-50',
    },
    
    // Text classes
    text: {
      primary: isDarkMode ? 'text-dark-text' : 'text-gray-900',
      secondary: isDarkMode ? 'text-dark-muted' : 'text-gray-600',
      muted: isDarkMode ? 'text-dark-muted' : 'text-gray-500',
    },
    
    // Border classes
    border: {
      default: isDarkMode ? 'border-dark-border' : 'border-gray-200',
      light: isDarkMode ? 'border-dark-border' : 'border-gray-100',
      focus: 'focus:border-emerald-500 focus:ring-emerald-500',
    },
    
    // Input classes
    input: {
      base: `${isDarkMode ? 'bg-dark-card border-dark-border text-dark-text' : 'bg-white border-gray-300 text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`,
      error: `${isDarkMode ? 'border-red-500 bg-dark-card text-dark-text' : 'border-red-500 bg-white text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500`,
    },
    
    // Button classes
    button: {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      secondary: isDarkMode 
        ? 'bg-dark-surface hover:bg-dark-border text-dark-text border border-dark-border' 
        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
      ghost: isDarkMode 
        ? 'hover:bg-dark-surface text-dark-text' 
        : 'hover:bg-gray-100 text-gray-700',
    },
    
    // Modal/dropdown classes
    modal: {
      backdrop: isDarkMode ? 'bg-black/50' : 'bg-black/25',
      content: isDarkMode 
        ? 'bg-dark-card border-dark-border text-dark-text' 
        : 'bg-white border-gray-200 text-gray-900',
    }
  };
}
