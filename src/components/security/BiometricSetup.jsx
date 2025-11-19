"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Smartphone, Trash2, Plus, AlertCircle, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { startRegistration } from "@simplewebauthn/browser";
import authService from "@/services/auth.service";

/**
 * BiometricSetup Component
 * Allows users to register and manage biometric credentials
 */
export default function BiometricSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [deviceName, setDeviceName] = useState("");

  useEffect(() => {
    // Check if WebAuthn is supported
    const supported = authService.isWebAuthnSupported();
    setIsSupported(supported);
    
    if (supported) {
      fetchCredentials();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCredentials = async () => {
    try {
      const response = await authService.getBiometricCredentials();
      setCredentials(response.data.credentials);
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!deviceName.trim()) {
      toast.error("Please enter a device name");
      return;
    }

    setIsRegistering(true);
    setShowNameModal(false);

    try {
      // Step 1: Get registration options from server
      toast.loading("Preparing registration...", { id: "biometric-reg" });
      const options = await authService.getBiometricRegistrationOptions();

      // Step 2: Trigger biometric prompt
      toast.loading("Touch your sensor or look at the camera...", { id: "biometric-reg" });
      const credential = await startRegistration(options);

      // Step 3: Verify registration with server
      toast.loading("Verifying...", { id: "biometric-reg" });
      await authService.verifyBiometricRegistration(credential, deviceName);

      toast.dismiss("biometric-reg");
      toast.success("Biometric registered successfully!");

      // Refresh credentials list
      await fetchCredentials();
      setDeviceName("");
    } catch (error) {
      toast.dismiss("biometric-reg");
      console.error("Registration error:", error);

      if (error.name === "NotAllowedError") {
        toast.error("Registration cancelled");
      } else if (error.name === "InvalidStateError") {
        toast.error("This device is already registered");
      } else {
        toast.error(error.message || "Registration failed");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (credentialId, name) => {
    if (!confirm(`Remove "${name}" from your account?`)) return;

    try {
      await authService.deleteBiometricCredential(credentialId);
      toast.success("Biometric credential removed");
      await fetchCredentials();
    } catch (error) {
      toast.error(error.message || "Failed to remove credential");
    }
  };

  const getDeviceIcon = (deviceInfo) => {
    if (deviceInfo?.device === "Mobile" || deviceInfo?.os === "iOS" || deviceInfo?.os === "Android") {
      return <Smartphone className="w-5 h-5" />;
    }
    return <Fingerprint className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Biometric authentication not supported</p>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser or device doesn't support biometric authentication. 
              Try using Chrome, Safari, or Edge on a device with a biometric sensor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-green-600" />
            Biometric Authentication
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Login with your fingerprint or face recognition
          </p>
        </div>
        
        <button
          onClick={() => setShowNameModal(true)}
          disabled={isRegistering}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Register your fingerprint or face on this device</li>
          <li>• Login instantly without typing passwords</li>
          <li>• Your biometric data never leaves your device</li>
          <li>• Register multiple devices for convenience</li>
        </ul>
      </div>

      {/* Credentials List */}
      {credentials.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Registered Devices ({credentials.length})</h4>
          
          {credentials.map((cred) => (
            <motion.div
              key={cred.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    {getDeviceIcon(cred.deviceInfo)}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{cred.name}</h5>
                    <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                      <p>
                        {cred.deviceInfo?.browser} • {cred.deviceInfo?.os}
                      </p>
                      <p>
                        Added: {formatDate(cred.createdAt)}
                      </p>
                      <p>
                        Last used: {formatDate(cred.lastUsed)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Used {cred.usageCount} times
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(cred.id, cred.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Fingerprint className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No biometric devices registered</p>
          <p className="text-sm text-gray-500 mb-4">
            Add your first device to enable passwordless login
          </p>
          <button
            onClick={() => setShowNameModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register Now
          </button>
        </div>
      )}

      {/* Device Name Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Register Biometric Device
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Give this device a name so you can identify it later
              </p>

              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., My iPhone, Work Laptop"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none mb-4"
                onKeyPress={(e) => e.key === "Enter" && handleRegister()}
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNameModal(false);
                    setDeviceName("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={!deviceName.trim() || isRegistering}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? "Registering..." : "Continue"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
