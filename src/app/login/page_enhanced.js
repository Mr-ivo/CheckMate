"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeOffIcon, ArrowLeft, AlertCircle, Clock } from "lucide-react";
import authService from "@/services/auth.service";
import TwoFactorInput from "@/components/auth/TwoFactorInput";
import BiometricButton from "@/components/auth/BiometricButton";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState("credentials"); // credentials, 2fa, locked
  const [userEmail, setUserEmail] = useState("");
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const emailValue = watch("email");

  // Full-screen loader
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

  // Handle initial login (email + password)
  const onSubmit = async (data) => {
    setIsLoading(true);
    setUserEmail(data.email);
    
    try {
      const result = await authService.login(data.email, data.password);
      
      // Check if 2FA is required
      if (result.requires2FA) {
        toast.success("Password verified! Please enter your 2FA code.");
        
        // Automatically send OTP
        try {
          await authService.sendOTP(data.email);
          toast.success("Verification code sent to your email");
        } catch (error) {
          console.error("Failed to send OTP:", error);
        }
        
        setLoginStep("2fa");
        setIsLoading(false);
        return;
      }
      
      // No 2FA - direct login successful
      toast.success("Login successful!");
      
      // Store user role
      try {
        localStorage.setItem('checkmate_user_role', result.user.role);
        sessionStorage.setItem('checkmate_user_role', result.user.role);
      } catch (storageError) {
        console.warn('Storage error:', storageError);
      }
      
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      setIsLoading(false);
      
      // Handle account lockout (423 status)
      if (error.message.includes('locked') || error.message.includes('423')) {
        const lockMatch = error.message.match(/(\d+)\s+minutes?/);
        const remainingMinutes = lockMatch ? parseInt(lockMatch[1]) : 30;
        
        setLockoutInfo({
          remainingMinutes,
          message: error.message
        });
        setLoginStep("locked");
        toast.error("Account temporarily locked");
        return;
      }
      
      // Handle other errors
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.message) {
        errorMessage = error.message;
        
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorMessage = "Network error: Cannot connect to server.";
        } else if (error.message.includes('401')) {
          errorMessage = "Invalid email or password.";
        }
      }
      
      toast.error(errorMessage);
      console.error("Login error:", error);
    }
  };

  // Handle 2FA verification
  const handle2FAVerify = async (code, useBackupCode) => {
    setIsLoading(true);
    
    try {
      const result = await authService.loginWith2FA(userEmail, code, useBackupCode);
      
      toast.success("2FA verification successful!");
      
      // Store user role
      try {
        localStorage.setItem('checkmate_user_role', result.user.role);
        sessionStorage.setItem('checkmate_user_role', result.user.role);
      } catch (storageError) {
        console.warn('Storage error:', storageError);
      }
      
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message || "2FA verification failed");
      console.error("2FA error:", error);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    await authService.sendOTP(userEmail);
  };

  // Handle biometric success
  const handleBiometricSuccess = (result) => {
    toast.success("Biometric authentication successful!");
    
    // Store user role
    try {
      localStorage.setItem('checkmate_user_role', result.user.role);
      sessionStorage.setItem('checkmate_user_role', result.user.role);
    } catch (storageError) {
      console.warn('Storage error:', storageError);
    }
    
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  // Back to credentials
  const backToCredentials = () => {
    setLoginStep("credentials");
    setUserEmail("");
    setLockoutInfo(null);
  };

  return (
    <div data-page="login" className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {isLoading && loginStep === "credentials" && <FullScreenLoader />}
      
      <AnimatePresence mode="wait">
        {/* STEP 1: Email + Password */}
        {loginStep === "credentials" && (
          <motion.div 
            key="credentials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
              <p className="text-sm text-gray-600">Sign in to your account to continue</p>
            </div>

            {/* Biometric Login Button */}
            <BiometricButton 
              email={emailValue}
              onSuccess={handleBiometricSuccess}
              className="mb-4"
            />

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
              
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
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
                    className={`w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2: 2FA Verification */}
        {loginStep === "2fa" && (
          <motion.div
            key="2fa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-lg shadow-md p-6"
          >
            <button
              onClick={backToCredentials}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to login</span>
            </button>

            <TwoFactorInput
              email={userEmail}
              onVerify={handle2FAVerify}
              onResend={handleResendOTP}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* STEP 3: Account Locked */}
        {loginStep === "locked" && lockoutInfo && (
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-white rounded-lg shadow-md p-6"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account Temporarily Locked
              </h2>
              
              <p className="text-gray-600 mb-6">
                Too many failed login attempts. Your account has been locked for security.
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 justify-center text-yellow-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">
                    Locked for {lockoutInfo.remainingMinutes} minutes
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  Please wait before trying again, or contact support if you need immediate access.
                </p>
              </div>

              <button
                onClick={backToCredentials}
                className="w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
