"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, RefreshCw, Key } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * TwoFactorInput Component
 * Handles OTP and backup code input for 2FA
 */
export default function TwoFactorInput({ 
  email, 
  onVerify, 
  onResend, 
  isLoading 
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every(digit => digit !== "") && !useBackupCode) {
      handleSubmit(newCode.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error("Please paste numbers only");
      return;
    }

    const newCode = pastedData.split("");
    while (newCode.length < 6) newCode.push("");
    setCode(newCode);

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6) {
      handleSubmit(pastedData);
    }
  };

  // Submit code
  const handleSubmit = (codeValue) => {
    const finalCode = codeValue || (useBackupCode ? backupCode : code.join(""));
    
    if (!finalCode || (useBackupCode && finalCode.length < 8)) {
      toast.error(useBackupCode ? "Please enter backup code" : "Please enter complete code");
      return;
    }

    onVerify(finalCode, useBackupCode);
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await onResend();
      setResendCooldown(60); // 60 second cooldown
      toast.success("New code sent to your email");
    } catch (error) {
      toast.error(error.message || "Failed to resend code");
    }
  };

  // Toggle backup code mode
  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    setCode(["", "", "", "", "", ""]);
    setBackupCode("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Two-Factor Authentication
        </h2>
        <p className="text-gray-600">
          {useBackupCode 
            ? "Enter your backup code"
            : `Enter the 6-digit code sent to ${email}`
          }
        </p>
      </div>

      {/* OTP Input */}
      {!useBackupCode ? (
        <div className="mb-6">
          <div className="flex gap-2 justify-center mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Resend Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="text-sm text-green-600 hover:text-green-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              {resendCooldown > 0 
                ? `Resend in ${resendCooldown}s` 
                : "Resend Code"
              }
            </button>
          </div>
        </div>
      ) : (
        /* Backup Code Input */
        <div className="mb-6">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              maxLength={8}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all text-center text-lg font-mono tracking-wider disabled:bg-gray-100"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Backup codes are 8 characters long
          </p>
        </div>
      )}

      {/* Submit Button (for backup code) */}
      {useBackupCode && (
        <button
          onClick={() => handleSubmit()}
          disabled={isLoading || backupCode.length < 8}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? "Verifying..." : "Verify Backup Code"}
        </button>
      )}

      {/* Toggle Backup Code */}
      <div className="text-center">
        <button
          type="button"
          onClick={toggleBackupCode}
          disabled={isLoading}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium disabled:text-gray-400"
        >
          {useBackupCode 
            ? "← Use verification code instead" 
            : "Use backup code instead →"
          }
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Check your email for the 6-digit code. 
          It expires in 10 minutes.
        </p>
      </div>
    </motion.div>
  );
}
