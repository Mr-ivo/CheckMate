'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Users,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '@/services/api.service';

export default function UserSecurityOverview() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    with2FA: 0,
    withBiometric: 0,
    locked: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...'); // DEBUG
      const data = await apiService.getUserSecurityStatus();
      console.log('Users data received:', data); // DEBUG
      
      // Add mock security fields for now (backend needs to provide these)
      const usersWithSecurity = (data.users || []).map(user => ({
        ...user,
        has2FA: false, // TODO: Get from backend
        hasBiometric: false, // TODO: Get from backend
        activeSessions: 0, // TODO: Get from backend
        isLocked: user.lockUntil && new Date(user.lockUntil) > new Date(),
        lastLogin: user.updatedAt
      }));
      
      console.log('Processed users:', usersWithSecurity); // DEBUG
      setUsers(usersWithSecurity);
      
      // Calculate stats
      const total = usersWithSecurity.length;
      const with2FA = usersWithSecurity.filter(u => u.has2FA).length;
      const withBiometric = usersWithSecurity.filter(u => u.hasBiometric).length;
      const locked = usersWithSecurity.filter(u => u.isLocked).length;
      
      setStats({ total, with2FA, withBiometric, locked });
    } catch (error) {
      console.error('Error fetching users - Full error:', error); // DEBUG
      toast.error('Failed to load user security status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async (userId, userName) => {
    if (!confirm(`Force logout all sessions for ${userName}?`)) return;

    try {
      await apiService.forceLogoutUser(userId);
      toast.success(`${userName} has been logged out from all sessions`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to force logout');
    }
  };

  const getSecurityScore = (user) => {
    let score = 0;
    if (user.has2FA) score += 40;
    if (user.hasBiometric) score += 30;
    if (user.activeSessions <= 2) score += 15;
    if (!user.isLocked) score += 15;
    return score;
  };

  const getSecurityBadge = (score) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-700', label: 'Excellent', icon: ShieldCheck };
    if (score >= 60) return { color: 'bg-blue-100 text-blue-700', label: 'Good', icon: Shield };
    if (score >= 40) return { color: 'bg-yellow-100 text-yellow-700', label: 'Fair', icon: ShieldAlert };
    return { color: 'bg-red-100 text-red-700', label: 'Poor', icon: ShieldAlert };
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 
                      p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 
                      p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.with2FA}</p>
              <p className="text-sm text-gray-600">With 2FA</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 
                      p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.withBiometric}</p>
              <p className="text-sm text-gray-600">With Biometric</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 
                      p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.locked}</p>
              <p className="text-sm text-gray-600">Locked Accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            User Security Status
          </h3>
          <button
            onClick={fetchUsers}
            className="px-3 py-2 bg-gray-200 text-gray-700 
                     rounded-lg hover:bg-gray-300 flex items-center gap-2 
                     transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {users.map((user) => {
            const score = getSecurityScore(user);
            const badge = getSecurityBadge(score);
            const BadgeIcon = badge.icon;

            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 
                         p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {user.name}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {user.email}
                      </p>

                      {/* Security Features */}
                      <div className="flex flex-wrap gap-2">
                        {user.has2FA ? (
                          <span className="px-2 py-1 bg-green-100 
                                       text-green-700 text-xs rounded-full 
                                       flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            2FA Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 
                                       text-gray-600 text-xs rounded-full 
                                       flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            No 2FA
                          </span>
                        )}

                        {user.hasBiometric ? (
                          <span className="px-2 py-1 bg-purple-100 
                                       text-purple-700 text-xs rounded-full 
                                       flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Biometric
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 
                                       text-gray-600 text-xs rounded-full 
                                       flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            No Biometric
                          </span>
                        )}

                        {user.isLocked ? (
                          <span className="px-2 py-1 bg-red-100 
                                       text-red-700 text-xs rounded-full 
                                       flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 
                                       text-green-700 text-xs rounded-full 
                                       flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            Active
                          </span>
                        )}

                        <span className="px-2 py-1 bg-blue-100 
                                     text-blue-700 text-xs rounded-full">
                          {user.activeSessions || 0} Active Sessions
                        </span>
                      </div>

                      {/* Last Login */}
                      {user.lastLogin && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last login: {new Date(user.lastLogin).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleForceLogout(user._id, user.name)}
                    disabled={user.activeSessions === 0}
                    className="p-2 text-red-600 hover:bg-red-50 
                             rounded-lg transition-colors disabled:opacity-50 
                             disabled:cursor-not-allowed"
                    title="Force logout all sessions"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

