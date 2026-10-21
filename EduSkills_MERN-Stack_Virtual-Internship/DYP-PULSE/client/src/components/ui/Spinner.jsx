import React from 'react';

export default function Spinner({
  size = 'md',
  color = 'primary',
  label,
  fullPage = false,
  className = '',
}) {
  const sizes = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    primary: 'border-blue-200 border-t-[#2677FF]',
    navy: 'border-slate-200 border-t-[#0B1730]',
    white: 'border-white/20 border-t-white',
    purple: 'border-purple-200 border-t-[#8157F5]',
    pink: 'border-pink-200 border-t-[#F044A5]',
  };

  const spinnerElement = (
    <div className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizes[size] || sizes.md} ${colors[color] || colors.primary}`}
        role="status"
        aria-label="loading"
      />
      {label && <p className="text-xs font-medium text-slate-500">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center p-8">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
