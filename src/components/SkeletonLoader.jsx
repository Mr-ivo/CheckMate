"use client";

import React from 'react';

// Base skeleton component
const SkeletonItem = ({ className = "" }) => (
  <div 
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  ></div>
);

// Table row skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <div className="flex w-full py-3">
      {Array(columns).fill(0).map((_, i) => (
        <div key={i} className="px-3 flex-1">
          <SkeletonItem className="h-6 w-full" />
        </div>
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
    <SkeletonItem className="h-6 w-2/3 mb-4" />
    <SkeletonItem className="h-20 w-full mb-3" />
    <SkeletonItem className="h-4 w-full mb-2" />
    <SkeletonItem className="h-4 w-5/6 mb-2" />
    <SkeletonItem className="h-4 w-4/6" />
  </div>
);

// Profile skeleton
export const ProfileSkeleton = () => (
  <div className="flex items-center space-x-4">
    <SkeletonItem className="h-12 w-12 rounded-full" />
    <div className="space-y-2 flex-1">
      <SkeletonItem className="h-5 w-1/3" />
      <SkeletonItem className="h-4 w-1/2" />
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton = () => (
  <div>
    <SkeletonItem className="h-6 w-1/3 mb-4" />
    <SkeletonItem className="h-[200px] w-full rounded-md" />
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <SkeletonItem className="h-4 w-1/2 mb-3" />
    <SkeletonItem className="h-8 w-1/3 mb-2" />
    <SkeletonItem className="h-3 w-2/3" />
  </div>
);

// Notification skeleton
export const NotificationSkeleton = () => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
    <div className="flex">
      <SkeletonItem className="h-8 w-8 rounded-full mr-3" />
      <div className="flex-1">
        <SkeletonItem className="h-4 w-3/4 mb-2" />
        <SkeletonItem className="h-3 w-full mb-1" />
        <SkeletonItem className="h-3 w-5/6" />
      </div>
    </div>
  </div>
);

// Dashboard skeleton layout
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
    
    {/* Table section */}
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <SkeletonItem className="h-6 w-1/4 mb-6" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <TableRowSkeleton key={i} columns={4} />
        ))}
      </div>
    </div>
  </div>
);

export default {
  TableRowSkeleton,
  CardSkeleton,
  ProfileSkeleton,
  ChartSkeleton,
  StatsCardSkeleton,
  NotificationSkeleton,
  DashboardSkeleton
};
