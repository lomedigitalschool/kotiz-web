import React from 'react';

const SkeletonLoader = React.memo(({ type = 'default', className = '' }) => {
  const baseClasses = "animate-pulse bg-gray-200 rounded";

  if (type === 'dashboard') {
    return (
      <div className={`pt-[calc(4rem+1rem)] p-6 mx-auto font-roboto ${className}`} style={{ maxWidth: "1400px" }}>
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className={`${baseClasses} h-8 w-48`}></div>
          <div className={`${baseClasses} h-10 w-32`}></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className={`${baseClasses} h-4 w-24 mb-2`}></div>
              <div className={`${baseClasses} h-8 w-16 mb-4`}></div>
              <div className={`${baseClasses} h-3 w-20`}></div>
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className={`${baseClasses} h-6 w-32 mb-4`}></div>
            <div className={`${baseClasses} h-64 w-full`}></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className={`${baseClasses} h-6 w-32 mb-4`}></div>
            <div className={`${baseClasses} h-64 w-full`}></div>
          </div>
        </div>

        {/* Cagnottes list skeleton */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className={`${baseClasses} h-6 w-40 mb-4`}></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded">
                <div className="flex items-center space-x-4">
                  <div className={`${baseClasses} h-12 w-12 rounded-full`}></div>
                  <div>
                    <div className={`${baseClasses} h-4 w-32 mb-2`}></div>
                    <div className={`${baseClasses} h-3 w-24`}></div>
                  </div>
                </div>
                <div className={`${baseClasses} h-8 w-20`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className={`${baseClasses} h-16 w-16 rounded-full mx-auto mb-4`}></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-spin border-t-green-600"></div>
          </div>
          <div className={`${baseClasses} h-6 w-64 mx-auto mb-2`}></div>
          <div className={`${baseClasses} h-4 w-48 mx-auto`}></div>
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="text-center">
        <div className={`${baseClasses} h-12 w-12 rounded-full mx-auto mb-4`}></div>
        <div className={`${baseClasses} h-4 w-32 mx-auto`}></div>
      </div>
    </div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;