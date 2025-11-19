'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield, 
  AlertTriangle,
  LogOut,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import authService from '@/services/auth.service';
import { toast } from 'react-hot-toast';

export default function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await authService.getSessions();
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error('Failed to load sessions');
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId) => {
    if (!confirm('Are you sure you want to logout this session?')) return;

    try {
      setActionLoading(sessionId);
      await authService.logoutSession(sessionId);
      toast.success('Session logged out successfully');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to logout session');
      console.error('Error logging out session:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout all other sessions? You will remain logged in on this device.')) return;

    try {
      setActionLoading('all');
      await authService.logoutAllSessions();
      toast.success('All other sessions logged out successfully');
      fetchSessions();
    } catch (error) {
      toast.error('Failed to logout all sessions');
      console.error('Error logging out all sessions:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getDeviceIcon = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getDeviceName = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome Browser';
    if (ua.includes('firefox')) return 'Firefox Browser';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari Browser';
    if (ua.includes('edge')) return 'Edge Browser';
    if (ua.includes('opera')) return 'Opera Browser';
    return 'Unknown Browser';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Sessions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your active login sessions across devices
          </p>
        </div>
        
        {sessions.length > 1 && (
          <button
            onClick={handleLogoutAll}
            disabled={actionLoading === 'all'}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                     transition-colors"
          >
            {actionLoading === 'all' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Logout All Others
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sessions.map((session) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 
                       ${session.isCurrent 
                         ? 'border-green-500 dark:border-green-600' 
                         : 'border-gray-200 dark:border-gray-700'}`}
            >
              <div className="flex items-start justify-between">
                {/* Device Info */}
                <div className="flex gap-4 flex-1">
                  {/* Device Icon */}
                  <div className={`p-3 rounded-lg ${
                    session.isCurrent 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {getDeviceIcon(session.userAgent)}
                  </div>

                  {/* Session Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {getDeviceName(session.userAgent)}
                      </h4>
                      {session.isCurrent && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 
                                       text-green-700 dark:text-green-400 text-xs rounded-full 
                                       flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Current Session
                        </span>
                      )}
                    </div>

                    {/* Location & IP */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{session.ipAddress}</span>
                      </div>
                      {session.location && (
                        <span>{session.location}</span>
                      )}
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Last active {getTimeAgo(session.lastActivity)}</span>
                    </div>

                    {/* Security Status */}
                    <div className="flex items-center gap-2 mt-3">
                      {session.isValid ? (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Shield className="w-3 h-3" />
                          <span>Secure</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Expired</span>
                        </div>
                      )}
                      
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        • Created {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                {!session.isCurrent && (
                  <button
                    onClick={() => handleLogoutSession(session._id)}
                    disabled={actionLoading === session._id}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                             rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Logout this session"
                  >
                    {actionLoading === session._id ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogOut className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sessions.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active sessions found</p>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                    rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Security Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• If you see an unfamiliar session, logout immediately and change your password</li>
              <li>• Always logout from public or shared devices</li>
              <li>• Enable 2FA for additional security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
