import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Send,
  MessageSquare,
  DollarSign,
  Palette,
  Compass,
  Utensils,
  Music,
  CalendarCheck,
  ShieldAlert,
  Lightbulb,
  Check,
  TrendingDown,
  Layers,
  Clock,
  Briefcase,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { IEvent, IChatMessage } from '../types';
import { formatCurrency, formatDate, triggerCelebrationConfetti } from '../lib/utils';
import { EventSubNav } from '../components/EventSubNav';
import { ExportModal } from '../components/ExportModal';

export const AIPlannerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'chat'>('blueprint');
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await api.getEvent(eventId);
      setEvent(data);
      setChatMessages(data.chatHistory || []);
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
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim() || !event) return;

    try {
      setIsSendingChat(true);
      setChatInput('');

      const tempUserMsg: IChatMessage = {
        id: `user_tmp_${Date.now()}`,
        eventId: event.id,
        role: 'user',
        content: textToSend,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, tempUserMsg]);

      const assistantReply = await api.sendChatMessage(event.id, textToSend);
      setChatMessages((prev) => [...prev, assistantReply]);

      if (assistantReply.suggestedAction?.type === 'add_task') {
        const refreshed = await api.getEvent(event.id);
        setEvent(refreshed);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleApplyAction = async (action: any) => {
    if (!event || !action) return;
    if (action.type === 'add_task' && action.payload) {
      await api.addTask(event.id, action.payload);
      const refreshed = await api.getEvent(event.id);
      setEvent(refreshed);
      triggerCelebrationConfetti();
    }
  };

  const suggestedPrompts = [
    'Make my celebration more affordable.',
    'Suggest a regional gourmet menu.',
    'Create an outdoor rain backup plan.',
    'Prioritize the most important pending tasks.',
    'Suggest interactive entertainment for guests.',
    'Explain where I can reduce costs by 10%.',
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="w-10 h-10 border-3 border-festivo-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="font-serif text-xl font-bold text-festivo-plum-950">Synthesizing AI Studio</h3>
        <p className="text-xs text-festivo-plum-600 mt-1">Accessing Gemini 2.5 Flash Celebration Intelligence...</p>
      </div>
    );
  }

  if (!event) return null;

  const plan = event.plan;

  return (
    <div className="animate-in fade-in duration-200">
      <EventSubNav event={event} onOpenExport={() => setShowExportModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header & Mode Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-festivo-plum-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-festivo-coral-500">
                Generative AI Studio
              </span>
              <span className="text-xs text-festivo-plum-400">•</span>
              <span className="text-xs font-mono text-festivo-plum-700 bg-festivo-cream px-2.5 py-0.5 rounded-md border border-festivo-plum-200 font-semibold">
                {plan?.aiModelUsed || 'gemini-2.5-flash'}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1">
              Celebration Intelligence Engine
            </h1>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* View Mode Switcher */}
            <div className="bg-festivo-cream/80 p-1 rounded-xl flex items-center space-x-1 border border-festivo-plum-100">
              <button
                type="button"
                onClick={() => setActiveTab('blueprint')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'blueprint'
                    ? 'bg-festivo-plum-900 text-white shadow-xs font-bold'
                    : 'text-festivo-plum-700 hover:text-festivo-plum-950'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>13-Point Blueprint</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-festivo-plum-900 text-white shadow-xs font-bold'
                    : 'text-festivo-plum-700 hover:text-festivo-plum-950'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Interactive AI Chat</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-soft hover:shadow-glow transition-all flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : plan ? 'Regenerate Plan' : 'Generate Master Plan'}</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: 13-POINT MASTER CELEBRATION DOSSIER */}
        {/* ============================================================== */}
        {activeTab === 'blueprint' && (
          <>
            {!plan ? (
              <div className="festivo-card p-12 text-center max-w-xl mx-auto my-12 bg-white shadow-card">
                <div className="w-16 h-16 rounded-2xl bg-festivo-coral-50 text-festivo-coral-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-festivo-plum-950">
                  Ready to Synthesize Your Celebration Plan
                </h3>
                <p className="text-xs text-festivo-plum-600 mt-2 mb-6 leading-relaxed">
                  Our GenAI engine will analyze {event.name} ({event.guestCount} guests, budget of {formatCurrency(event.budget, event.currency)}) and compile an exhaustive 13-point operational blueprint.
                </p>
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white font-semibold text-xs px-8 py-3 rounded-2xl shadow-card hover:shadow-glow transition-all inline-flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 13-Point Plan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* A. Executive Summary Card */}
                <div className="festivo-card p-6 sm:p-8 bg-gradient-to-tr from-festivo-cream via-white to-festivo-ivory border border-festivo-plum-100 shadow-card">
                  <div className="flex items-center space-x-2 text-festivo-coral-600 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Section A • Executive Celebration Summary</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-festivo-plum-950 leading-snug">
                    {plan.eventSummary}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-festivo-plum-700">
                    <span className="bg-white px-3 py-1.5 rounded-xl border border-festivo-plum-100 font-medium shadow-xs">
                      🎯 Targeted Guests: <strong className="text-festivo-plum-950">{event.guestCount}</strong>
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-xl border border-festivo-plum-100 font-medium shadow-xs">
                      💰 Budget Envelope: <strong className="text-festivo-plum-950 tabular-nums">{formatCurrency(event.budget, event.currency)}</strong>
                    </span>
                    <span className="bg-white px-3 py-1.5 rounded-xl border border-festivo-plum-100 font-medium shadow-xs">
                      📍 Location: <strong className="text-festivo-plum-950">{event.location}</strong>
                    </span>
                  </div>
                </div>

                {/* B. Recommended Themes */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-festivo-plum-950">
                    <Palette className="w-5 h-5 text-festivo-coral-500" />
                    <h3 className="font-serif text-xl font-bold">Section B • Recommended Design Themes</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.recommendedThemes.map((theme, idx) => (
                      <div key={idx} className="festivo-card p-6 bg-white space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-lg font-bold text-festivo-plum-950">{theme.name}</h4>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-festivo-coral-50 text-festivo-coral-800 font-bold uppercase tracking-wide">
                            {theme.vibe}
                          </span>
                        </div>
                        <p className="text-xs text-festivo-plum-700 leading-relaxed">
                          {theme.description}
                        </p>
                        <div>
                          <span className="text-[10px] font-bold text-festivo-plum-400 uppercase tracking-wider block mb-1.5">
                            Color Palette (Click to copy hex)
                          </span>
                          <div className="flex items-center space-x-2">
                            {theme.colorPalette.map((hex, hIdx) => (
                              <button
                                key={hIdx}
                                type="button"
                                onClick={() => handleCopyHex(hex)}
                                className="flex items-center space-x-1.5 bg-festivo-ivory hover:bg-festivo-cream px-2.5 py-1 rounded-xl border border-festivo-plum-100 text-[11px] font-mono transition-colors"
                                title="Click to copy color code"
                              >
                                <span className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0 shadow-xs" style={{ backgroundColor: hex }} />
                                <span>{copiedHex === hex ? 'Copied!' : hex}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* C. Decoration Suggestions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-festivo-plum-950">
                    <Sparkles className="w-5 h-5 text-festivo-coral-500" />
                    <h3 className="font-serif text-xl font-bold">Section C • Decoration & Styling Specifications</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plan.decorationSuggestions.map((decor, idx) => (
                      <div key={idx} className="festivo-card p-5 bg-white space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-festivo-coral-600 uppercase tracking-wider block mb-1">
                            {decor.area}
                          </span>
                          <p className="text-xs text-festivo-plum-800 leading-relaxed">
                            {decor.concept}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-festivo-plum-100 flex justify-between items-center text-xs">
                          <span className="text-festivo-plum-500 font-medium">Estimated Allocation:</span>
                          <span className="font-bold text-festivo-plum-950 tabular-nums">
                            {formatCurrency(decor.estimatedCost, event.currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* D. Venue Recommendations */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-festivo-plum-950">
                    <Compass className="w-5 h-5 text-festivo-coral-500" />
                    <h3 className="font-serif text-xl font-bold">Section D • Venue Archetypes & Logistics</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {plan.venueRecommendations.map((v, idx) => (
                      <div key={idx} className="festivo-card p-6 bg-white space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-festivo-plum-100 gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-festivo-coral-600">Venue Archetype</span>
                            <h4 className="font-serif text-lg font-bold text-festivo-plum-950">{v.venueType}</h4>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-semibold text-festivo-plum-500 block">Price Range</span>
                            <span className="text-xs font-bold text-festivo-coral-600">{v.estimatedPriceRange}</span>
                          </div>
                        </div>

                        <div className="text-xs text-festivo-plum-700">
                          <span className="font-semibold text-festivo-plum-900">Capacity Match: </span>
                          <span>{v.capacityMatch}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                            <span className="font-bold text-emerald-900 block">Pros:</span>
                            <ul className="list-disc list-inside text-emerald-800 space-y-0.5">
                              {v.pros.map((p, pIdx) => <li key={pIdx}>{p}</li>)}
                            </ul>
                          </div>

                          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100 space-y-1">
                            <span className="font-bold text-amber-900 block">Considerations:</span>
                            <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                              {v.considerations.map((c, cIdx) => <li key={cIdx}>{c}</li>)}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* E. Catering & Menu Ideas */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-festivo-plum-950">
                    <Utensils className="w-5 h-5 text-festivo-coral-500" />
                    <h3 className="font-serif text-xl font-bold">Section E • Catering & Menu Architecture</h3>
                  </div>

                  <div className="festivo-card p-6 bg-white space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="bg-festivo-ivory p-4 rounded-2xl border border-festivo-plum-100 space-y-2">
                        <span className="font-bold text-festivo-coral-600 block uppercase text-[10px]">
                          Welcome Drinks
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-festivo-plum-800">
                          {plan.cateringMenuIdeas.welcomeDrinks.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>

                      <div className="bg-festivo-ivory p-4 rounded-2xl border border-festivo-plum-100 space-y-2">
                        <span className="font-bold text-festivo-coral-600 block uppercase text-[10px]">
                          Starters & Appetizers
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-festivo-plum-800">
                          {plan.cateringMenuIdeas.appetizers.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>

                      <div className="bg-festivo-ivory p-4 rounded-2xl border border-festivo-plum-100 space-y-2">
                        <span className="font-bold text-festivo-coral-600 block uppercase text-[10px]">
                          Gourmet Mains
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-festivo-plum-800">
                          {plan.cateringMenuIdeas.mainCourse.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>

                      <div className="bg-festivo-ivory p-4 rounded-2xl border border-festivo-plum-100 space-y-2">
                        <span className="font-bold text-festivo-coral-600 block uppercase text-[10px]">
                          Festive Desserts
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-festivo-plum-800">
                          {plan.cateringMenuIdeas.desserts.map((de, i) => <li key={i}>{de}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 bg-festivo-cream/70 rounded-2xl text-xs text-festivo-plum-700 flex items-start space-x-2 border border-festivo-sand/60">
                      <span className="font-bold text-festivo-plum-900 shrink-0">Dietary & Allergen Plan:</span>
                      <span>{plan.cateringMenuIdeas.dietaryNotes}</span>
                    </div>
                  </div>
                </div>

                {/* F. Entertainment & Activities */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-festivo-plum-950">
                    <Music className="w-5 h-5 text-festivo-coral-500" />
                    <h3 className="font-serif text-xl font-bold">Section F • Entertainment & Guest Experience</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plan.entertainmentAndActivities.map((act, idx) => (
                      <div key={idx} className="festivo-card p-5 bg-white space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-festivo-plum-50 text-festivo-plum-800 font-bold uppercase inline-block mb-1">
                            {act.timing}
                          </span>
                          <h4 className="font-serif font-bold text-festivo-plum-950 text-sm">{act.activity}</h4>
                          <p className="text-xs text-festivo-plum-700 leading-relaxed mt-1">{act.description}</p>
                        </div>
                        <div className="pt-2.5 text-[11px] text-festivo-coral-600 font-semibold border-t border-festivo-plum-100">
                          Audience: {act.targetAudience}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* G. Budget Allocations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-festivo-plum-950">
                      <DollarSign className="w-5 h-5 text-festivo-coral-500" />
                      <h3 className="font-serif text-xl font-bold">Section G • Exact Budget Allocation Breakdown</h3>
                    </div>
                    <Link
                      to={`/events/${event.id}/budget`}
                      className="text-xs font-bold text-festivo-coral-600 hover:text-festivo-coral-700"
                    >
                      Open Interactive Budget Studio →
                    </Link>
                  </div>

                  <div className="festivo-card p-6 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      {plan.budgetAllocations.map((alloc, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-festivo-plum-100 bg-festivo-ivory">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-festivo-plum-950 capitalize">{alloc.category}</span>
                            <span className="font-bold text-festivo-coral-600">{alloc.percentage}%</span>
                          </div>
                          <div className="font-serif text-base font-bold text-festivo-plum-900 tabular-nums">
                            {formatCurrency(alloc.allocatedAmount, event.currency)}
                          </div>
                          <p className="text-[11px] text-festivo-plum-600 mt-1 line-clamp-2">
                            {alloc.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* H. Preparation Timeline & Milestones */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-festivo-plum-950">
                      <CalendarCheck className="w-5 h-5 text-festivo-coral-500" />
                      <h3 className="font-serif text-xl font-bold">Section H • Chronological Preparation Roadmap</h3>
                    </div>
                    <Link
                      to={`/events/${event.id}/timeline`}
                      className="text-xs font-bold text-festivo-coral-600 hover:text-festivo-coral-700"
                    >
                      Manage Timeline Tasks →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plan.preparationTimeline.map((mile, idx) => (
                      <div key={idx} className="festivo-card p-5 bg-white space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-festivo-plum-100">
                          <span className="font-serif font-bold text-festivo-plum-950 text-sm">{mile.milestone}</span>
                          <span className="text-[10px] font-mono text-festivo-coral-600 font-bold">{mile.dueTimeline}</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-festivo-plum-700 pt-1">
                          {mile.tasks.map((t, tIdx) => (
                            <li key={tIdx} className="flex items-start space-x-2">
                              <span className="text-festivo-coral-500 font-bold">•</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* I. Vendor Checklist */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-festivo-plum-950">
                      <Briefcase className="w-5 h-5 text-festivo-coral-500" />
                      <h3 className="font-serif text-xl font-bold">Section I • Vendor Due-Diligence Checklist</h3>
                    </div>
                    <Link
                      to={`/events/${event.id}/vendors`}
                      className="text-xs font-bold text-festivo-coral-600 hover:text-festivo-coral-700"
                    >
                      Open Vendor Manager →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.vendorChecklist.map((item, idx) => (
                      <div key={idx} className="festivo-card p-5 bg-white space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-festivo-plum-100">
                          <span className="font-bold text-festivo-plum-950 text-sm">{item.category}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-festivo-cream font-bold text-festivo-plum-700">
                            Window: {item.bookingWindow}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-festivo-plum-500 block mt-1">Critical Due-Diligence Inquiries:</span>
                        <ul className="list-disc list-inside space-y-1 text-festivo-plum-800">
                          {item.criticalQuestions.map((q, qIdx) => <li key={qIdx}>{q}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* J. Event-Day Schedule */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-festivo-plum-950">
                    <Clock className="w-5 h-5 text-festivo-coral-500" />
                    <h3 className="font-serif text-xl font-bold">Section J • Minute-by-Minute Event-Day Schedule</h3>
                  </div>

                  <div className="festivo-card p-6 bg-white shadow-soft">
                    <div className="space-y-3">
                      {plan.eventDaySchedule.map((slot, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-festivo-ivory border border-festivo-plum-100 flex items-start justify-between text-xs gap-3">
                          <div className="flex items-start space-x-3.5">
                            <span className="font-mono text-festivo-coral-600 font-bold shrink-0 pt-0.5">
                              {slot.timeSlot}
                            </span>
                            <div>
                              <div className="font-bold text-festivo-plum-950">{slot.activity}</div>
                              {slot.notes && (
                                <div className="text-[11px] text-festivo-plum-600 mt-0.5">{slot.notes}</div>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-festivo-plum-700 font-bold border border-festivo-plum-200 shrink-0">
                            {slot.responsiblePerson}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* K. Risks & Contingencies */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-festivo-plum-950">
                    <ShieldAlert className="w-5 h-5 text-festivo-coral-500" />
                    <h3 className="font-serif text-xl font-bold">Section K • Risk Mitigation & Backup Strategy</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.riskAndContingencies.map((risk, idx) => (
                      <div key={idx} className="festivo-card p-5 bg-white space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-festivo-plum-950">{risk.risk}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                            risk.impact === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {risk.impact} impact
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-festivo-cream/60 text-festivo-plum-800 border border-festivo-sand">
                          <span className="font-bold block text-[11px] text-festivo-plum-900 mb-0.5">Contingency Protocol:</span>
                          {risk.contingencyPlan}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* L & M. Recommendations and Cost Savings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* L. Personalized Recommendations */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-festivo-plum-950">
                      <Lightbulb className="w-5 h-5 text-festivo-coral-500" />
                      <h3 className="font-serif text-lg font-bold">Section L • Tailored Recommendations</h3>
                    </div>
                    <div className="festivo-card p-5 bg-white space-y-2.5 text-xs">
                      {plan.personalizedRecommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-festivo-plum-800">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* M. Cost-Saving Opportunities */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-festivo-plum-950">
                      <TrendingDown className="w-5 h-5 text-festivo-coral-500" />
                      <h3 className="font-serif text-lg font-bold">Section M • Cost-Saving Opportunities</h3>
                    </div>
                    <div className="festivo-card p-5 bg-white space-y-3 text-xs">
                      {plan.costSavingOpportunities.map((opt, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-festivo-coral-50/50 border border-festivo-coral-100">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-festivo-coral-900">{opt.tip}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold shrink-0 ml-2">
                              {opt.potentialSavings}
                            </span>
                          </div>
                          <div className="text-[11px] text-festivo-plum-600 mt-1">
                            Tradeoff: {opt.tradeoff}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INTERACTIVE EVENT PLANNING AI CONVERSATION */}
        {/* ============================================================== */}
        {activeTab === 'chat' && (
          <div className="festivo-card bg-white h-[650px] flex flex-col overflow-hidden shadow-card">
            {/* Chat Header */}
            <div className="p-4 border-b border-festivo-plum-100 bg-festivo-ivory flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-festivo-coral-500 text-white flex items-center justify-center shadow-soft">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-festivo-plum-950">
                    Festivo Conversational Planning Advisor
                  </h3>
                  <span className="text-[10px] text-festivo-plum-500 block">
                    Context: {event.name} ({event.guestCount} guests, <strong className="text-festivo-plum-900 tabular-nums">{formatCurrency(event.budget, event.currency)}</strong>)
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Context-Aware</span>
              </span>
            </div>

            {/* Message History Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="py-12 text-center max-w-sm mx-auto space-y-2">
                  <MessageSquare className="w-10 h-10 text-festivo-plum-300 mx-auto" />
                  <p className="font-serif text-base font-bold text-festivo-plum-900">
                    Ask Anything About Your Celebration
                  </p>
                  <p className="text-xs text-festivo-plum-600">
                    Ask for budget reductions, alternative catering options, weather contingency plans, or schedule dry runs.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                        msg.role === 'user'
                          ? 'bg-festivo-plum-900 text-white rounded-br-xs shadow-soft'
                          : 'bg-festivo-cream/80 text-festivo-plum-950 border border-festivo-sand rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      {/* Suggested Action Pill if AI returned a proposal */}
                      {msg.suggestedAction && (
                        <div className="pt-2 border-t border-festivo-plum-200/50 mt-2">
                          <button
                            type="button"
                            onClick={() => handleApplyAction(msg.suggestedAction)}
                            className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{msg.suggestedAction.label}</span>
                          </button>
                        </div>
                      )}

                      <div
                        className={`text-[9px] text-right font-medium ${
                          msg.role === 'user' ? 'text-festivo-plum-300' : 'text-festivo-plum-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="bg-festivo-cream rounded-2xl p-3 text-xs text-festivo-plum-600 flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-festivo-coral-500 border-t-transparent rounded-full animate-spin" />
                    <span>Festivo AI is formulating advice...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggested Prompts Strip */}
            <div className="px-4 py-2.5 bg-festivo-ivory border-t border-festivo-plum-100 flex items-center space-x-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] uppercase font-bold text-festivo-plum-400 shrink-0">
                Suggested Prompts:
              </span>
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-festivo-coral-50 text-[11px] font-medium text-festivo-plum-800 border border-festivo-plum-200/70 shrink-0 transition-colors shadow-xs"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <div className="p-4 border-t border-festivo-plum-100 bg-white flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask Festivo AI (e.g. 'Where can we save ₹20,000 on decor?')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-900 focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 bg-festivo-ivory/30"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isSendingChat || !chatInput.trim()}
                className="bg-festivo-coral-500 hover:bg-festivo-coral-600 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-xs transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <ExportModal
        isOpen={showExportModal}
        event={event}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};
