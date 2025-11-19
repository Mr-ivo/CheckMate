"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Dark mode disabled - always use light mode
  const [isDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Force light mode only
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    
    // Clear any dark mode settings from localStorage
    localStorage.removeItem('darkMode');
    
    setIsInitialized(true);
  }, []);

  // Disabled toggle function - does nothing
  const toggleTheme = () => {
    // Dark mode disabled - no action
    console.log('Dark mode is disabled');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
