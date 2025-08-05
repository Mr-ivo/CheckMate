"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Create context
const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: () => {},
});

// Hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

export default function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Force initial loading state to true
  useEffect(() => {
    // Set initial loading state
    setIsLoading(true);
    
    // Add a class to the body to prevent scrolling during loading
    document.body.classList.add('loading-active');
    
    // Simulate minimum loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.classList.remove('loading-active');
    }, 1000); // Increased to 1 second for better visibility
    
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('loading-active');
    };
  }, [pathname, searchParams]);

  // Manual navigation trigger function
  const triggerLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigation = () => triggerLoading();
    window.addEventListener('navigation-start', handleNavigation);
    return () => window.removeEventListener('navigation-start', handleNavigation);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, triggerLoading }}>
      {/* Global loading overlay - always rendered but only visible when isLoading is true */}
      <div className={`fixed inset-0 bg-white/90 dark:bg-gray-900/90 z-[9999] flex items-center justify-center backdrop-blur-md transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="logo-loader scale-150">
          <Image 
            src="/checkmate-logo.png" 
            alt="Loading" 
            width={100} 
            height={100}
            priority
          />
        </div>
      </div>
      {children}
    </LoadingContext.Provider>
  );
}
