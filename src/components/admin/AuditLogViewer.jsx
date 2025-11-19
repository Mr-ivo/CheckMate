'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  User, 
  LogIn, 
  LogOut, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '@/services/api.service';

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [filter, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAuditLogs({ 
        action: filter !== 'all' ? filter : undefined,
        page,
        limit: 20
      });
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      'login': <LogIn className="w-4 h-4" />,
      'logout': <LogOut className="w-4 h-4" />,
      '2fa_enabled': <Shield className="w-4 h-4" />,
      '2fa_disabled': <Shield className="w-4 h-4" />,
      'password_changed': <Settings className="w-4 h-4" />,
      'failed_login': <XCircle className="w-4 h-4" />,
      'account_locked': <AlertTriangle className="w-4 h-4" />,
      'session_terminated': <LogOut className="w-4 h-4" />
    };
    return icons[action] || <Shield className="w-4 h-4" />;
  };

  const getActionColor = (action) => {
    const colors = {
      'login': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      'logout': 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      '2fa_enabled': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      '2fa_disabled': 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      'password_changed': 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
      'failed_login': 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      'account_locked': 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      'session_terminated': 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
    };
    return colors[action] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
  };

  const getActionLabel = (action) => {
    const labels = {
      'login': 'Login',
      'logout': 'Logout',
      '2fa_enabled': '2FA Enabled',
      '2fa_disabled': '2FA Disabled',
      'password_changed': 'Password Changed',
      'failed_login': 'Failed Login',
      'account_locked': 'Account Locked',
      'session_terminated': 'Session Terminated'
    };
    return labels[action] || action;
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      'low': { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Low' },
      'medium': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Medium' },
      'high': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' },
      'critical': { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Critical' }
    };
    return badges[severity] || badges['low'];
  };

  const formatTimestamp = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.userEmail?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.ipAddress?.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = () => {
    toast.success('Export feature coming soon!');
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
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Security Audit Logs
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track all security-related activities
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                     rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 
                     transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 
                          text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, action, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 
                     dark:text-white"
          />
        </div>

        {/* Action Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Actions</option>
          <option value="login">Logins</option>
          <option value="logout">Logouts</option>
          <option value="failed_login">Failed Logins</option>
          <option value="2fa_enabled">2FA Enabled</option>
          <option value="2fa_disabled">2FA Disabled</option>
          <option value="password_changed">Password Changes</option>
          <option value="account_locked">Account Locks</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredLogs.map((log) => {
            const severity = getSeverityBadge(log.severity || 'low');
            
            return (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 
                         dark:border-gray-700 p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Action Icon */}
                  <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>

                  {/* Log Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {getActionLabel(log.action)}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {log.userEmail || 'Unknown User'}
                        </p>
                      </div>
                      
                      <span className={`px-2 py-1 text-xs rounded-full ${severity.color}`}>
                        {severity.label}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                      
                      {log.ipAddress && (
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>{log.ipAddress}</span>
                        </div>
                      )}
                      
                      {log.userAgent && (
                        <div className="flex items-center gap-1 truncate">
                          <span>💻</span>
                          <span className="truncate max-w-xs">
                            {log.userAgent.substring(0, 50)}...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional Details */}
                    {log.details && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 
                                    bg-gray-50 dark:bg-gray-900 rounded p-2">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No audit logs found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                     rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                     rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 
                     disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
