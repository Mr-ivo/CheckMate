"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Login Form Component
export const LoginForm = ({ onLogin, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Mock login for presentation
      setTimeout(() => {
        toast.success('Login successful!');
        if (onLogin) {
          onLogin(formData);
        }
      }, 800);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Mail size={18} />
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-3 py-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
          />
        </div>
        {errors.email && (
          <div className="mt-1 flex items-center text-sm text-red-600" id="email-error">
            <AlertCircle size={14} className="mr-1" />
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock size={18} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-2 border ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            placeholder="••••••••"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby="password-error"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <div className="mt-1 flex items-center text-sm text-red-600" id="password-error">
            <AlertCircle size={14} className="mr-1" />
            <span>{errors.password}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            checked={formData.remember}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <button
          type="button"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
          onClick={() => toast.success('Password reset email sent!')}
        >
          Forgot password?
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Logging in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Registration Form Component
export const RegisterForm = ({ onRegister, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // If updating password, check confirm password match
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (name === 'confirmPassword' && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (name === 'confirmPassword' && value === formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Mock registration for presentation
      setTimeout(() => {
        toast.success('Registration successful!');
        if (onRegister) {
          onRegister(formData);
        }
      }, 800);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <User size={18} />
            </span>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              aria-invalid={errors.firstName ? "true" : "false"}
              aria-describedby="firstName-error"
            />
          </div>
          {errors.firstName && (
            <div className="mt-1 flex items-center text-sm text-red-600" id="firstName-error">
              <AlertCircle size={14} className="mr-1" />
              <span>{errors.firstName}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <User size={18} />
            </span>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full pl-10 pr-3 py-2 border ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              aria-invalid={errors.lastName ? "true" : "false"}
              aria-describedby="lastName-error"
            />
          </div>
          {errors.lastName && (
            <div className="mt-1 flex items-center text-sm text-red-600" id="lastName-error">
              <AlertCircle size={14} className="mr-1" />
              <span>{errors.lastName}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Mail size={18} />
          </span>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-3 py-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            placeholder="you@example.com"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby="email-error"
          />
        </div>
        {errors.email && (
          <div className="mt-1 flex items-center text-sm text-red-600" id="email-error">
            <AlertCircle size={14} className="mr-1" />
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock size={18} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-10 py-2 border ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            placeholder="••••••••"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby="password-error"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <div className="mt-1 flex items-center text-sm text-red-600" id="password-error">
            <AlertCircle size={14} className="mr-1" />
            <span>{errors.password}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Lock size={18} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-10 pr-3 py-2 border ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            placeholder="••••••••"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            aria-describedby="confirmPassword-error"
          />
        </div>
        {errors.confirmPassword && (
          <div className="mt-1 flex items-center text-sm text-red-600" id="confirmPassword-error">
            <AlertCircle size={14} className="mr-1" />
            <span>{errors.confirmPassword}</span>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="user">User</option>
          <option value="admin">Administrator</option>
          <option value="manager">Department Manager</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="agreeTerms"
          name="agreeTerms"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className={`h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 ${
            errors.agreeTerms ? 'border-red-500' : ''
          }`}
          aria-invalid={errors.agreeTerms ? "true" : "false"}
          aria-describedby="agreeTerms-error"
        />
        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
          I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-500">terms and conditions</a>
        </label>
      </div>
      {errors.agreeTerms && (
        <div className="mt-1 flex items-center text-sm text-red-600" id="agreeTerms-error">
          <AlertCircle size={14} className="mr-1" />
          <span>{errors.agreeTerms}</span>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </div>
    </form>
  );
};

// Reset Password Form Component
export const ResetPasswordForm = ({ onReset, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    
    // Mock password reset for presentation
    setTimeout(() => {
      toast.success('Password reset link sent to your email!');
      if (onReset) {
        onReset(email);
      }
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Mail size={18} />
          </span>
          <input
            type="email"
            id="reset-email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className={`w-full pl-10 pr-3 py-2 border ${
              error ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
            placeholder="you@example.com"
            aria-invalid={error ? "true" : "false"}
            aria-describedby="reset-email-error"
          />
        </div>
        {error && (
          <div className="mt-1 flex items-center text-sm text-red-600" id="reset-email-error">
            <AlertCircle size={14} className="mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600">
        We'll send a password reset link to your email address.
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin mr-2" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </div>
    </form>
  );
};

export default {
  LoginForm,
  RegisterForm,
  ResetPasswordForm
};

