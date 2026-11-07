import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  PieChart,
  CalendarCheck,
  Briefcase,
  Lightbulb,
  Printer,
  Clock,
  Users,
  MapPin,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { IEvent } from '../types';
import { formatCurrency, formatDate, getDaysUntil } from '../lib/utils';

interface EventSubNavProps {
  event: IEvent | null;
  onOpenExport?: () => void;
}

export const EventSubNav: React.FC<EventSubNavProps> = ({ event, onOpenExport }) => {
  const { id } = useParams<{ id: string }>();

  if (!event || !id) return null;

  const countdown = getDaysUntil(event.date);
  const spentTotal = (event.expenses || []).reduce((sum, e) => sum + (e.actualAmount || e.estimatedAmount || 0), 0);
  const remaining = event.budget - spentTotal;
  const budgetUtilization = event.budget > 0 ? Math.round((spentTotal / event.budget) * 100) : 0;
  const pendingTasksCount = (event.tasks || []).filter((t) => t.status !== 'completed').length;
  const bookedVendorsCount = (event.vendors || []).filter((v) => v.bookingStatus === 'booked').length;
  const favoriteIdeasCount = (event.ideas || []).filter((i) => i.isFavorite).length;

  const navItems = [
    {
      to: `/events/${id}`,
      label: 'Studio Overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: `/events/${id}/ai-planner`,
      label: 'AI 13-Point Dossier',
      icon: Sparkles,
      badge: event.plan ? '13 Sections' : 'Draft',
      badgeColor: event.plan ? 'bg-festivo-coral-100 text-festivo-coral-800 font-bold' : 'bg-festivo-sand text-festivo-plum-700',
    },
    {
      to: `/events/${id}/budget`,
      label: 'Budget & Finance',
      icon: PieChart,
      badge: `${budgetUtilization}% Spent`,
      badgeColor: budgetUtilization > 100 ? 'bg-red-100 text-red-800 font-bold' : 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      to: `/events/${id}/timeline`,
      label: 'Timeline & Tasks',
      icon: CalendarCheck,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount} to do` : 'All Done',
      badgeColor: pendingTasksCount > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      to: `/events/${id}/vendors`,
      label: 'Vendor Pipeline',
      icon: Briefcase,
      badge: bookedVendorsCount > 0 ? `${bookedVendorsCount} locked` : undefined,
      badgeColor: 'bg-festivo-cream text-festivo-plum-800 font-bold',
    },
    {
      to: `/events/${id}/ideas`,
      label: 'Ideas Gallery',
      icon: Lightbulb,
      badge: favoriteIdeasCount > 0 ? `${favoriteIdeasCount} ★` : undefined,
      badgeColor: 'bg-festivo-gold-100 text-festivo-gold-800 font-bold',
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-festivo-plum-100/80 event-sub-nav shadow-soft sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2.5">
        {/* Event Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-festivo-plum-100 text-festivo-plum-900 uppercase tracking-wider">
                {event.type.replace('_', ' ')}
              </span>
              <span className="flex items-center space-x-1 text-xs text-festivo-plum-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-festivo-coral-500" />
                <span>{event.location}</span>
              </span>
              <span className="text-festivo-plum-300">•</span>
              <span className="flex items-center space-x-1 text-xs text-festivo-plum-600 font-medium">
                <Users className="w-3.5 h-3.5 text-festivo-plum-500" />
                <span>{event.guestCount} Guests</span>
              </span>
              <span className="text-festivo-plum-300">•</span>
              <span className="flex items-center space-x-1 text-xs text-festivo-plum-600 font-medium">
                <Wallet className="w-3.5 h-3.5 text-festivo-coral-500" />
                <span>Budget: <strong className="text-festivo-plum-950 tabular-nums">{formatCurrency(event.budget, event.currency)}</strong></span>
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 tracking-tight leading-snug">
              {event.name}
            </h1>
          </div>

          {/* Quick Metrics & Print Button */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-festivo-cream/60 border border-festivo-plum-100">
              <Clock className="w-4 h-4 text-festivo-coral-500 shrink-0" />
              <div>
                <div className="text-[9px] uppercase font-bold text-festivo-plum-400 tracking-wider">
                  Target Date
                </div>
                <div className="text-xs font-bold text-festivo-plum-900 tabular-nums">
                  {formatDate(event.date)} <span className="text-festivo-coral-600 font-semibold">({countdown.text})</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenExport}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-festivo-cream text-festivo-plum-900 border border-festivo-plum-200 shadow-xs hover:shadow-soft transition-all"
              title="Printable Event Summary / PDF Export"
            >
              <Printer className="w-3.5 h-3.5 text-festivo-coral-500" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex space-x-1 sm:space-x-1.5 overflow-x-auto mt-3.5 pt-2 border-t border-festivo-plum-100/70 scrollbar-none">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-festivo-plum-900 text-white shadow-soft font-bold'
                    : 'text-festivo-plum-700 hover:text-festivo-plum-950 hover:bg-festivo-cream/70'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md ml-1 tracking-tight ${
                    item.badgeColor || 'bg-festivo-sand text-festivo-plum-900'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
