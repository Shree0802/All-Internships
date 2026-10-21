import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none rounded-xl';

  const variants = {
    primary:
      'bg-[#2677FF] hover:bg-[#1b64e0] text-white shadow-md shadow-blue-500/20 focus-visible:ring-[#2677FF]',
    secondary:
      'bg-transparent border-2 border-[#172033] text-[#172033] hover:bg-[#172033] hover:text-white focus-visible:ring-[#172033]',
    outline:
      'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 focus-visible:ring-slate-400',
    navy:
      'bg-[#0B1730] hover:bg-[#162446] text-white shadow-md shadow-navy/20 focus-visible:ring-[#0B1730]',
    gradient:
      'bg-gradient-to-r from-[#2677FF] via-[#8157F5] to-[#F044A5] text-white shadow-lg shadow-purple-500/25 hover:opacity-95 focus-visible:ring-purple-500',
    danger:
      'bg-red-500 hover:bg-red-600 text-white shadow-sm focus-visible:ring-red-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium rounded-lg',
    md: 'text-sm px-5 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold rounded-xl',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
