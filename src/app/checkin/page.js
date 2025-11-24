'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  User,
  MapPin,
  AlertTriangle,
  LogIn,
  LogOut,
  Fingerprint,
  Shield,
  Navigation,
  Activity,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Components
import Footer from '@/components/Footer';

// Services
import apiService from '@/services/api.service';
import authService from '@/services/auth.service';

export default function CheckInEnhanced() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('checking'); // checking, valid, invalid
  const [showBiometric, setShowBiometric] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  // Work hours
  const workStartTime = new Date();
  workStartTime.setHours(9, 0, 0);

  // Initialize
  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    // Get current user
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    // Check dark mode
    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Get current location
    getLocation();

    // Check attendance status
    if (user) {
      await checkAttendanceStatus();
      await loadRecentActivity();
    }

    // Check if biometric is available
    if (window.PublicKeyCredential) {
      setShowBiometric(true);
    }
  };

  // Get user location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(userLocation);
        validateLocation(userLocation);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationStatus('error');
        toast.error('Unable to get your location');
      }
    );
  };

  // Validate location against geofences
  const validateLocation = async (userLocation) => {
    try {
      const response = await apiService.validateLocation(userLocation);
      if (response.isValid) {
        setLocationStatus('valid');
      } else {
        setLocationStatus('invalid');
        toast.error('You are not within an allowed check-in location');
      }
    } catch (error) {
      console.error('Location validation error:', error);
      // If no geofences are set up, allow check-in anyway
      setLocationStatus('valid');
      toast.info('Location validation unavailable - check-in allowed');
    }
  };

  // Check current attendance status
  const checkAttendanceStatus = async () => {
    try {
      const response = await apiService.getTodayAttendance();
      console.log('Attendance status response:', response);
      // Backend returns data.record with checkInTime and checkOutTime
      const record = response?.data?.record;
      if (record) {
        setAttendanceStatus({
          checkIn: record.checkInTime,
          checkOut: record.checkOutTime,
          status: record.status
        });
      } else {
        setAttendanceStatus(null);
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
      // Don't show error to user - just means no attendance record yet
      setAttendanceStatus(null);
    }
  };

  // Load recent activity
  const loadRecentActivity = async () => {
    try {
      const response = await apiService.getRecentAttendance(5);
      setRecentActivity(response.attendance || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
      // Don't show error to user - just means no records yet
      setRecentActivity([]);
    }
  };

  // Update time
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setIsLate(now > workStartTime);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle check-in
  const handleCheckIn = async () => {
    if (locationStatus === 'invalid') {
      toast.error('You must be at an allowed location to check in');
      return;
    }

    setIsLoading(true);
    try {
      const checkInData = {
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null,
        timestamp: new Date().toISOString(),
        isLate: isLate
      };

      await apiService.submitCheckIn(checkInData);
      toast.success('Successfully checked in!');
      await checkAttendanceStatus();
      await loadRecentActivity();
    } catch (error) {
      toast.error(error.message || 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await apiService.submitCheckOut({
        timestamp: new Date().toISOString()
      });
      toast.success('Successfully checked out!');
      await checkAttendanceStatus();
      await loadRecentActivity();
    } catch (error) {
      toast.error(error.message || 'Check-out failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle biometric check-in
  const handleBiometricCheckIn = async () => {
    try {
      setIsLoading(true);
      const result = await authService.authenticateBiometric();
      
      if (result.success) {
        const checkInData = {
          location: location ? {
            latitude: location.latitude,
            longitude: location.longitude
          } : null,
          timestamp: new Date().toISOString(),
          isLate: isLate,
          method: 'biometric'
        };

        await apiService.submitCheckIn(checkInData);
        toast.success('Biometric check-in successful!');
        await checkAttendanceStatus();
        await loadRecentActivity();
      }
    } catch (error) {
      toast.error('Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    if (typeof window === 'undefined') return '';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getLocationStatusColor = () => {
    switch (locationStatus) {
      case 'valid': return 'text-green-600';
      case 'invalid': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'valid': return 'Location Verified ✓';
      case 'invalid': return 'Outside Allowed Area';
      case 'checking': return 'Checking Location...';
      case 'error': return 'Location Error';
      default: return 'Location Unknown';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to access the check-in system
          </p>
          <a
            href="/login"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const isCheckedIn = attendanceStatus?.checkIn && !attendanceStatus?.checkOut;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-emerald-600" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  CheckMate
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {currentUser.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Location Status */}
              <div className={`flex items-center gap-2 text-sm ${getLocationStatusColor()}`}>
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">{getLocationStatusText()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Check-In Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Time Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-emerald-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {formatDate(currentTime)}
                    </h2>
                  </div>
                  <div className="text-5xl font-bold text-gray-900 mb-4" suppressHydrationWarning>
                    {formatTime(currentTime)}
                  </div>
                  
                  {/* Status Badge */}
                  {isCheckedIn ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Checked In</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                      <Activity className="w-5 h-5" />
                      <span className="font-medium">Not Checked In</span>
                    </div>
                  )}

                  {isLate && !isCheckedIn && (
                    <div className="mt-4 flex items-center justify-center text-amber-600">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>Late arrival will be recorded (after 9:00 AM)</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Check-In/Out Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {isCheckedIn ? 'Check Out' : 'Check In'}
                </h3>

                {isCheckedIn ? (
                  /* Check-Out Section */
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          Checked in at {new Date(attendanceStatus.checkIn).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        Remember to check out when you leave
                      </p>
                    </div>

                    <button
                      onClick={handleCheckOut}
                      disabled={isLoading}
                      className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                               font-semibold flex items-center justify-center gap-2 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="w-5 h-5" />
                      {isLoading ? 'Processing...' : 'Check Out Now'}
                    </button>
                  </div>
                ) : (
                  /* Check-In Section */
                  <div className="space-y-6">
                    {/* Biometric Check-In */}
                    {showBiometric && (
                      <div className="mb-4">
                        <button
                          onClick={handleBiometricCheckIn}
                          disabled={isLoading || locationStatus === 'invalid'}
                          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 
                                   hover:from-emerald-700 hover:to-emerald-600 text-white rounded-lg 
                                   font-semibold flex items-center justify-center gap-2 transition-all
                                   disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          <Fingerprint className="w-5 h-5" />
                          Quick Check-In with Biometric
                        </button>
                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                              or
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Regular Check-In Button */}
                    <button
                      onClick={handleCheckIn}
                      disabled={isLoading || locationStatus === 'invalid'}
                      className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white 
                               rounded-lg font-semibold flex items-center justify-center gap-2 
                               transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <LogIn className="w-5 h-5" />
                      {isLoading ? 'Processing...' : 'Check In Now'}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Today's Activity
                </h3>
                
                <div className="space-y-3">
                  {attendanceStatus?.checkIn && (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-700">Check-In</span>
                      <span className="text-sm font-semibold text-green-600">
                        {new Date(attendanceStatus.checkIn).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {attendanceStatus?.checkOut && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-700">Check-Out</span>
                      <span className="text-sm font-semibold text-red-600">
                        {new Date(attendanceStatus.checkOut).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {!attendanceStatus?.checkIn && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No activity yet today
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                
                <div className="space-y-2">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.status === 'present' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                  
                  {recentActivity.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Location Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-emerald-900 mb-1">
                      Location-Based Check-In
                    </h4>
                    <p className="text-xs text-emerald-700">
                      You must be within an approved location to check in. Your location is verified automatically.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

