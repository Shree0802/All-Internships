import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Plus,
  Clock,
  PieChart,
  CalendarCheck,
  Briefcase,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Users,
  CheckCircle,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { api } from '../lib/api';
import { IEvent } from '../types';
import { formatCurrency, formatDate, getDaysUntil } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const list = await api.getEvents();
      setEvents(list);
      if (list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load events for dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeEvent = events.find((e) => e.id === selectedEventId) || events[0] || null;

  const totalPlannedBudget = events.reduce((sum, e) => sum + (e.budget || 0), 0);
  const totalActualSpent = events.reduce((sum, e) => {
    return sum + (e.expenses || []).reduce((s, exp) => s + (exp.actualAmount || exp.estimatedAmount || 0), 0);
  }, 0);
  const totalPendingTasks = events.reduce((sum, e) => {
    return sum + (e.tasks || []).filter((t) => t.status !== 'completed').length;
  }, 0);

  const activeSpent = activeEvent
    ? (activeEvent.expenses || []).reduce((sum, e) => sum + (e.actualAmount || e.estimatedAmount || 0), 0)
    : 0;
  const activeRemaining = activeEvent ? activeEvent.budget - activeSpent : 0;
  const activeTasks = activeEvent?.tasks || [];
  const activeCompletedTasks = activeTasks.filter((t) => t.status === 'completed').length;
  const activeTaskPercent = activeTasks.length > 0 ? Math.round((activeCompletedTasks / activeTasks.length) * 100) : 0;
  const activeCountdown = activeEvent ? getDaysUntil(activeEvent.date) : null;
  const activeVendors = activeEvent?.vendors || [];
  const activeBookedVendors = activeVendors.filter((v) => v.bookingStatus === 'booked').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-3 border-festivo-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-festivo-plum-950">Loading Portfolio Studio</h3>
        <p className="text-xs text-festivo-plum-600 mt-1">Retrieving live celebrations and financial ledgers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* 1. Header with Portfolio Summary & New Event CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-festivo-plum-100 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-festivo-coral-500">
            Portfolio Command Studio
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-festivo-plum-950 tracking-tight mt-1">
            Celebration Management
          </h1>
          <p className="text-xs sm:text-sm text-festivo-plum-600 mt-0.5">
            Real-time status, financial allocations, and milestones across {events.length} celebrations.
          </p>
        </div>

        <Link
          to="/events/new"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Celebration</span>
        </Link>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="festivo-card p-5 bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Active Events
            </span>
            <div className="font-serif text-3xl font-bold text-festivo-plum-950 mt-1 tabular-nums">
              {events.length}
            </div>
            <span className="text-[11px] text-festivo-plum-600">Celebrations planned</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-festivo-plum-50 text-festivo-plum-700 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="festivo-card p-5 bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Portfolio Budget
            </span>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 mt-1 tabular-nums truncate">
              {formatCurrency(totalPlannedBudget)}
            </div>
            <span className="text-[11px] text-festivo-plum-600">Total planned funds</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-festivo-coral-50 text-festivo-coral-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="festivo-card p-5 bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Committed Expenses
            </span>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 mt-1 tabular-nums truncate">
              {formatCurrency(totalActualSpent)}
            </div>
            <span className="text-[11px] text-festivo-plum-600">
              {totalPlannedBudget > 0 ? `${Math.round((totalActualSpent / totalPlannedBudget) * 100)}% portfolio utilization` : '0%'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
        </div>

        <div className="festivo-card p-5 bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-festivo-plum-400 block">
              Pending Actions
            </span>
            <div className="font-serif text-3xl font-bold text-festivo-plum-950 mt-1 tabular-nums">
              {totalPendingTasks}
            </div>
            <span className="text-[11px] text-festivo-plum-600">Unresolved milestones</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Event Spotlight / Active Event Focus */}
      {activeEvent && (
        <div className="festivo-card p-6 sm:p-8 bg-gradient-to-tr from-white via-white to-festivo-ivory border border-festivo-plum-100 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-festivo-plum-100 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-festivo-coral-100 text-festivo-coral-800 uppercase tracking-wider">
                  Spotlight Celebration
                </span>
                <span className="text-xs text-festivo-plum-400">
                  Target: {formatDate(activeEvent.date)}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1">
                {activeEvent.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-festivo-plum-600 mt-1.5">
                <span className="flex items-center space-x-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-festivo-coral-500" />
                  <span>{activeEvent.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-festivo-plum-500" />
                  <span>{activeEvent.guestCount} Guests</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-semibold text-festivo-coral-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeCountdown?.text}</span>
                </span>
              </div>
            </div>

            {/* Quick Switcher dropdown right inside spotlight */}
            <div className="flex items-center space-x-2.5">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-festivo-plum-200 text-xs font-semibold text-festivo-plum-900 bg-festivo-cream/60 focus:outline-none"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    Focus: {evt.name}
                  </option>
                ))}
              </select>

              <Link
                to={`/events/${activeEvent.id}`}
                className="inline-flex items-center space-x-1.5 bg-festivo-plum-900 hover:bg-festivo-plum-950 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Link
              to={`/events/${activeEvent.id}/budget`}
              className="p-4 rounded-xl bg-festivo-ivory hover:bg-festivo-cream transition-colors border border-festivo-plum-100 block group"
            >
              <div className="flex justify-between items-center text-xs text-festivo-plum-600 mb-1">
                <span className="font-bold uppercase text-[10px]">Financial Health</span>
                <PieChart className="w-4 h-4 text-festivo-coral-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-serif text-lg font-bold text-festivo-plum-950 tabular-nums">
                {formatCurrency(activeSpent, activeEvent.currency)}
              </div>
              <div className="text-[11px] text-festivo-plum-600 mt-1">
                Remaining: <strong className="text-emerald-700 tabular-nums">{formatCurrency(activeRemaining, activeEvent.currency)}</strong>
              </div>
            </Link>

            <Link
              to={`/events/${activeEvent.id}/timeline`}
              className="p-4 rounded-xl bg-festivo-ivory hover:bg-festivo-cream transition-colors border border-festivo-plum-100 block group"
            >
              <div className="flex justify-between items-center text-xs text-festivo-plum-600 mb-1">
                <span className="font-bold uppercase text-[10px]">Timeline Readiness</span>
                <CalendarCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-serif text-lg font-bold text-festivo-plum-950 tabular-nums">
                {activeTaskPercent}% Complete
              </div>
              <div className="text-[11px] text-festivo-plum-600 mt-1">
                {activeCompletedTasks} of {activeTasks.length} tasks completed
              </div>
            </Link>

            <Link
              to={`/events/${activeEvent.id}/vendors`}
              className="p-4 rounded-xl bg-festivo-ivory hover:bg-festivo-cream transition-colors border border-festivo-plum-100 block group"
            >
              <div className="flex justify-between items-center text-xs text-festivo-plum-600 mb-1">
                <span className="font-bold uppercase text-[10px]">Vendor Contracts</span>
                <Briefcase className="w-4 h-4 text-festivo-plum-700 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-serif text-lg font-bold text-festivo-plum-950 tabular-nums">
                {activeBookedVendors} Booked
              </div>
              <div className="text-[11px] text-festivo-plum-600 mt-1">
                {activeVendors.length} partners in pipeline
              </div>
            </Link>

            <Link
              to={`/events/${activeEvent.id}/ai-planner`}
              className="p-4 rounded-xl bg-festivo-ivory hover:bg-festivo-cream transition-colors border border-festivo-plum-100 block group"
            >
              <div className="flex justify-between items-center text-xs text-festivo-plum-600 mb-1">
                <span className="font-bold uppercase text-[10px]">AI Master Dossier</span>
                <Sparkles className="w-4 h-4 text-festivo-coral-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="font-serif text-lg font-bold text-festivo-plum-950">
                {activeEvent.plan ? '13 Sections Ready' : 'Plan Drafted'}
              </div>
              <div className="text-[11px] text-festivo-coral-600 mt-1 font-bold">
                {activeEvent.plan ? 'Explore dossier →' : 'Generate plan now →'}
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Events Portfolio List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-festivo-plum-950">
            All Celebrations in Portfolio
          </h3>
          <span className="text-xs text-festivo-plum-500 font-medium">
            {events.length} celebrations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {events.map((evt) => {
            const spent = (evt.expenses || []).reduce((s, e) => s + (e.actualAmount || e.estimatedAmount || 0), 0);
            const countdown = getDaysUntil(evt.date);
            const pendingTasks = (evt.tasks || []).filter((t) => t.status !== 'completed').length;

            return (
              <div
                key={evt.id}
                className="festivo-card p-5 bg-white flex flex-col justify-between hover:-translate-y-1 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-festivo-plum-50 text-festivo-plum-900">
                      {evt.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-festivo-coral-600">
                      {countdown.text}
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-festivo-plum-950 leading-snug">
                    {evt.name}
                  </h4>

                  <div className="text-xs text-festivo-plum-600 mt-2 space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-festivo-plum-400 shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-festivo-plum-400 shrink-0" />
                      <span>{evt.guestCount} Guests • Budget: <strong className="text-festivo-plum-900 tabular-nums">{formatCurrency(evt.budget, evt.currency)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-festivo-plum-100 flex items-center justify-between text-xs">
                  <span className="text-festivo-plum-500 font-semibold">
                    {pendingTasks} tasks pending
                  </span>
                  <Link
                    to={`/events/${evt.id}`}
                    className="font-bold text-festivo-coral-600 hover:text-festivo-coral-700 flex items-center space-x-1 group"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
