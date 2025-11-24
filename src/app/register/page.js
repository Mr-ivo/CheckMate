'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  Phone, 
  MapPin, 
  Briefcase,
  IdCard,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import apiService from '@/services/api.service';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const departments = [
    'Web Development',
    'Mobile Development',
    'Graphic Design',
    'Video Editing',
    'QA Testing',
    'UI/UX Design',
    'Data Analysis',
    'Project Management',
    'Marketing',
    'Human Resources'
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const registrationData = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        department: data.department,
        position: data.position,
        employeeId: data.employeeId,
        address: data.address
      };

      await apiService.register(registrationData);
      
      setRegistrationSuccess(true);
      toast.success('Registration successful! Awaiting admin approval.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const levels = [
      { strength: 0, label: 'Very Weak', color: 'bg-red-500' },
      { strength: 1, label: 'Weak', color: 'bg-orange-500' },
      { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, label: 'Good', color: 'bg-blue-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength();

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been created and is pending admin approval. You'll receive an email once your account is activated.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to login page...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/login"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Register to join the CheckMate attendance system
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                  placeholder="John Doe"
                  {...register('name', { 
                    required: 'Full name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' }
                  })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                  placeholder="john@example.com"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.employeeId ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                  placeholder="EMP-001"
                  {...register('employeeId', { 
                    required: 'Employee ID is required'
                  })}
                />
              </div>
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-600">{errors.employeeId.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                  placeholder="+1234567890"
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                  {...register('department', { required: 'Department is required' })}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className={`w-full pl-10 pr-4 py-3 border ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                  placeholder="Software Developer"
                  {...register('position', { required: 'Position is required' })}
                />
              </div>
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                placeholder="Your address"
                rows="2"
                {...register('address')}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-12 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full pl-10 pr-12 py-3 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900
                placeholder="••••••••"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Account Approval Required</p>
                <p>Your account will be reviewed by an administrator. You'll receive an email notification once approved.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

