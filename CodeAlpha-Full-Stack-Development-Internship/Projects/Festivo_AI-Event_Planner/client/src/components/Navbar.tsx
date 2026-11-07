import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Calendar,
  Database,
  CheckCircle,
  ChevronDown,
  Menu,
  X,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../lib/api';
import { IEvent, IHealthStatus } from '../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [health, setHealth] = useState<IHealthStatus | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => {});
    api.getEvents().then(setEvents).catch(() => {});
  }, [location.pathname]);

  const eventMatch = location.pathname.match(/\/events\/([^\/]+)/);
  const currentEventId = eventMatch ? eventMatch[1] : null;
  const currentEvent = events.find((e) => e.id === currentEventId);

  return (
    <>
      <header className="sticky top-0 z-40 bg-festivo-ivory/90 backdrop-blur-md border-b border-festivo-plum-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-festivo-coral-500 rounded-xl"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-festivo-coral-500 via-festivo-coral-600 to-festivo-plum-700 flex items-center justify-center text-white shadow-soft group-hover:scale-105 group-hover:shadow-glow transition-all duration-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-festivo-plum-950 flex items-center leading-none">
                  Festivo
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-festivo-coral-50 text-festivo-coral-600 font-sans font-extrabold text-[10px] uppercase tracking-wider border border-festivo-coral-200/60">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-festivo-plum-500 font-medium tracking-wide hidden sm:block mt-0.5">
                  Every Celebration, Beautifully Planned
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1.5" aria-label="Main Navigation">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === '/'
                  ? 'bg-festivo-cream text-festivo-plum-950 font-bold shadow-xs'
                  : 'text-festivo-plum-700 hover:text-festivo-plum-950 hover:bg-festivo-cream/60'
              }`}
            >
              Overview
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === '/dashboard'
                  ? 'bg-festivo-plum-900 text-white shadow-xs'
                  : 'text-festivo-plum-700 hover:text-festivo-plum-950 hover:bg-festivo-cream/60'
              }`}
            >
              Portfolio Dashboard
            </Link>

            {/* Quick Event Switcher */}
            {events.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSwitcherOpen(!switcherOpen)}
                  onBlur={() => setTimeout(() => setSwitcherOpen(false), 200)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    currentEvent
                      ? 'border-festivo-coral-200 bg-festivo-coral-50/50 text-festivo-coral-800'
                      : 'border-festivo-plum-200/60 bg-white text-festivo-plum-800 hover:bg-festivo-cream/60'
                  }`}
                  aria-expanded={switcherOpen}
                  title="Switch Active Event"
                >
                  <Calendar className="w-3.5 h-3.5 text-festivo-coral-500 shrink-0" />
                  <span className="max-w-[140px] truncate">
                    {currentEvent ? currentEvent.name : 'Switch Celebration'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-festivo-plum-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
                </button>

                {switcherOpen && (
                  <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-floating border border-festivo-plum-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-festivo-plum-400 uppercase tracking-wider">
                      Celebration Studio Switcher
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1 mt-1">
                      {events.map((evt) => (
                        <button
                          key={evt.id}
                          type="button"
                          onMouseDown={() => {
                            setSwitcherOpen(false);
                            navigate(`/events/${evt.id}`);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                            currentEventId === evt.id
                              ? 'bg-festivo-coral-50 text-festivo-coral-800 font-bold ring-1 ring-festivo-coral-200'
                              : 'text-festivo-plum-900 hover:bg-festivo-cream'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="truncate">{evt.name}</div>
                            <div className="text-[10px] text-festivo-plum-500 font-normal">{evt.location}</div>
                          </div>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-festivo-plum-50 text-festivo-plum-700 shrink-0">
                            {evt.type.replace('_', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-festivo-plum-100 my-1 pt-1">
                      <Link
                        to="/events/new"
                        onMouseDown={() => setSwitcherOpen(false)}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-festivo-coral-600 hover:bg-festivo-coral-50 flex items-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Plan New Celebration</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Actions: System Status & CTA */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Storage Status Pill */}
            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-festivo-plum-200/70 text-festivo-plum-800 hover:bg-festivo-cream transition-colors shadow-xs"
              title="Click to view environment & persistence details"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${health?.database.isMongo ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <Database className="w-3 h-3 text-festivo-plum-400" />
              <span className="font-semibold text-[11px]">{health?.database.isMongo ? 'MongoDB' : 'Demo Mode'}</span>
            </button>

            {/* AI Model Pill */}
            <button
              type="button"
              onClick={() => setShowStatusModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-festivo-coral-50 text-festivo-coral-700 border border-festivo-coral-200/60 hover:bg-festivo-coral-100 transition-colors shadow-xs"
            >
              <Cpu className="w-3 h-3 text-festivo-coral-500" />
              <span>{health?.aiProvider.isConfigured ? 'Gemini 2.5' : 'Gemini 2.5 (Demo)'}</span>
            </button>

            {/* Primary Action Button */}
            <Link
              to="/events/new"
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-festivo-coral-500 to-festivo-coral-600 hover:from-festivo-coral-600 hover:to-festivo-coral-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-soft hover:shadow-glow hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plan My Event</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center space-x-1.5">
            <Link
              to="/events/new"
              className="bg-festivo-coral-500 text-white p-2 rounded-xl text-xs shadow-soft"
              aria-label="Create Event"
            >
              <Plus className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-festivo-plum-800 hover:bg-festivo-cream transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-festivo-plum-100 bg-festivo-ivory/98 backdrop-blur-md px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-festivo-plum-900 hover:bg-festivo-cream"
            >
              Home & Landing
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-festivo-plum-900 hover:bg-festivo-cream"
            >
              Portfolio Dashboard
            </Link>
            <Link
              to="/events/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-festivo-coral-600 bg-festivo-coral-50/60"
            >
              + Create New Celebration
            </Link>

            <div className="pt-2 border-t border-festivo-plum-100 flex items-center justify-between text-[11px] text-festivo-plum-600">
              <span className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${health?.database.isMongo ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{health?.database.label}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowStatusModal(true);
                }}
                className="text-festivo-coral-500 font-bold underline"
              >
                Inspect Status
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Persistence & System Status Info Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-festivo-plum-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-floating border border-festivo-plum-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-festivo-plum-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-festivo-coral-50 text-festivo-coral-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-festivo-plum-950 leading-tight">
                    System & Storage Status
                  </h3>
                  <span className="text-[10px] text-festivo-plum-500">Festivo AI Diagnostic Inspector</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1.5 rounded-xl text-festivo-plum-400 hover:text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="bg-festivo-cream/60 p-3.5 rounded-2xl border border-festivo-plum-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-festivo-plum-700">Storage Backend:</span>
                  <span className="font-bold text-festivo-plum-950">{health?.database.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-festivo-plum-700">Persistence Mode:</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    health?.database.isMongo ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {health?.database.isMongo ? 'Production Database' : 'Demo Mode (Local Persistent Store)'}
                  </span>
                </div>
                <p className="text-[11px] text-festivo-plum-600 leading-relaxed pt-1.5 border-t border-festivo-sand/60">
                  {health?.database.isMongo
                    ? 'Connected to multi-user MongoDB Atlas cloud database. All changes persist across multi-user sessions.'
                    : 'Running in zero-friction Demo Mode with local JSON file persistence. All edits, new events, tasks, and expenses are saved locally on the server without requiring MongoDB credentials.'}
                </p>
              </div>

              <div className="bg-festivo-coral-50/50 p-3.5 rounded-2xl border border-festivo-coral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-festivo-plum-700">Generative AI Provider:</span>
                  <span className="font-bold text-festivo-plum-950">Google Gemini</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-festivo-plum-700">Configured Model:</span>
                  <span className="font-mono text-festivo-coral-600 font-semibold">{health?.aiProvider.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-festivo-plum-700">Engine State:</span>
                  <span className="flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{health?.aiProvider.isConfigured ? 'Live API Key Active' : 'Intelligent Fallback Simulator Active'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="bg-festivo-plum-900 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-festivo-plum-950 transition-colors shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
