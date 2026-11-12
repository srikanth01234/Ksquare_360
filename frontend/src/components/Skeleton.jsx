import React from 'react';

/**
 * Reusable minimal shimmer skeleton components for cards, tables, and metric blocks.
 */
export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/70 rounded-lg before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton({ rows = 3, className = '' }) {
  return (
    <div className={`p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-100/80 shadow-xs space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="w-2/3 h-4" />
          <Skeleton className="w-1/3 h-3" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="w-full h-8 rounded-lg" />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <Skeleton className="h-4 w-full max-w-[120px] rounded" />
        </td>
      ))}
    </tr>
  );
}

export function KpiSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-slate-100 shadow-xs space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-12 h-4 rounded-full" />
      </div>
      <Skeleton className="w-16 h-7 rounded-md" />
      <Skeleton className="w-24 h-3.5 rounded" />
    </div>
  );
}

export default Skeleton;

