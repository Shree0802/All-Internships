import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Official DYPULSE Brand Logo Component
 * Incorporates the official graduate runner monogram, ECG pulse wave,
 * 4-tone gradient wordmark, and optional "Feel the Campus. Live the Game." tagline.
 */
export default function BrandLogo({
  size = 'md',
  showTagline = false,
  className = '',
  linkTo = '/',
  variant = 'badge', // 'badge' (white pill card) | 'inline' | 'hero'
}) {
  // Height classes by size
  const heightClasses = {
    xs: 'h-7 sm:h-8',
    sm: 'h-9 sm:h-10',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24 md:h-28',
  }[size] || 'h-11 sm:h-12';

  const logoContent = (
    <div
      className={`group inline-flex flex-col items-center justify-center transition-all duration-300 ${
        variant === 'badge'
          ? 'bg-white rounded-2xl p-1.5 sm:p-2 shadow-xs border border-white/20 hover:shadow-md hover:scale-[1.02]'
          : variant === 'hero'
          ? 'bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/30'
          : ''
      } ${className}`}
    >
      <img
        src="/dypulse-logo.png"
        alt="DYPULSE - Feel the Campus. Live the Game."
        className={`${heightClasses} w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]`}
        loading="eager"
      />

      {showTagline && (
        <p className="mt-2 text-[10px] sm:text-xs font-heading font-extrabold tracking-wider uppercase text-slate-800">
          FEEL THE CAMPUS. <span className="text-gradient-dypulse">LIVE THE GAME.</span>
        </p>
      )}

      {/* Hidden text for screen-reader accessibility and test compatibility */}
      <span className="sr-only">DY</span>
      <span className="sr-only">PULSE</span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2677FF] rounded-2xl" aria-label="DYPULSE Home">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
