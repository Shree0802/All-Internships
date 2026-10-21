import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-[#2677FF] border-blue-200',
    play: 'bg-[#2677FF]/10 text-[#2677FF] border-[#2677FF]/20 font-semibold',
    campus: 'bg-[#F044A5]/10 text-[#F044A5] border-[#F044A5]/20 font-semibold',
    purple: 'bg-[#8157F5]/10 text-[#8157F5] border-[#8157F5]/20 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    dark: 'bg-[#0B1730] text-white border-transparent',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wide font-medium',
    md: 'text-xs px-2.5 py-1 tracking-wide font-medium',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-[#2677FF]',
    play: 'bg-[#2677FF]',
    campus: 'bg-[#F044A5]',
    purple: 'bg-[#8157F5]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    dark: 'bg-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`}
        />
      )}
      {children}
    </span>
  );
}
