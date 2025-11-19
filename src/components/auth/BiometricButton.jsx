"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Smartphone, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { startAuthentication } from "@simplewebauthn/browser";
import authService from "@/services/auth.service";

/**
 * BiometricButton Component
 * Handles biometric authentication (fingerprint, Face ID, etc.)
 */
export default function BiometricButton({ email, onSuccess, className = "" }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceType, setDeviceType] = useState("fingerprint");

  useEffect(() => {
    // Check if WebAuthn is supported
    const supported = authService.isWebAuthnSupported();
    setIsSupported(supported);

    // Detect device type
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('iPhone') || ua.includes('iPad')) {
        setDeviceType("faceid");
      } else if (ua.includes('Android')) {
        setDeviceType("fingerprint");
      } else if (ua.includes('Mac')) {
        setDeviceType("touchid");
      } else {
        setDeviceType("biometric");
      }
    }
  }, []);

  const handleBiometricLogin = async () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Get authentication options from server
      const options = await authService.getBiometricAuthOptions(email);

      if (!options) {
        toast.error("No biometric credentials found. Please register first.");
        setIsLoading(false);
        return;
      }

      // Step 2: Trigger biometric prompt
      toast.loading("Touch your sensor or look at the camera...", { id: "biometric" });
      
      const credential = await startAuthentication(options);

      // Step 3: Verify with server
      const result = await authService.verifyBiometricAuth(email, credential);

      toast.dismiss("biometric");
      toast.success("Biometric authentication successful!");

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      toast.dismiss("biometric");
      console.error("Biometric authentication error:", error);

      // User-friendly error messages
      if (error.name === "NotAllowedError") {
        toast.error("Biometric authentication cancelled");
      } else if (error.name === "InvalidStateError") {
        toast.error("Biometric sensor not available");
      } else if (error.message.includes("No biometric credentials")) {
        toast.error("Please register your biometric first in settings");
      } else {
        toast.error(error.message || "Biometric authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if not supported
  if (!isSupported) {
    return null;
  }

  // Get icon and text based on device type
  const getIcon = () => {
    switch (deviceType) {
      case "faceid":
        return <Smartphone className="w-5 h-5" />;
      case "touchid":
      case "fingerprint":
        return <Fingerprint className="w-5 h-5" />;
      default:
        return <Fingerprint className="w-5 h-5" />;
    }
  };

  const getText = () => {
    switch (deviceType) {
      case "faceid":
        return "Login with Face ID";
      case "touchid":
        return "Login with Touch ID";
      case "fingerprint":
        return "Login with Fingerprint";
      default:
        return "Login with Biometric";
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleBiometricLogin}
      disabled={isLoading || !email}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full flex items-center justify-center gap-2 px-4 py-3 
        border-2 border-green-600 text-green-600 rounded-lg 
        font-medium hover:bg-green-50 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            {getIcon()}
          </motion.div>
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          {getIcon()}
          <span>{getText()}</span>
        </>
      )}
    </motion.button>
  );
}

/**
 * BiometricSetupPrompt Component
 * Shows a prompt to set up biometric authentication
 */
export function BiometricSetupPrompt({ onSetup }) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(authService.isWebAuthnSupported());
  }, []);

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Biometric authentication not supported
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Your browser or device doesn't support biometric authentication.
              Try using Chrome, Safari, or Edge on a device with a biometric sensor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Fingerprint className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            Enable Biometric Login
          </p>
          <p className="text-xs text-green-700 mt-1 mb-3">
            Login faster and more securely with your fingerprint or Face ID.
          </p>
          <button
            onClick={onSetup}
            className="text-xs font-medium text-green-600 hover:text-green-700 underline"
          >
            Set up now →
          </button>
        </div>
      </div>
    </div>
  );
}
