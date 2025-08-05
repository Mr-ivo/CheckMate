"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import authService from "@/services/auth.service";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Create a full-screen loader element
  const FullScreenLoader = () => (
    <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 z-[9999] flex flex-col items-center justify-center backdrop-blur-md">
      <div className="logo-loader scale-150 mb-4">
        <Image 
          src="/checkmate-logo.png" 
          alt="Loading" 
          width={100} 
          height={100}
          priority
        />
      </div>
      <p className="text-gray-800 dark:text-gray-200 font-medium mt-4">Signing in...</p>
    </div>
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Display login attempt toast
      const loadingToast = toast.loading("Logging in...");
      
      // Pre-navigate to dashboard to start loading it
      // This will make the transition faster
      const authPromise = authService.login(data.email, data.password);
      
      // Set a timeout to ensure we don't wait too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timed out')), 5000);
      });
      
      // Race between auth and timeout
      const result = await Promise.race([authPromise, timeoutPromise]);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      toast.success("Login successful!");
      
      // Store the user role
      try {
        localStorage.setItem('checkmate_user_role', result.user.role);
        sessionStorage.setItem('checkmate_user_role', result.user.role);
      } catch (storageError) {
        console.warn('Storage error:', storageError);
      }
      
      // Navigate immediately
      window.location.href = '/dashboard';
    } catch (error) {
      // Provide more detailed error messages
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.message) {
        errorMessage = error.message;
        
        // Add helpful context for specific errors
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorMessage = "Network error: Cannot connect to server. Please check your internet connection.";
        } else if (error.message.includes('401')) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes('CORS')) {
          errorMessage = "Access error: Your browser is blocking the connection. Please try a different browser.";
        } else if (error.message.includes('timed out')) {
          errorMessage = "Login is taking too long. Redirecting you anyway...";
          // If it's a timeout, we'll still try to navigate
          window.location.href = '/dashboard';
        }
      }
      
      if (!error.message?.includes('timed out')) {
        toast.error(errorMessage);
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="px-8 pt-8 pb-6 text-center">
          {/* Original CheckMate logo */}
          <div className="flex justify-center mb-4">
            <Image 
              src="/checkmate-logo.png" 
              alt="CheckMate Logo" 
              width={180} 
              height={180} 
              className="h-auto w-auto sm:max-w-[160px] max-w-[140px]" 
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Sign in to your account to continue</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`w-full px-4 py-3 rounded-lg border text-gray-900 ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-white`}
                placeholder="you@example.com"
                {...register("email", { 
                  required: "Email is required", 
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Please enter a valid email"
                  }
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 text-left">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-white`}
                  placeholder="••••••••"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 text-left">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  {...register("remember")}
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 flex justify-center items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>
        
        {/* Footer content removed as registration is admin-only */}
      </motion.div>
    </div>
  );
}
