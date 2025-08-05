"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import authService from "@/services/auth.service";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Create a loader element
    const loaderDiv = document.createElement('div');
    loaderDiv.id = 'logout-loader';
    loaderDiv.innerHTML = `
      <div class="fixed inset-0 bg-white/90 dark:bg-gray-900/90 z-[9999] flex flex-col items-center justify-center backdrop-blur-md">
        <div class="loader-container">
          <div class="loader-bg"></div>
          <img src="/checkmate-logo.png" alt="Loading" width="180" height="180" class="animate-loader" />
          <p class="text-gray-800 dark:text-gray-200 font-medium mt-6 text-lg">Logging out...</p>
        </div>
      </div>
    `;
    document.body.appendChild(loaderDiv);

    // Perform logout after a short delay for better UX
    const timer = setTimeout(() => {
      // Call the logout method from auth service
      authService.logout();
      
      // Redirect to login page
      router.push("/login");
    }, 1500);

    return () => {
      clearTimeout(timer);
      // Clean up the loader if component unmounts
      const loaderElement = document.getElementById('logout-loader');
      if (loaderElement) {
        document.body.removeChild(loaderElement);
      }
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/checkmate-logo.png" 
              alt="CheckMate Logo" 
              width={160} 
              height={160} 
              className="h-auto w-auto sm:max-w-[160px] max-w-[140px]" 
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Logging Out</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please wait while we securely log you out...</p>
        </div>
      </motion.div>
    </div>
  );
}
