import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-festivo-plum-950/40 backdrop-blur-sm p-4 no-print">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-floating border border-festivo-plum-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-red-50 text-red-600' : 'bg-festivo-coral-50 text-festivo-coral-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-festivo-plum-950">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-festivo-plum-400 hover:text-festivo-plum-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-festivo-plum-700 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-festivo-coral-500 hover:bg-festivo-coral-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
