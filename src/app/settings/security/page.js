"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import TwoFactorSetup from "@/components/security/TwoFactorSetup";
import BiometricSetup from "@/components/security/BiometricSetup";

export default function SecuritySettingsPage() {
  return (
    <ProtectedRoute>
      <SecuritySettings />
    </ProtectedRoute>
  );
}

function SecuritySettings() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <DashboardLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Settings</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
              <p className="text-gray-600">Manage your account security and authentication methods</p>
            </div>
          </div>
        </div>

        {/* Security Sections */}
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <TwoFactorSetup />
          </motion.div>

          {/* Biometric Authentication */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <BiometricSetup />
          </motion.div>

          {/* Security Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-3">🔒 Security Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Enable 2FA for an extra layer of protection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Use biometric login for faster and more secure access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Save your backup codes in a secure location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Review your active sessions regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Never share your password or 2FA codes with anyone</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
