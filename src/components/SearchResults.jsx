'use client';

import React from 'react';
import Link from 'next/link';
import { User, Calendar, Clock, AlertCircle, CheckCircle, XCircle, Search } from 'lucide-react';

const iconMap = {
  intern: <User size={16} className="text-blue-500" />,
  attendance: <Calendar size={16} className="text-green-500" />,
  present: <CheckCircle size={16} className="text-emerald-500" />,
  absent: <XCircle size={16} className="text-red-500" />,
  late: <Clock size={16} className="text-amber-500" />,
  excused: <AlertCircle size={16} className="text-blue-500" />,
  default: <Search size={16} className="text-gray-400" />
};

export default function SearchResults({ results, isLoading, onResultClick, maxHeight = '300px' }) {
  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex justify-center mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
          </div>
          Searching...
        </div>
      </div>
    );
  }

  // If no results found
  if (!results || Object.values(results).flat().length === 0) {
    return (
      <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No results found.
        </div>
      </div>
    );
  }

  // Display results
  return (
    <div className="absolute mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
      <div className={`overflow-y-auto`} style={{ maxHeight }}>
        {/* Interns Section */}
        {results.interns && results.interns.length > 0 && (
          <>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Interns
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.interns.map((intern) => (
                <li key={intern.id || intern._id}>
                  <Link 
                    href={`/interns/${intern._id || intern.id}`}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => onResultClick && onResultClick()}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {iconMap.intern}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {intern.userId?.name || intern.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {intern.userId?.email || intern.email || ''}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Attendance Section */}
        {results.attendance && results.attendance.length > 0 && (
          <>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              Attendance
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {results.attendance.map((record) => {
                // Determine icon based on status
                let statusIcon = iconMap.default;
                if (record.status === 'present') statusIcon = iconMap.present;
                if (record.status === 'absent') statusIcon = iconMap.absent;
                if (record.status === 'late') statusIcon = iconMap.late;
                if (record.status === 'excused') statusIcon = iconMap.excused;

                const date = new Date(record.date);
                const formattedDate = date.toLocaleDateString();
                const internName = record.internName || (record.internId && record.internId.userId && record.internId.userId.name) || 
                                   (record.internId && record.internId.internId) || 'Unknown';

                return (
                  <li key={record.id || record._id}>
                                      <Link 
                    href={`/dashboard/attendance?date=${formattedDate}&internId=${record.internId?._id || record.internId}`}
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => onResultClick && onResultClick()}
                  >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {statusIcon}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {internName} - {record.status}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
