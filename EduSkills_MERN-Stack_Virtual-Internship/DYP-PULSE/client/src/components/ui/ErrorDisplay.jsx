import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from './Button';

export default function ErrorDisplay({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  actionText = 'Try Again',
  fullPage = false,
  className = '',
}) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-rose-50/50 border border-rose-200 rounded-2xl max-w-md mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-heading font-bold text-slate-900 mb-1.5">{title}</h3>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-sm">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          icon={RotateCcw}
          size="sm"
          className="!bg-slate-900 hover:!bg-slate-800"
        >
          {actionText}
        </Button>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center p-6">
        {content}
      </div>
    );
  }

  return content;
}
