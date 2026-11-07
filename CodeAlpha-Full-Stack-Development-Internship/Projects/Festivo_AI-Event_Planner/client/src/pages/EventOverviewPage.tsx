import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  PieChart,
  CalendarCheck,
  Briefcase,
  Lightbulb,
  Clock,
  ArrowRight,
  Plus,
  Printer,
  CheckCircle,
  AlertCircle,
  Trash2,
  Check,
  MapPin,
  Users,
} from 'lucide-react';
import { api } from '../lib/api';
import { IEvent } from '../types';
import { formatCurrency, formatDate, getDaysUntil, triggerCelebrationConfetti } from '../lib/utils';
import { EventSubNav } from '../components/EventSubNav';
import { ExportModal } from '../components/ExportModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const EventOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await api.getEvent(eventId);
      setEvent(data);
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!event) return;
    try {
      setIsGenerating(true);
      const { plan, event: updated } = await api.generatePlan(event.id);
      setEvent(updated);
      triggerCelebrationConfetti();
      navigate(`/events/${event.id}/ai-planner`);
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    try {
      await api.deleteEvent(event.id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-3 border-festivo-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-festivo-plum-950">Loading Celebration Studio</h3>
        <p className="text-xs text-festivo-plum-600 mt-1">Synchronizing financial records, tasks, and AI plans...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-festivo-coral-500 mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-bold text-festivo-plum-950">Event Not Found</h2>
        <p className="text-xs text-festivo-plum-600 mt-2 mb-6">
          The requested celebration may have been removed or does not exist.
        </p>
        <Link
          to="/dashboard"
          className="bg-festivo-coral-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-soft"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const spentTotal = (event.expenses || []).reduce((s, e) => s + (e.actualAmount || e.estimatedAmount || 0), 0);
  const remainingBudget = event.budget - spentTotal;
  const utilization = event.budget > 0 ? Math.round((spentTotal / event.budget) * 100) : 0;
  const tasks = event.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="animate-in fade-in duration-200">
      <EventSubNav event={event} onOpenExport={() => setShowExportModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* AI Plan Banner */}
        {!event.plan ? (
          <div className="festivo-card p-6 sm:p-8 bg-gradient-to-r from-festivo-plum-950 via-festivo-plum-900 to-festivo-plum-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-card">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-festivo-coral-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Master Blueprint Ready to Generate</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                Synthesize Your 13-Point Celebration Dossier
              </h3>
              <p className="text-xs text-festivo-plum-200 max-w-xl leading-relaxed">
                Let Gemini build your theme palettes, decor specs, catering menu, timeline milestones, and day-of schedule tailored to {event.name}.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 disabled:opacity-50 text-white font-semibold text-xs px-6 py-3 rounded-2xl shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all flex items-center space-x-2 shrink-0"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 13-Point Plan</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="festivo-card p-6 bg-gradient-to-r from-festivo-cream/90 via-white to-festivo-ivory border border-festivo-coral-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-festivo-coral-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Active 13-Point AI Celebration Blueprint</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-festivo-plum-950">
                {event.plan.recommendedThemes[0]?.name || 'Tailored Celebration Design'}
              </h3>
              <p className="text-xs text-festivo-plum-700 max-w-2xl line-clamp-2 leading-relaxed">
                {event.plan.eventSummary}
              </p>
            </div>
            <Link
              to={`/events/${event.id}/ai-planner`}
              className="bg-festivo-plum-900 hover:bg-festivo-plum-950 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center space-x-1.5 shrink-0 shadow-xs"
            >
              <span>Explore AI Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 4 Interactive Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Budget Health */}
          <Link
            to={`/events/${event.id}/budget`}
            className="festivo-card p-5 bg-white hover:-translate-y-1 transition-all block group"
          >
            <div className="flex items-center justify-between text-xs text-festivo-plum-600 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Financial Health</span>
              <PieChart className="w-4 h-4 text-festivo-coral-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 tabular-nums">
              {formatCurrency(spentTotal, event.currency)}
            </div>
            <div className="w-full bg-festivo-cream h-2 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all ${
                  utilization > 100 ? 'bg-red-500' : 'bg-festivo-coral-500'
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-festivo-plum-600 mt-2">
              <span>{utilization}% of envelope</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {formatCurrency(remainingBudget, event.currency)} buffer
              </span>
            </div>
          </Link>

          {/* Timeline & Tasks */}
          <Link
            to={`/events/${event.id}/timeline`}
            className="festivo-card p-5 bg-white hover:-translate-y-1 transition-all block group"
          >
            <div className="flex items-center justify-between text-xs text-festivo-plum-600 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Timeline Readiness</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 tabular-nums">
              {taskProgress}% Complete
            </div>
            <div className="w-full bg-festivo-cream h-2 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-festivo-plum-600 mt-2">
              <span>{completedTasks} completed</span>
              <span className="font-bold text-amber-800">
                {tasks.length - completedTasks} pending
              </span>
            </div>
          </Link>

          {/* Vendors */}
          <Link
            to={`/events/${event.id}/vendors`}
            className="festivo-card p-5 bg-white hover:-translate-y-1 transition-all block group"
          >
            <div className="flex items-center justify-between text-xs text-festivo-plum-600 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Vendor Pipeline</span>
              <Briefcase className="w-4 h-4 text-festivo-plum-700 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 tabular-nums">
              {(event.vendors || []).filter((v) => v.bookingStatus === 'booked').length} Booked
            </div>
            <div className="text-[11px] text-festivo-plum-600 mt-3 space-y-0.5">
              <div className="flex justify-between">
                <span>Total partners:</span>
                <span className="font-bold text-festivo-plum-900">{(event.vendors || []).length}</span>
              </div>
              <div className="flex justify-between">
                <span>In negotiation:</span>
                <span className="font-bold text-festivo-plum-900">
                  {(event.vendors || []).filter((v) => v.bookingStatus === 'negotiating' || v.bookingStatus === 'shortlisted').length}
                </span>
              </div>
            </div>
          </Link>

          {/* Ideas Gallery */}
          <Link
            to={`/events/${event.id}/ideas`}
            className="festivo-card p-5 bg-white hover:-translate-y-1 transition-all block group"
          >
            <div className="flex items-center justify-between text-xs text-festivo-plum-600 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Inspiration Gallery</span>
              <Lightbulb className="w-4 h-4 text-festivo-gold-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="font-serif text-2xl font-bold text-festivo-plum-950 tabular-nums">
              {(event.ideas || []).length} Concepts
            </div>
            <div className="text-[11px] text-festivo-plum-600 mt-3 space-y-0.5">
              <div className="flex justify-between">
                <span>Starred favorites:</span>
                <span className="font-bold text-festivo-coral-600">
                  {(event.ideas || []).filter((i) => i.isFavorite).length} saved
                </span>
              </div>
              <div className="flex justify-between">
                <span>Explore gallery:</span>
                <span className="font-bold text-festivo-plum-900">Themes & Decor →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* 2-Column Section: Core Details & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Upcoming Tasks & Run-of-Show */}
          <div className="lg:col-span-2 space-y-6">
            <div className="festivo-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-festivo-plum-100">
                <div className="flex items-center space-x-2">
                  <CalendarCheck className="w-5 h-5 text-festivo-coral-500" />
                  <h3 className="font-serif text-lg font-bold text-festivo-plum-950">
                    Next Priority Actions
                  </h3>
                </div>
                <Link
                  to={`/events/${event.id}/timeline`}
                  className="text-xs font-semibold text-festivo-coral-600 hover:text-festivo-coral-700"
                >
                  View All Tasks ({tasks.length}) →
                </Link>
              </div>

              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-festivo-plum-500">
                  No tasks added yet. Generate an AI plan or add manual tasks.
                </div>
              ) : (
                <div className="divide-y divide-festivo-plum-100/60">
                  {tasks.slice(0, 5).map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          t.status === 'completed'
                            ? 'bg-emerald-500'
                            : t.priority === 'urgent'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`} />
                        <div>
                          <div className={`text-xs font-bold ${t.status === 'completed' ? 'line-through text-festivo-plum-400' : 'text-festivo-plum-950'}`}>
                            {t.title}
                          </div>
                          {t.description && (
                            <div className="text-[11px] text-festivo-plum-600 mt-0.5 line-clamp-1">
                              {t.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-festivo-cream text-festivo-plum-700'
                        }`}>
                          {t.status}
                        </span>
                        <div className="text-[10px] text-festivo-plum-500 mt-0.5 font-medium tabular-nums">
                          {formatDate(t.dueDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Day-of Schedule Preview (if plan exists) */}
            {event.plan?.eventDaySchedule && (
              <div className="festivo-card p-6 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-festivo-plum-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-festivo-plum-800" />
                    <h3 className="font-serif text-lg font-bold text-festivo-plum-950">
                      Event-Day Master Schedule (Run of Show)
                    </h3>
                  </div>
                  <Link
                    to={`/events/${event.id}/ai-planner`}
                    className="text-xs font-semibold text-festivo-coral-600 hover:text-festivo-coral-700"
                  >
                    Full Schedule →
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {event.plan.eventDaySchedule.slice(0, 4).map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-festivo-ivory border border-festivo-plum-100/70 flex items-start justify-between text-xs gap-3"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="font-mono text-festivo-coral-600 font-bold text-[11px] shrink-0 pt-0.5">
                          {slot.timeSlot}
                        </span>
                        <div>
                          <div className="font-bold text-festivo-plum-950">{slot.activity}</div>
                          {slot.notes && (
                            <div className="text-[11px] text-festivo-plum-600 mt-0.5">{slot.notes}</div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-festivo-plum-700 font-semibold border border-festivo-plum-100 shrink-0">
                        {slot.responsiblePerson}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Event Details & Danger Zone */}
          <div className="space-y-6">
            <div className="festivo-card p-6 bg-white space-y-4">
              <h3 className="font-serif text-base font-bold text-festivo-plum-950 border-b border-festivo-plum-100 pb-2">
                Celebration Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-festivo-plum-400 uppercase text-[10px] font-bold block">Theme Preference</span>
                  <span className="font-bold text-festivo-plum-950">{event.themePreference || 'None specified'}</span>
                </div>
                <div>
                  <span className="text-festivo-plum-400 uppercase text-[10px] font-bold block">Venue Preference</span>
                  <span className="font-bold text-festivo-plum-950">{event.venuePreference || 'Open to recommendations'}</span>
                </div>
                <div>
                  <span className="text-festivo-plum-400 uppercase text-[10px] font-bold block">Catering & Food</span>
                  <span className="font-bold text-festivo-plum-950">{event.foodPreferences || 'Standard festive catering'}</span>
                </div>
                <div>
                  <span className="text-festivo-plum-400 uppercase text-[10px] font-bold block">Dietary Restrictions</span>
                  <span className="font-bold text-festivo-plum-950">{event.dietaryRestrictions || 'None'}</span>
                </div>
                <div>
                  <span className="text-festivo-plum-400 uppercase text-[10px] font-bold block">Cultural / Personal</span>
                  <span className="font-bold text-festivo-plum-950">{event.culturalRequirements || 'None'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-festivo-plum-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Celebration</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="text-xs text-festivo-plum-800 hover:text-festivo-plum-950 flex items-center space-x-1 font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-festivo-coral-500" />
                  <span>Print Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ExportModal
        isOpen={showExportModal}
        event={event}
        onClose={() => setShowExportModal(false)}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Celebration"
        message={`Are you sure you want to permanently delete "${event.name}"? All associated budget items, tasks, and vendor contracts will be permanently removed.`}
        confirmLabel="Yes, Delete Event"
        onConfirm={handleDeleteEvent}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
