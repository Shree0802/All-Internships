import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'We couldn’t find anything matching your current filters or query.',
  actionText,
  onAction,
  actionHref,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-slate-200/80 shadow-sm max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2677FF] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>

      <h3 className="text-xl font-heading font-bold text-[#172033] mb-2">{title}</h3>

      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionHref && actionText && (
        <Link to={actionHref}>
          <Button variant="primary">{actionText}</Button>
        </Link>
      )}

      {!actionHref && onAction && actionText && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
