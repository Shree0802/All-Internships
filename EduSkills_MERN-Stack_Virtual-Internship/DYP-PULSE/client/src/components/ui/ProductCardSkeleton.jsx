import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-[4/5] bg-slate-200 overflow-hidden">
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent motion-reduce:hidden" />
        
        {/* Top Badges Skeleton */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <div className="w-14 h-5 rounded-full bg-slate-300" />
        </div>

        {/* Wishlist Button Skeleton */}
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-300" />
      </div>

      {/* Details Skeleton */}
      <div className="flex flex-col flex-1 p-4 space-y-2.5">
        {/* Brand */}
        <div className="w-24 h-3 rounded bg-slate-200" />
        
        {/* Title */}
        <div className="w-full h-4 rounded bg-slate-300" />
        <div className="w-3/4 h-4 rounded bg-slate-200" />

        {/* Price & Action */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="w-20 h-5 rounded bg-slate-300" />
          <div className="w-16 h-4 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
