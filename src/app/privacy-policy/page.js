"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/Screenshot__9_-removebg-preview.png" 
                  alt="CheckMate Logo" 
                  width={120} 
                  height={120} 
                  className="py-1"
                />
              </Link>
            </div>
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-emerald-600"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-emerald max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: {currentYear}-07-08
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Introduction</h2>
          <p className="text-gray-600">
            Welcome to CheckMate. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Data We Collect</h2>
          <p className="text-gray-600">
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mt-3 mb-6 text-gray-600">
            <li>Identity Data: includes first name, last name, username or similar identifier</li>
            <li>Contact Data: includes email address and telephone numbers</li>
            <li>Technical Data: includes internet protocol (IP) address, browser type and version, time zone setting and location</li>
            <li>Usage Data: includes information about how you use our website and services</li>
            <li>Attendance Data: includes check-in/check-out times, location data during check-in (if enabled)</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. How We Use Your Data</h2>
          <p className="text-gray-600">
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mt-3 mb-6 text-gray-600">
            <li>To register you as a new user</li>
            <li>To provide and manage your attendance records</li>
            <li>To manage our relationship with you</li>
            <li>To improve our website, products/services, marketing or customer relationships</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. Data Security</h2>
          <p className="text-gray-600">
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
            used or accessed in an unauthorized way, altered or disclosed. We also limit access to your personal data to those 
            employees, agents, contractors and other third parties who have a business need to know.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <p className="text-gray-600 mt-3">
            <strong>Email:</strong> privacy@checkmate-attendance.com<br />
            <strong>Address:</strong> 123 Attendance Street, Suite 456, San Francisco, CA 94105
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} CheckMate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

