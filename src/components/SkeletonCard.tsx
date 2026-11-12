import React from 'react';

interface SkeletonCardProps {
  type?: 'doctor' | 'lab';
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ type = 'doctor' }) => {
  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Top Header Placeholder */}
      <div className="relative bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 p-4 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-shimmer" />
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-shimmer hidden sm:block" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-shimmer" />
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-shimmer" />
        </div>
      </div>

      {/* Body Placeholder */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Tag & Rating */}
          <div className="flex items-center justify-between gap-2">
            <div className="w-28 h-6 rounded-lg bg-teal-100/60 dark:bg-teal-950/60 animate-shimmer" />
            <div className="w-20 h-6 rounded-full bg-amber-100/60 dark:bg-amber-950/60 animate-shimmer" />
          </div>

          {/* Name */}
          <div className="w-3/4 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 animate-shimmer" />

          {/* Location badges */}
          <div className="space-y-2">
            <div className="w-36 h-5 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 animate-shimmer" />
            <div className="w-full h-4 rounded-md bg-slate-200/60 dark:bg-slate-700/60 animate-shimmer" />
          </div>

          {/* Phone box */}
          <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-800 animate-shimmer" />

          {/* Extra chips if lab */}
          {type === 'lab' && (
            <div className="flex gap-1.5 pt-1">
              <div className="w-24 h-6 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 animate-shimmer" />
              <div className="w-20 h-6 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 animate-shimmer" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="w-14 h-3 rounded bg-slate-200 dark:bg-slate-700 animate-shimmer" />
            <div className="w-20 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 animate-shimmer" />
          </div>
          <div className="w-28 h-10 rounded-xl bg-teal-600/30 dark:bg-teal-600/20 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number; type?: 'doctor' | 'lab' }> = ({
  count = 6,
  type = 'doctor'
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} type={type} />
      ))}
    </div>
  );
};

/**
 * Shimmer Skeleton Loader for Data Tables (Admin Dashboard & Reports)
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5
}) => {
  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Table Header Placeholder */}
      <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded-md bg-slate-200 dark:bg-slate-700 animate-shimmer"
            style={{ width: `${Math.max(15, 100 / columns - 5)}%` }}
          />
        ))}
      </div>

      {/* Table Rows Placeholder */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className="h-4 rounded bg-slate-100 dark:bg-slate-800 animate-shimmer"
                style={{
                  width: `${colIndex === 0 ? 30 : colIndex === columns - 1 ? 20 : 18}%`
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Shimmer Skeleton Loader for List Items (Patient Bookings / Notifications)
 */
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <div className="w-24 h-5 rounded-md bg-slate-200 dark:bg-slate-700 animate-shimmer" />
            <div className="w-16 h-4 rounded-full bg-slate-100 dark:bg-slate-800 animate-shimmer" />
          </div>
          <div className="w-3/5 h-5 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 animate-shimmer" />
          <div className="flex items-center gap-3 pt-1">
            <div className="w-28 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-shimmer" />
            <div className="w-20 h-4 rounded bg-slate-100 dark:bg-slate-800 animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Shimmer Skeleton Loader for Metrics & KPI Stats
 */
export const SkeletonStatGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs"
        >
          <div className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-700 animate-shimmer" />
          <div className="w-24 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 animate-shimmer" />
        </div>
      ))}
    </div>
  );
};
