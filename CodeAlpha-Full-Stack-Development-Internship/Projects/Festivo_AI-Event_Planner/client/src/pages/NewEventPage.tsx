import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  Info,
  CheckCircle,
  HelpCircle,
  Check,
} from 'lucide-react';
import { api } from '../lib/api';
import { EventType } from '../types';
import { formatCurrency, triggerCelebrationConfetti } from '../lib/utils';

export const NewEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatePlanImmediately, setGeneratePlanImmediately] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'wedding' as EventType,
    date: '',
    location: '',
    guestCount: 150,
    budget: 500000,
    currency: 'INR',
    themePreference: '',
    venuePreference: '',
    foodPreferences: '',
    dietaryRestrictions: '',
    culturalRequirements: '',
    additionalNotes: '',
  });

  const eventTypes: { value: EventType; label: string; icon: string; defaultBudget: number; hint: string }[] = [
    { value: 'wedding', label: 'Wedding & Sangeet', icon: '💍', defaultBudget: 1500000, hint: 'Multi-day ceremonies & feasts' },
    { value: 'birthday', label: 'Milestone Birthday', icon: '🎂', defaultBudget: 100000, hint: 'Themes, cakes & games' },
    { value: 'anniversary', label: 'Romantic Anniversary', icon: '🥂', defaultBudget: 250000, hint: 'Intimate dinner & nostalgia' },
    { value: 'community_gathering', label: 'Community Gala', icon: '✨', defaultBudget: 350000, hint: 'Festivals & society events' },
    { value: 'college_event', label: 'College / Campus Fest', icon: '🎓', defaultBudget: 400000, hint: 'Competitions & performances' },
    { value: 'custom', label: 'Custom Celebration', icon: '🎉', defaultBudget: 200000, hint: 'Bespoke event framework' },
  ];

  const budgetPresets = [
    { label: '₹1 Lakh', val: 100000 },
    { label: '₹3 Lakh', val: 300000 },
    { label: '₹5 Lakh', val: 500000 },
    { label: '₹12 Lakh', val: 1200000 },
    { label: '₹25 Lakh', val: 2500000 },
    { label: '₹50 Lakh', val: 5000000 },
  ];

  const handleTypeChange = (type: EventType) => {
    const selected = eventTypes.find((t) => t.value === type);
    setFormData((prev) => ({
      ...prev,
      type,
      budget: prev.budget === 500000 && selected ? selected.defaultBudget : prev.budget,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) {
      setErrorMsg('Please enter an event name.');
      return;
    }
    if (!formData.date) {
      setErrorMsg('Please select a celebration date.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMsg('Please specify a destination city or venue.');
      return;
    }
    if (formData.guestCount <= 0) {
      setErrorMsg('Guest count must be at least 1.');
      return;
    }
    if (formData.budget <= 0) {
      setErrorMsg('Budget must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.createEvent(formData);

      if (generatePlanImmediately) {
        try {
          await api.generatePlan(created.id);
        } catch (planErr) {
          console.warn('Initial plan generation skipped or queued:', planErr);
        }
      }

      triggerCelebrationConfetti();
      navigate(`/events/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create celebration. Please review the inputs and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-festivo-coral-100 text-festivo-coral-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Celebration Blueprint Wizard</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-festivo-plum-950 tracking-tight">
          Create Your Celebration
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-festivo-plum-600 leading-relaxed">
          Tell us about your upcoming event. Our GenAI planning engine will synthesize budgets, timelines, themes, and vendor requirements tailored specifically for you.
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="festivo-card p-6 sm:p-10 space-y-8 bg-white shadow-card">
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* 1. Event Type Selector */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-festivo-coral-500 text-white font-bold text-xs flex items-center justify-center">1</span>
            <label className="font-serif text-base font-bold text-festivo-plum-950">
              Select Celebration Type
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {eventTypes.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => handleTypeChange(t.value)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  formData.type === t.value
                    ? 'border-festivo-coral-500 bg-festivo-coral-50/60 shadow-soft ring-2 ring-festivo-coral-500/30'
                    : 'border-festivo-plum-100 hover:border-festivo-plum-200 bg-festivo-ivory/50'
                }`}
              >
                <div>
                  <span className="text-3xl mb-2 block">{t.icon}</span>
                  <span className="text-xs font-bold text-festivo-plum-950 block">{t.label}</span>
                </div>
                <span className="text-[10px] text-festivo-plum-500 mt-2 block">{t.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Core Details Grid */}
        <div className="pt-6 border-t border-festivo-plum-100">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-festivo-coral-500 text-white font-bold text-xs flex items-center justify-center">2</span>
            <label className="font-serif text-base font-bold text-festivo-plum-950">
              Basic Celebration Information
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Celebration Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maya & Kabir's Sunset Sangeet"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Celebration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Destination or City Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Udaipur, Mumbai, Goa, Bangalore"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Expected Guest Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                required
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>
          </div>
        </div>

        {/* 3. Budget Configuration & Presets */}
        <div className="pt-6 border-t border-festivo-plum-100">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-6 h-6 rounded-full bg-festivo-coral-500 text-white font-bold text-xs flex items-center justify-center">3</span>
            <label className="font-serif text-base font-bold text-festivo-plum-950">
              Budget Envelope & Presets
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Total Planned Budget <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1000"
                step="5000"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40 tabular-nums font-semibold"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] uppercase font-bold text-festivo-plum-400 mr-1">Presets:</span>
                {budgetPresets.map((p) => (
                  <button
                    type="button"
                    key={p.val}
                    onClick={() => setFormData({ ...formData, budget: p.val })}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                      formData.budget === p.val
                        ? 'bg-festivo-coral-500 text-white border-festivo-coral-500 shadow-xs'
                        : 'bg-festivo-cream text-festivo-plum-800 border-festivo-plum-200/70 hover:bg-festivo-sand/60'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40 font-semibold"
              >
                <option value="INR">INR (₹) - Default</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Creative & Cultural Preferences */}
        <div className="pt-6 border-t border-festivo-plum-100 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-festivo-coral-500 text-white font-bold text-xs flex items-center justify-center">4</span>
            <label className="font-serif text-base font-bold text-festivo-plum-950">
              Creative Vision & Cultural Preferences
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Preferred Theme / Aesthetic
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Rajputana, Pastel Floral, Retro Bollywood, Whimsical Garden"
                value={formData.themePreference}
                onChange={(e) => setFormData({ ...formData, themePreference: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Venue Preference
              </label>
              <input
                type="text"
                placeholder="e.g. Heritage Courtyard, Beachfront Lawn, Luxury Banquet Hall"
                value={formData.venuePreference}
                onChange={(e) => setFormData({ ...formData, venuePreference: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Food & Beverage Preferences
              </label>
              <input
                type="text"
                placeholder="e.g. Regional Awadhi & Live Chaat, Continental Buffet, Woodfired Pizza"
                value={formData.foodPreferences}
                onChange={(e) => setFormData({ ...formData, foodPreferences: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
                Dietary Restrictions
              </label>
              <input
                type="text"
                placeholder="e.g. Strict Jain counter, Vegan options, Nut-free cake"
                value={formData.dietaryRestrictions}
                onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
              Cultural, Ceremonial or Personal Traditions
            </label>
            <input
              type="text"
              placeholder="e.g. Sunset pheras, acoustic folk welcome, interactive games for kids"
              value={formData.culturalRequirements}
              onChange={(e) => setFormData({ ...formData, culturalRequirements: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-festivo-plum-800 mb-1">
              Special Constraints / Notes for AI Planner
            </label>
            <textarea
              rows={2}
              placeholder="Any specific constraints, favorite artists, or priorities you want the AI to consider..."
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/40"
            />
          </div>
        </div>

        {/* 5. Immediate AI Plan Generation Toggle */}
        <div className="pt-6 border-t border-festivo-plum-100 flex items-center justify-between p-5 rounded-2xl bg-festivo-cream/60 border border-festivo-plum-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-festivo-coral-500 text-white flex items-center justify-center shrink-0 shadow-soft">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold text-festivo-plum-950 block">
                Generate 13-Point AI Master Plan Immediately
              </span>
              <span className="text-xs text-festivo-plum-600 block mt-0.5">
                Automatically creates themes, decor concepts, menus, mathematical budget allocations, and day-of schedules upon submission.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={generatePlanImmediately}
            onChange={(e) => setGeneratePlanImmediately(e.target.checked)}
            className="w-5 h-5 text-festivo-coral-500 rounded focus:ring-festivo-coral-400 cursor-pointer accent-festivo-coral-500"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all duration-150"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Celebration Blueprint...</span>
              </>
            ) : (
              <>
                <span>Launch Celebration Studio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
