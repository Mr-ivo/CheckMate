'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  LogIn,
  LogOut,
  Activity,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '@/services/api.service';

export default function InternDashboard() {
  const [loading, setLoading] = useState(true);
  const [internData, setInternData] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    attendanceRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchInternData();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchInternData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('checkmate_user_id');
      
      if (!userId) {
        toast.error('User not found');
        return;
      }

      // Get intern record
      const internResponse = await apiService.fetchData(`interns/user/${userId}`);
      const intern = internResponse?.data?.intern;
      
      if (!intern) {
        toast.error('Intern record not found');
        return;
      }

      setInternData(intern);

      // Get today's status
      const todayResponse = await apiService.fetchData(`attendance/intern/${intern._id}/today`);
      setTodayStatus(todayResponse?.data || null);

      // Get attendance history
      const historyResponse = await apiService.fetchData(`attendance/intern/${intern._id}`);
      const attendance = historyResponse?.data?.attendance || [];
      setRecentActivity(attendance.slice(0, 5));

      // Calculate stats
      const present = attendance.filter(a => a.status === 'present').length;
      const late = attendance.filter(a => a.status === 'late').length;
      const total = attendance.length;
      const rate = total > 0 ? ((present + late) / total * 100).toFixed(1) : 0;

      setStats({
        totalDays: total,
        presentDays: present,
        lateDays: late,
        absentDays: total - present - late,
        attendanceRate: rate
      });

    } catch (error) {
      console.error('Error fetching intern data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiService.submitCheckIn({
        location: null,
        timestamp: new Date().toISOString()
      });
      toast.success('Checked in successfully!');
      fetchInternData();
    } catch (error) {
      toast.error(error.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiService.submitCheckOut({
        timestamp: new Date().toISOString()
      });
      toast.success('Checked out successfully!');
      fetchInternData();
    } catch (error) {
      toast.error(error.message || 'Check-out failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime;
  const isCheckedOut = todayStatus?.checkOutTime;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {internData?.name || 'Intern'}!
        </h1>
        <p className="text-emerald-100 text-lg">
          {currentTime.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="text-2xl font-semibold mt-2">
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>

      {/* Check-In/Out Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-In Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl shadow-lg ${
            isCheckedIn 
              ? 'bg-green-50 border-2 border-green-500' 
              : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${
                isCheckedIn ? 'bg-green-500' : 'bg-emerald-500'
              }`}>
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Check In
                </h3>
                <p className="text-sm text-gray-600">
                  {isCheckedIn 
                    ? `Checked in at ${new Date(todayStatus.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Start your day'
                  }
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              isCheckedIn
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isCheckedIn ? 'Already Checked In' : 'Check In Now'}
          </button>
        </motion.div>

        {/* Check-Out Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 rounded-xl shadow-lg ${
            isCheckedOut 
              ? 'bg-blue-50 border-2 border-blue-500' 
              : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${
                isCheckedOut ? 'bg-blue-500' : 'bg-orange-500'
              }`}>
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Check Out
                </h3>
                <p className="text-sm text-gray-600">
                  {isCheckedOut 
                    ? `Checked out at ${new Date(todayStatus.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : 'End your day'
                  }
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn || isCheckedOut}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              !isCheckedIn || isCheckedOut
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isCheckedOut ? 'Already Checked Out' : !isCheckedIn ? 'Check In First' : 'Check Out Now'}
          </button>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">
                {stats.attendanceRate}%
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats.presentDays}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late Days</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {stats.lateDays}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {stats.totalDays}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Recent Activity
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No attendance records yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Check in to start tracking your attendance
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((record, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    record.status === 'present' ? 'bg-green-100' :
                    record.status === 'late' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    {record.status === 'present' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : record.status === 'late' ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.checkInTime && `In: ${new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      {record.checkOutTime && ` • Out: ${new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  record.status === 'present' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

