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
    <div className="fixed inset-0 bg-white/90 z-[9999] flex flex-col items-center justify-center backdrop-blur-md">
      <div className="logo-loader scale-150 mb-4">
        <Image 
          src="/checkmate-logo.png" 
          alt="Loading" 
          width={100} 
          height={100}
          priority
        />
      </div>
      <p className="text-gray-800 font-medium mt-4">Signing in...</p>
    </div>
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const loadingToast = toast.loading("Logging in...");
      
      const authPromise = authService.login(data.email, data.password);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timed out')), 5000);
      });

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
    <div data-page="login" className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6"
      >
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Image 
              src="/checkmate-logo.png" 
              alt="CheckMate Logo" 
              width={160} 
              height={160} 
              className="h-40 w-40 object-contain" 
            />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-sm text-gray-600">Sign in to your account to continue</p>
        </div>
          
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-3 py-3 border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
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
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                {...register("remember")}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-green-600 hover:text-green-500"
            >
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
          </form>
      </motion.div>
    </div>
  );
}
