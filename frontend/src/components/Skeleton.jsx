import React from 'react';

export const SkeletonLine = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`shimmer skeleton-line ${width} ${height} ${className}`} />
);

export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => (
  <div className={`shimmer skeleton-circle ${size} ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`card-premium p-5 ${className}`}>
    <div className="flex items-start gap-4 mb-4">
      <SkeletonCircle size="w-11 h-11" className="rounded-2xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine width="w-3/4" height="h-4" />
        <SkeletonLine width="w-1/2" height="h-3" />
      </div>
    </div>
    <SkeletonLine width="w-full" height="h-2 mb-2" />
    <SkeletonLine width="w-5/6" height="h-2" />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="card-premium rounded-2xl overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
      <SkeletonLine width="w-32" height="h-4" />
      <SkeletonLine width="w-16" height="h-6" className="rounded-full" />
    </div>
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <SkeletonLine key={j} width="flex-1" height="h-3" className={j === 0 ? 'w-1/3' : ''} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStatCard = () => (
  <div className="card-premium p-5">
    <SkeletonCircle size="w-10 h-10" className="rounded-xl mb-4" />
    <SkeletonLine width="w-16" height="h-7" className="mb-2" />
    <SkeletonLine width="w-24" height="h-3" />
  </div>
);

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center pt-16">
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/15" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-gold-500/20" />
        <div className="absolute inset-2 rounded-full border-2 border-b-gold-500 border-t-transparent border-l-transparent border-r-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.75s' }} />
      </div>
      <div className="flex gap-1.5">
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonLine;
