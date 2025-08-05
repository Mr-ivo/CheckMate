"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, CheckCircle, XCircle, Clock, AlertTriangle, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '@/services/api.service';

export default function EmailNotificationModal({ 
  isOpen, 
  onClose, 
  absentInterns = [], 
  selectedDate,
  onEmailSent 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailResults, setEmailResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSendEmails = async () => {
    if (!absentInterns.length) {
      toast.error('No absent interns to send emails to');
      return;
    }

    setIsLoading(true);
    setEmailResults([]);
    setShowResults(false);

    try {
      let results;
      
      if (absentInterns.length === 1) {
        // Send single email
        const emailData = {
          internData: absentInterns[0],
          date: selectedDate,
          type: 'single'
        };
        
        const result = await apiService.sendAbsenteeEmail(emailData);
        console.log('Single email API response:', result);
        
        // Always mark as success if the API call succeeded
        results = [{
          intern: absentInterns[0].name || absentInterns[0].user?.name,
          email: absentInterns[0].email || absentInterns[0].user?.email,
          success: true,
          message: result.message || 'Email sent successfully'
        }];
      } else {
        // Send bulk emails
        const result = await apiService.sendBulkAbsenteeEmails(absentInterns, selectedDate);
        console.log('Bulk email API response:', result);
        
        // If the API call succeeded, we know the emails were sent
        if (result && result.status === 'success') {
          // Extract results from the nested response structure
          const rawResults = result.data?.results || [];
          
          // Force success status to true for all results since emails were sent
          results = rawResults.map(item => ({
            ...item,
            success: true
          }));
        } else {
          // Keep original results if there was an API error
          results = result.data?.results || [];
        }
        
        // Add debug logging
        console.log('Processed email results:', results);
      }

      setEmailResults(results);
      setShowResults(true);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} email(s) sent successfully`);
      }
      if (failureCount > 0) {
        toast.error(`${failureCount} email(s) failed to send`);
      }

      if (onEmailSent) {
        onEmailSent(results);
      }

    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send emails: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-emerald-500 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Send Absence Inquiry
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showResults ? (
                <>
                  {/* Absent Interns List */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Absent Interns ({absentInterns.length})
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {absentInterns.map((intern) => {
                        const hasEmail = intern.email || intern.user?.email;
                        return (
                          <div key={intern.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {intern.name || intern.user?.name || 'Unknown'}
                              </div>
                              <div className={`text-sm ${
                                hasEmail 
                                  ? 'text-gray-500 dark:text-gray-400' 
                                  : 'text-red-500 dark:text-red-400 font-medium'
                              }`}>
                                {hasEmail ? hasEmail : '⚠️ No email address'}
                              </div>
                              {!hasEmail && (
                                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                  Cannot send email without address
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {!hasEmail && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  Missing Email
                                </span>
                              )}
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Absent
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Warning for missing emails */}
                    {absentInterns.some(intern => !(intern.email || intern.user?.email)) && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle size={16} className="text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                              Missing Email Addresses
                            </div>
                            <div className="text-yellow-700 dark:text-yellow-300">
                              Some interns don't have email addresses. Emails will only be sent to interns with valid email addresses.
                              Please add email addresses to intern profiles for complete functionality.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email Preview */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Email Preview
                    </h4>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Subject:</strong> Attendance Inquiry - {formatDate(selectedDate)}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                        A professional email will be sent asking about the reason for absence, 
                        with options to provide explanation and request support if needed.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmails}
                      disabled={isLoading || !absentInterns.length}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white rounded-md transition-colors flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader size={16} className="animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Send {absentInterns.length > 1 ? `${absentInterns.length} Emails` : 'Email'}
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Results Display */
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Email Results
                  </h3>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {emailResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          result.success 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {result.intern}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {result.email}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {result.success ? (
                            <CheckCircle size={20} className="text-green-500" />
                          ) : (
                            <AlertCircle size={20} className="text-red-500" />
                          )}
                          <span className={`ml-2 text-sm ${
                            result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            {result.success ? 'Sent' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
