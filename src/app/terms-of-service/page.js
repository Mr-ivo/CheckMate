"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <p className="text-gray-600 mb-6">
            Last updated: {currentYear}-07-08
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-600">
            By accessing and using CheckMate, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. Use License</h2>
          <p className="text-gray-600">
            Permission is granted to temporarily use CheckMate for personal, non-commercial transitory viewing only. 
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mt-3 mb-6 text-gray-600">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on CheckMate</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. Account Responsibilities</h2>
          <p className="text-gray-600">
            If you create an account with us, you are responsible for maintaining the confidentiality of your account and password, 
            including restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. Attendance Data</h2>
          <p className="text-gray-600">
            CheckMate stores and processes attendance data on behalf of users and organizations. By using our service, you grant 
            CheckMate the right to collect, analyze, and store attendance data for the purposes of providing the service.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">5. Limitations</h2>
          <p className="text-gray-600">
            In no event shall CheckMate or its suppliers be liable for any damages (including, without limitation, damages for 
            loss of data or profit, or due to business interruption) arising out of the use or inability to use CheckMate and its materials, 
            even if CheckMate or a CheckMate authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">6. Governing Law</h2>
          <p className="text-gray-600">
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard 
            to its conflict of law provisions. Any disputes relating to these Terms will be subject to the exclusive jurisdiction of the courts in the United States.
          </p>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">7. Changes to Terms</h2>
          <p className="text-gray-600">
            CheckMate reserves the right to revise these terms of service at any time without notice. By using CheckMate, 
            you are agreeing to be bound by the then-current version of these Terms of Service.
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

