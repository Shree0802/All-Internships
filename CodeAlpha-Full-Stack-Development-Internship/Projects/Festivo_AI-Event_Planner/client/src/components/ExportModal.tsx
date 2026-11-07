import React, { useState } from 'react';
import { X, Printer, Share2, Check, Download, Calendar, MapPin, Users, Wallet } from 'lucide-react';
import { IEvent } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  event: IEvent | null;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, event, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const totalSpent = (event.expenses || []).reduce((sum, e) => sum + (e.actualAmount || e.estimatedAmount || 0), 0);
  const remaining = event.budget - totalSpent;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const url = window.location.origin + `/events/${event.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-festivo-plum-950/50 backdrop-blur-sm p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-floating border border-festivo-plum-100 my-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-festivo-plum-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-festivo-coral-500">
              Executive Event Dossier
            </span>
            <h2 className="font-serif text-2xl font-bold text-festivo-plum-950">
              Printable Event Brief & Export
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyShareLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-festivo-cream text-festivo-plum-900 border border-festivo-plum-200/60 hover:bg-festivo-sand/60 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-festivo-coral-500" />}
              <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-festivo-plum-400 hover:text-festivo-plum-800 hover:bg-festivo-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body Preview */}
        <div className="mt-6 space-y-6 max-h-[65vh] overflow-y-auto pr-2" id="printable-event-summary">
          {/* Header Card */}
          <div className="bg-festivo-ivory p-5 rounded-2xl border border-festivo-plum-100">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-festivo-plum-100 text-festivo-plum-800 uppercase">
                  {event.type.replace('_', ' ')}
                </span>
                <h1 className="font-serif text-2xl font-bold text-festivo-plum-950 mt-1">
                  {event.name}
                </h1>
                <p className="text-xs text-festivo-plum-600 mt-0.5">
                  Prepared with Festivo AI • Generated on {formatDate(new Date().toISOString())}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-festivo-plum-500 font-medium">Total Budget</div>
                <div className="font-serif text-xl font-bold text-festivo-plum-950">
                  {formatCurrency(event.budget, event.currency)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-festivo-plum-100/70 text-xs">
              <div>
                <span className="text-festivo-plum-500 block text-[10px] uppercase font-semibold">Date</span>
                <span className="font-bold text-festivo-plum-900">{formatDate(event.date)}</span>
              </div>
              <div>
                <span className="text-festivo-plum-500 block text-[10px] uppercase font-semibold">Location</span>
                <span className="font-bold text-festivo-plum-900">{event.location}</span>
              </div>
              <div>
                <span className="text-festivo-plum-500 block text-[10px] uppercase font-semibold">Headcount</span>
                <span className="font-bold text-festivo-plum-900">{event.guestCount} Guests</span>
              </div>
              <div>
                <span className="text-festivo-plum-500 block text-[10px] uppercase font-semibold">Theme</span>
                <span className="font-bold text-festivo-plum-900">{event.themePreference || 'Festive'}</span>
              </div>
            </div>
          </div>

          {/* AI Plan Executive Summary */}
          {event.plan && (
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-festivo-plum-950 border-b border-festivo-plum-100 pb-1">
                Executive Concept & Summary
              </h3>
              <p className="text-xs text-festivo-plum-800 leading-relaxed bg-white p-3 rounded-xl border border-festivo-plum-100">
                {event.plan.eventSummary}
              </p>
            </div>
          )}

          {/* Budget Overview Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-festivo-plum-100 pb-1">
              <h3 className="font-serif text-base font-bold text-festivo-plum-950">
                Budget Allocation & Expense Breakdown
              </h3>
              <span className="text-xs font-semibold text-festivo-plum-600">
                Spent: {formatCurrency(totalSpent, event.currency)} | Remaining: {formatCurrency(remaining, event.currency)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-festivo-plum-200 text-festivo-plum-600 font-semibold bg-festivo-cream/60">
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Estimated</th>
                    <th className="py-2 px-3 text-right">Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-festivo-plum-100">
                  {(event.expenses || []).slice(0, 8).map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-1.5 px-3 capitalize font-semibold text-festivo-plum-900">{exp.category}</td>
                      <td className="py-1.5 px-3 text-festivo-plum-700">{exp.description}</td>
                      <td className="py-1.5 px-3 text-right">{formatCurrency(exp.estimatedAmount, event.currency)}</td>
                      <td className="py-1.5 px-3 text-right font-medium text-festivo-coral-600">
                        {exp.actualAmount > 0 ? formatCurrency(exp.actualAmount, event.currency) : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preparation Milestones */}
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-festivo-plum-950 border-b border-festivo-plum-100 pb-1">
              Upcoming Milestones & Critical Tasks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(event.tasks || []).slice(0, 6).map((task) => (
                <div key={task.id} className="p-2.5 rounded-xl border border-festivo-plum-100 bg-festivo-ivory flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-festivo-plum-950">{task.title}</div>
                    <div className="text-[11px] text-festivo-plum-600">Due: {formatDate(task.dueDate)}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    task.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : task.priority === 'urgent'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-festivo-cream text-festivo-plum-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Directory */}
          {(event.vendors || []).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-festivo-plum-950 border-b border-festivo-plum-100 pb-1">
                Vendor Checklist & Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {event.vendors.map((v) => (
                  <div key={v.id} className="p-2.5 rounded-xl border border-festivo-plum-100 bg-white">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-festivo-plum-900">{v.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-festivo-coral-100 text-festivo-coral-700 capitalize font-semibold">
                        {v.bookingStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-festivo-plum-600 mt-1 capitalize">
                      Category: {v.category.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Recommendations & Cost-saving */}
          {event.plan?.costSavingOpportunities && (
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-festivo-plum-950 border-b border-festivo-plum-100 pb-1">
                Strategic Recommendations & Optimization
              </h3>
              <div className="space-y-1.5 text-xs">
                {event.plan.costSavingOpportunities.map((opt, i) => (
                  <div key={i} className="bg-festivo-coral-50/60 p-2.5 rounded-xl border border-festivo-coral-100">
                    <span className="font-bold text-festivo-coral-800 block">{opt.tip}</span>
                    <span className="text-[11px] text-festivo-coral-700">Potential Savings: {opt.potentialSavings} ({opt.tradeoff})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-festivo-plum-100 flex items-center justify-between text-xs text-festivo-plum-500">
          <span>Private Event Dossier • Festivo AI</span>
          <button
            onClick={onClose}
            className="text-festivo-plum-700 hover:text-festivo-plum-950 font-semibold"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
