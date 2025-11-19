"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, Key, Copy, Check, RefreshCw, AlertCircle, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import authService from "@/services/auth.service";

/**
 * TwoFactorSetup Component
 * Allows users to enable/disable 2FA and manage backup codes
 */
export default function TwoFactorSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalAction, setModalAction] = useState(""); // 'enable', 'disable', 'regenerate'
  const [stats, setStats] = useState({
    lastUsed: null,
    totalUsed: 0,
    remainingBackupCodes: 0
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await authService.get2FAStatus();
      setIsEnabled(response.data.enabled);
      setStats({
        lastUsed: response.data.lastUsed,
        totalUsed: response.data.totalUsed,
        remainingBackupCodes: response.data.remainingBackupCodes || 0
      });
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await authService.enable2FA();
      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      setIsEnabled(true);
      toast.success("2FA enabled successfully!");
      await fetchStatus();
    } catch (error) {
      toast.error(error.message || "Failed to enable 2FA");
    } finally {
      setIsLoading(false);
      setShowPasswordModal(false);
      setPassword("");
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      await authService.disable2FA(password);
      setIsEnabled(false);
      setBackupCodes([]);
      setShowBackupCodes(false);
      toast.success("2FA disabled successfully");
      await fetchStatus();
    } catch (error) {
      toast.error(error.message || "Failed to disable 2FA");
    } finally {
      setIsLoading(false);
      setShowPasswordModal(false);
      setPassword("");
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.regenerateBackupCodes(password);
      setBackupCodes(response.data.backupCodes);
      setShowBackupCodes(true);
      toast.success("Backup codes regenerated!");
      await fetchStatus();
    } catch (error) {
      toast.error(error.message || "Failed to regenerate codes");
    } finally {
      setIsLoading(false);
      setShowPasswordModal(false);
      setPassword("");
    }
  };

  const openPasswordModal = (action) => {
    setModalAction(action);
    setShowPasswordModal(true);
    setPassword("");
  };

  const handleModalSubmit = () => {
    if (modalAction === "enable") handleEnable2FA();
    else if (modalAction === "disable") handleDisable2FA();
    else if (modalAction === "regenerate") handleRegenerateBackupCodes();
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success("Backup codes copied to clipboard!");
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checkmate-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded!");
  };

  if (isLoading && !showBackupCodes) {
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
            <Shield className="w-5 h-5 text-green-600" />
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={() => openPasswordModal(isEnabled ? "disable" : "enable")}
          disabled={isLoading}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isEnabled ? "bg-green-600" : "bg-gray-300"}
            ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEnabled ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
      </div>

      {/* Status Card */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900">2FA is Active</p>
              <p className="text-sm text-green-700 mt-1">
                Your account is protected with two-factor authentication
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-green-600">Times Used</p>
                  <p className="font-semibold text-green-900">{stats.totalUsed}</p>
                </div>
                <div>
                  <p className="text-green-600">Backup Codes Left</p>
                  <p className="font-semibold text-green-900">{stats.remainingBackupCodes}/10</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* How it Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          How it works
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter your password as usual</li>
          <li>• Receive a 6-digit code via email</li>
          <li>• Enter the code to complete login</li>
          <li>• Use backup codes if email is unavailable</li>
        </ul>
      </div>

      {/* Backup Codes Section */}
      {isEnabled && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Backup Codes
            </h4>
            <button
              onClick={() => openPasswordModal("regenerate")}
              disabled={isLoading}
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            Save these codes in a safe place. Each code can only be used once.
          </p>

          {stats.remainingBackupCodes < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  You're running low on backup codes. Consider regenerating them.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backup Codes Modal */}
      <AnimatePresence>
        {showBackupCodes && backupCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBackupCodes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Save Your Backup Codes
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                These codes will only be shown once. Save them in a secure location.
              </p>

              {/* Codes Grid */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded border border-gray-200 text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={copyBackupCodes}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copiedCodes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCodes ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadBackupCodes}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <button
                onClick={() => setShowBackupCodes(false)}
                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                I've Saved My Codes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {modalAction === "enable" && "Enable 2FA"}
                {modalAction === "disable" && "Disable 2FA"}
                {modalAction === "regenerate" && "Regenerate Backup Codes"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {modalAction === "enable" && "Confirm your password to enable two-factor authentication"}
                {modalAction === "disable" && "Enter your password to disable 2FA"}
                {modalAction === "regenerate" && "Enter your password to regenerate backup codes"}
              </p>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none mb-4"
                onKeyPress={(e) => e.key === "Enter" && handleModalSubmit()}
                autoFocus
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSubmit}
                  disabled={!password || isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
