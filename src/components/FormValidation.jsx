"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

// Form input component with validation
export const FormInput = ({ 
  register, 
  name, 
  rules = {}, 
  errors, 
  label, 
  type = "text", 
  placeholder = "", 
  className = "",
  required = false,
  ...rest 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        className={`w-full px-3 py-2 border ${
          errors[name] 
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'
        } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${className}`}
        placeholder={placeholder}
        aria-invalid={errors[name] ? "true" : "false"}
        aria-describedby={`${name}-error`}
        {...register(name, rules)}
        {...rest}
      />
      {errors[name] && (
        <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400" id={`${name}-error`} role="alert">
          <AlertCircle size={14} className="mr-1" />
          <span>{errors[name].message}</span>
        </div>
      )}
    </div>
  );
};

// Form select component with validation
export const FormSelect = ({ 
  register, 
  name, 
  rules = {}, 
  errors, 
  label, 
  options = [], 
  placeholder = "Select an option",
  className = "",
  required = false,
  ...rest 
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        className={`w-full px-3 py-2 border ${
          errors[name] 
            ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500'
        } rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${className}`}
        aria-invalid={errors[name] ? "true" : "false"}
        aria-describedby={`${name}-error`}
        {...register(name, rules)}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {errors[name] && (
        <div className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400" id={`${name}-error`} role="alert">
          <AlertCircle size={14} className="mr-1" />
          <span>{errors[name].message}</span>
        </div>
      )}
    </div>
  );
};

// Form checkbox component with validation
export const FormCheckbox = ({ 
  register, 
  name, 
  rules = {}, 
  errors, 
  label,
  className = "",
  ...rest 
}) => {
  return (
    <div className="flex items-center mb-4">
      <input
        id={name}
        type="checkbox"
        className={`h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 ${className}`}
        aria-invalid={errors[name] ? "true" : "false"}
        aria-describedby={`${name}-error`}
        {...register(name, rules)}
        {...rest}
      />
      {label && (
        <label htmlFor={name} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {errors[name] && (
        <div className="ml-2 flex items-center text-sm text-red-600 dark:text-red-400" id={`${name}-error`} role="alert">
          <AlertCircle size={14} className="mr-1" />
          <span>{errors[name].message}</span>
        </div>
      )}
    </div>
  );
};

// Form submit button
export const FormButton = ({ 
  children, 
  isSubmitting = false, 
  className = "",
  ...rest 
}) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
      {...rest}
    >
      {isSubmitting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Example validation schema for an intern form
export const internValidationSchema = {
  firstName: {
    required: "First name is required",
    minLength: {
      value: 2,
      message: "First name must be at least 2 characters"
    }
  },
  lastName: {
    required: "Last name is required",
    minLength: {
      value: 2,
      message: "Last name must be at least 2 characters"
    }
  },
  employeeId: {
    required: "Employee ID is required",
    pattern: {
      value: /^[A-Z0-9]{6,}$/i,
      message: "Employee ID must be at least 6 alphanumeric characters"
    }
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address"
    }
  },
  department: {
    required: "Please select a department"
  },
  phone: {
    pattern: {
      value: /^[0-9]{10,15}$/,
      message: "Phone number must be between 10-15 digits"
    }
  }
};

// Example validation schema for an attendance form
export const attendanceValidationSchema = {
  date: {
    required: "Date is required"
  },
  department: {
    required: "Please select a department"
  }
};

export default {
  FormInput,
  FormSelect,
  FormCheckbox,
  FormButton,
  internValidationSchema,
  attendanceValidationSchema
};
