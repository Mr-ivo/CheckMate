"use client";

import { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import apiService from '@/services/api.service';
import { toast } from 'react-hot-toast';

export default function NotificationTester() {
  const [isCreating, setIsCreating] = useState(false);

  const createTestNotifications = async () => {
    try {
      setIsCreating(true);
      
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Created ${data.data?.length || 0} test notifications!`);
        // Trigger a page refresh to see notifications immediately
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error(data.message || 'Failed to create notifications');
      }
    } catch (error) {
      console.error('Error creating test notifications:', error);
      toast.error('Failed to create test notifications: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Bell className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Notification Tester
        </h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Test the notification system by creating sample notifications. 
        This will create 5 different types of notifications to test the UI and functionality.
      </p>
      
      <button
        onClick={createTestNotifications}
        disabled={isCreating}
        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Creating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Create Test Notifications
          </>
        )}
      </button>
      
      <div className="mt-4 text-sm text-gray-500">
        <p><strong>This will create:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>New intern joined notification (Medium priority)</li>
          <li>Late check-in alert (High priority)</li>
          <li>System maintenance notice (Medium priority)</li>
          <li>Urgent server issue (Urgent priority)</li>
          <li>Perfect attendance celebration (Low priority)</li>
        </ul>
      </div>
    </div>
  );
}

