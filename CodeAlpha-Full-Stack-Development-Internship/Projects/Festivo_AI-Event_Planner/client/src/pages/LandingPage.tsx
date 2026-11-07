import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  PieChart,
  CalendarCheck,
  Briefcase,
  Lightbulb,
  CheckCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Users,
  Compass,
  Zap,
  Utensils,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const [activePreviewTab, setActivePreviewTab] = useState<'theme' | 'budget' | 'schedule' | 'menu'>('theme');

  return (
    <div className="min-h-screen bg-festivo-ivory flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] bg-gradient-to-b from-festivo-coral-100/50 via-festivo-cream/60 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Competition Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-festivo-plum-200/60 shadow-soft text-xs font-semibold text-festivo-plum-900 mb-6 animate-in fade-in duration-300">
            <span className="w-2 h-2 rounded-full bg-festivo-coral-500 animate-pulse" />
            <span>Prompt Wars Hackathon Edition</span>
            <span className="text-festivo-plum-300">•</span>
            <span className="text-festivo-coral-600 font-bold">GenAI Celebration Architect</span>
          </div>

          {/* Hero Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-festivo-plum-950 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Every Celebration,{' '}
            <span className="bg-gradient-to-r from-festivo-coral-500 via-festivo-plum-700 to-festivo-coral-600 bg-clip-text text-transparent italic font-serif">
              Beautifully Planned.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-festivo-plum-700 max-w-2xl mx-auto font-normal leading-relaxed">
            The intelligent celebration planning assistant that orchestrates weddings, milestone birthdays, and community gatherings with structured budgets, timelines, vendor checklists, and tailored concepts.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/events/new"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-card hover:shadow-glow hover:-translate-y-0.5 transition-all group duration-150"
            >
              <span>Plan My Event</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/events/evt_wedding_royal"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-festivo-cream text-festivo-plum-900 font-semibold px-7 py-3.5 rounded-2xl border border-festivo-plum-200/80 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-150"
            >
              <Sparkles className="w-4 h-4 text-festivo-coral-500" />
              <span>Explore Live Demo Plan</span>
            </Link>
          </div>

          {/* Trust Value Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-festivo-plum-700 font-semibold">
            <div className="flex items-center space-x-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-festivo-plum-100 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>13-Point Structured GenAI Plan</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-festivo-plum-100 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-Friction Offline Demo Store</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-festivo-plum-100 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Recharts Analytics</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/60 px-3 py-1.5 rounded-full border border-festivo-plum-100 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Boardroom Printable PDF Briefs</span>
            </div>
          </div>

          {/* 2. INTERACTIVE LIVE PLAN PREVIEW MOCKUP */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-white/95 to-festivo-sand/40 border border-festivo-plum-200/70 shadow-floating">
            <div className="rounded-2xl bg-white border border-festivo-plum-100/90 overflow-hidden text-left p-6 sm:p-8">
              {/* Event Header Strip */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-festivo-plum-100 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-festivo-coral-100 text-festivo-coral-800 uppercase tracking-wider">
                      Interactive Blueprint Preview
                    </span>
                    <span className="text-xs text-festivo-plum-400 font-mono">Udaipur, Rajasthan</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1">
                    Aarav & Diya's Royal Sangeet & Wedding
                  </h3>
                  <p className="text-xs text-festivo-plum-600 mt-0.5">
                    The Leela Palace, Udaipur • 350 Guests • Budget ₹ 18,00,000 (100% Allocated)
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/events/evt_wedding_royal/ai-planner"
                    className="bg-festivo-plum-900 hover:bg-festivo-plum-950 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                  >
                    <span>Launch Full Studio</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Interactive Preview Sub-Tabs */}
              <div className="flex space-x-2 overflow-x-auto py-3 border-b border-festivo-plum-100/80 scrollbar-none text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('theme')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activePreviewTab === 'theme'
                      ? 'bg-festivo-plum-900 text-white shadow-xs font-bold'
                      : 'text-festivo-plum-700 hover:bg-festivo-cream'
                  }`}
                >
                  Theme & Aesthetic
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('budget')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activePreviewTab === 'budget'
                      ? 'bg-festivo-plum-900 text-white shadow-xs font-bold'
                      : 'text-festivo-plum-700 hover:bg-festivo-cream'
                  }`}
                >
                  Budget Allocation (₹18L)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('schedule')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activePreviewTab === 'schedule'
                      ? 'bg-festivo-plum-900 text-white shadow-xs font-bold'
                      : 'text-festivo-plum-700 hover:bg-festivo-cream'
                  }`}
                >
                  Run of Show (Day-Of)
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('menu')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activePreviewTab === 'menu'
                      ? 'bg-festivo-plum-900 text-white shadow-xs font-bold'
                      : 'text-festivo-plum-700 hover:bg-festivo-cream'
                  }`}
                >
                  Catering Architecture
                </button>
              </div>

              {/* Tab Contents */}
              <div className="pt-5">
                {activePreviewTab === 'theme' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-festivo-ivory border border-festivo-plum-100 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-festivo-plum-950 text-base">Regal Mewar & Sunset Marigold</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-festivo-coral-100 text-festivo-coral-800 font-bold uppercase">
                          Palace Splendor
                        </span>
                      </div>
                      <p className="text-xs text-festivo-plum-700 leading-relaxed">
                        Deep plum silk drapes, warm ochre florals, and antique brass bells harmonizing with floating lotus oil lamps along the lake shore.
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="w-6 h-6 rounded-lg bg-[#4A1D36] border border-white shadow-xs" title="Deep Royal Plum" />
                        <span className="w-6 h-6 rounded-lg bg-[#DE3E1B] border border-white shadow-xs" title="Marigold Coral" />
                        <span className="w-6 h-6 rounded-lg bg-[#DFCA71] border border-white shadow-xs" title="Antique Brass Gold" />
                        <span className="w-6 h-6 rounded-lg bg-[#FDFBF7] border border-stone-300 shadow-xs" title="Ivory Silk" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-festivo-ivory border border-festivo-plum-100 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-serif font-bold text-festivo-plum-950 text-base">Pastel Starlight Romance</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-festivo-plum-100 text-festivo-plum-800 font-bold uppercase">
                          Modern Romantic
                        </span>
                      </div>
                      <p className="text-xs text-festivo-plum-700 leading-relaxed">
                        Blush rose floral ceiling, champagne candle lanterns, and a canopy of warm micro-fairy lights for the late evening Sangeet musical.
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="w-6 h-6 rounded-lg bg-[#EFD7E4] border border-white shadow-xs" title="Blush Rose" />
                        <span className="w-6 h-6 rounded-lg bg-[#C9AF43] border border-white shadow-xs" title="Champagne Gold" />
                        <span className="w-6 h-6 rounded-lg bg-[#F7F3EB] border border-white shadow-xs" title="Warm Pearl" />
                        <span className="w-6 h-6 rounded-lg bg-[#2A0D1E] border border-stone-300 shadow-xs" title="Velvet Midnight" />
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'budget' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-festivo-ivory border border-festivo-plum-100">
                      <span className="text-[10px] uppercase font-bold text-festivo-plum-500 block">Heritage Venue</span>
                      <span className="font-serif text-lg font-bold text-festivo-plum-950 mt-0.5 block">₹ 6,48,000</span>
                      <span className="text-[10px] text-festivo-coral-600 font-semibold">36% of total</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-festivo-ivory border border-festivo-plum-100">
                      <span className="text-[10px] uppercase font-bold text-festivo-plum-500 block">Royal Feast (350 pax)</span>
                      <span className="font-serif text-lg font-bold text-festivo-plum-950 mt-0.5 block">₹ 4,86,000</span>
                      <span className="text-[10px] text-festivo-coral-600 font-semibold">27% of total</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-festivo-ivory border border-festivo-plum-100">
                      <span className="text-[10px] uppercase font-bold text-festivo-plum-500 block">Florals & Mandap</span>
                      <span className="font-serif text-lg font-bold text-festivo-plum-950 mt-0.5 block">₹ 2,34,000</span>
                      <span className="text-[10px] text-festivo-coral-600 font-semibold">13% of total</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-festivo-ivory border border-festivo-plum-100">
                      <span className="text-[10px] uppercase font-bold text-festivo-plum-500 block">Cinematic Drone & 4K</span>
                      <span className="font-serif text-lg font-bold text-festivo-plum-950 mt-0.5 block">₹ 1,80,000</span>
                      <span className="text-[10px] text-festivo-coral-600 font-semibold">10% of total</span>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'schedule' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-festivo-ivory border border-festivo-plum-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-festivo-coral-600 font-bold">04:00 PM</span>
                        <span className="font-bold text-festivo-plum-950">High-Tea & Acoustic Sitar Welcome</span>
                      </div>
                      <span className="text-[10px] text-festivo-plum-500">Outer Courtyard</span>
                    </div>
                    <div className="p-3 rounded-xl bg-festivo-ivory border border-festivo-plum-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-festivo-coral-600 font-bold">05:30 PM</span>
                        <span className="font-bold text-festivo-plum-950">Lakeside Sunset Pheras & Varmala</span>
                      </div>
                      <span className="text-[10px] text-festivo-coral-600 font-bold">Golden Hour Staging</span>
                    </div>
                    <div className="p-3 rounded-xl bg-festivo-ivory border border-festivo-plum-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-festivo-coral-600 font-bold">07:30 PM</span>
                        <span className="font-bold text-festivo-plum-950">Royal Feast, Live Jalebi & Sangeet Performances</span>
                      </div>
                      <span className="text-[10px] text-festivo-plum-500">Grand Ballroom</span>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'menu' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-festivo-ivory border border-festivo-plum-100 space-y-1">
                      <span className="font-bold text-festivo-coral-600 uppercase text-[10px] block">Welcome Coolers</span>
                      <div className="text-festivo-plum-800">Kesar Pista Thandai, Kokum Mint Spritzer</div>
                    </div>
                    <div className="p-3 rounded-xl bg-festivo-ivory border border-festivo-plum-100 space-y-1">
                      <span className="font-bold text-festivo-coral-600 uppercase text-[10px] block">Gourmet Starters</span>
                      <div className="text-festivo-plum-800">Paneer Tikka Angara, Dahi Ke Kebab, Plum Lotus Stem</div>
                    </div>
                    <div className="p-3 rounded-xl bg-festivo-ivory border border-festivo-plum-100 space-y-1">
                      <span className="font-bold text-festivo-coral-600 uppercase text-[10px] block">Royal Desserts</span>
                      <div className="text-festivo-plum-800">Hot Jalebi with Rabdi, Moong Dal Halwa, Gelato</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUE CAPABILITIES GRID */}
      <section className="py-20 bg-white border-y border-festivo-plum-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-festivo-coral-500">
              End-To-End Celebration Platform
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-festivo-plum-950 mt-2">
              Everything Needed to Execute Flawless Events
            </h2>
            <p className="text-festivo-plum-600 text-sm sm:text-base mt-2 leading-relaxed">
              Festivo AI unifies creative generative design with practical budgeting, task milestones, and partner management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="festivo-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-festivo-coral-50 text-festivo-coral-600 flex items-center justify-center mb-5">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mb-2">
                  13-Point AI Blueprint
                </h3>
                <p className="text-xs text-festivo-plum-700 leading-relaxed">
                  Synthesizes custom theme palettes, floral decor specs, curated catering menus, day-of run-of-show schedules, and contingency checklists.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-festivo-plum-100 text-xs font-bold text-festivo-coral-600 flex items-center space-x-1">
                <span>Tailored for your budget</span>
              </div>
            </div>

            <div className="festivo-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-festivo-plum-50 text-festivo-plum-800 flex items-center justify-center mb-5">
                  <PieChart className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mb-2">
                  Smart Budget Tracker
                </h3>
                <p className="text-xs text-festivo-plum-700 leading-relaxed">
                  Real-time Recharts visualizations comparing estimated vs actual expenses, variance calculations, and AI-driven cost-reduction tips.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-festivo-plum-100 text-xs font-bold text-festivo-plum-800 flex items-center space-x-1">
                <span>Prevents budget overruns</span>
              </div>
            </div>

            <div className="festivo-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mb-2">
                  Timeline & Milestones
                </h3>
                <p className="text-xs text-festivo-plum-700 leading-relaxed">
                  Auto-calculated countdowns, priority sorting, overdue alerts, and minute-by-minute day-of schedules so nothing falls through the cracks.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-festivo-plum-100 text-xs font-bold text-amber-800 flex items-center space-x-1">
                <span>Chronological roadmap</span>
              </div>
            </div>

            <div className="festivo-card p-6 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mb-2">
                  Vendor Pipeline
                </h3>
                <p className="text-xs text-festivo-plum-700 leading-relaxed">
                  Track vendor statuses from initial research and negotiation to confirmed contracts, payment milestones, and key contact details.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-festivo-plum-100 text-xs font-bold text-emerald-800 flex items-center space-x-1">
                <span>Contract & payment control</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CELEBRATION TYPES */}
      <section className="py-20 bg-festivo-cream/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-festivo-coral-500">
              Versatile Celebrations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-festivo-plum-950 mt-1">
              Engineered for Every Milestone
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-festivo-plum-100 shadow-soft">
              <span className="text-3xl mb-3 block">💍</span>
              <h4 className="font-serif text-base font-bold text-festivo-plum-950">Weddings & Sangeets</h4>
              <p className="text-xs text-festivo-plum-600 mt-2 leading-relaxed">
                Multi-day logistics, guest arrival welcome kits, sunset mandap staging, and cultural ritual schedules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-festivo-plum-100 shadow-soft">
              <span className="text-3xl mb-3 block">🎂</span>
              <h4 className="font-serif text-base font-bold text-festivo-plum-950">Milestone Birthdays</h4>
              <p className="text-xs text-festivo-plum-600 mt-2 leading-relaxed">
                Whimsical 10th birthdays, sweet 16s, and golden 50th jubilees with themed desserts and interactive entertainment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-festivo-plum-100 shadow-soft">
              <span className="text-3xl mb-3 block">✨</span>
              <h4 className="font-serif text-base font-bold text-festivo-plum-950">Community Galas</h4>
              <p className="text-xs text-festivo-plum-600 mt-2 leading-relaxed">
                Diwali celebrations, residential society feasts, and large-scale cultural gatherings for 400+ attendees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-festivo-plum-100 shadow-soft">
              <span className="text-3xl mb-3 block">🎓</span>
              <h4 className="font-serif text-base font-bold text-festivo-plum-950">College & Campus Fests</h4>
              <p className="text-xs text-festivo-plum-600 mt-2 leading-relaxed">
                Sponsorship budgets, inter-college competition schedules, artist stage setups, and sound coordination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-festivo-coral-500">
              Simple 3-Step Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-festivo-plum-950 mt-1">
              How Festivo AI Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="text-center p-6 bg-festivo-ivory/50 rounded-2xl border border-festivo-plum-100">
              <div className="w-12 h-12 rounded-2xl bg-festivo-coral-50 text-festivo-coral-600 font-serif font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-festivo-coral-200">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mb-2">Input Celebration Vision</h3>
              <p className="text-xs text-festivo-plum-600 leading-relaxed">
                Share your event type, date, location, guest count, budget in INR, and personal dietary or cultural preferences.
              </p>
            </div>

            <div className="text-center p-6 bg-festivo-ivory/50 rounded-2xl border border-festivo-plum-100">
              <div className="w-12 h-12 rounded-2xl bg-festivo-plum-50 text-festivo-plum-800 font-serif font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-festivo-plum-200">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mb-2">GenAI Synthesizes Master Plan</h3>
              <p className="text-xs text-festivo-plum-600 leading-relaxed">
                Our Gemini-powered engine creates an exhaustive 13-point structured celebration dossier tailored to your exact budget.
              </p>
            </div>

            <div className="text-center p-6 bg-festivo-ivory/50 rounded-2xl border border-festivo-plum-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-serif font-bold text-lg flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-festivo-plum-950 mb-2">Manage, Track & Celebrate</h3>
              <p className="text-xs text-festivo-plum-600 leading-relaxed">
                Track live expenses, check off milestones, manage vendors, consult the conversational AI assistant, and export printable briefs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-festivo-plum-950 via-festivo-plum-900 to-festivo-plum-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Sparkles className="w-8 h-8 text-festivo-coral-400 mx-auto mb-4" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to Plan an Unforgettable Celebration?
          </h2>
          <p className="mt-3 text-sm text-festivo-sand/80 max-w-xl mx-auto">
            Experience the harmony of generative AI and precision event management. Free, instant, and completely configurable.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/events/new"
              className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white px-8 py-3.5 rounded-xl font-semibold text-sm shadow-card hover:shadow-floating transition-all flex items-center space-x-2"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/dashboard"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
