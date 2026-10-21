import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import Button from '../ui/Button';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1730] text-white pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2677FF]/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#F044A5]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-[#8157F5]/20 rounded-full blur-[110px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Campus Drop Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-[#2677FF] animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Official Campus Launch 2026
              </span>
              <span className="text-xs font-bold text-[#FF7849] flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5" /> Live
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-6xl xl:text-7xl tracking-tight leading-[1.08]">
              Feel the Campus.{' '}
              <span className="block text-gradient-dypulse mt-1">
                Live the Game.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              The premier athletic & collegiate streetwear destination. Built for tournament athletes, gym grind, lecture halls, and late-night campus hangouts.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/shop/play" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="primary"
                  icon={Zap}
                  className="w-full sm:w-auto !bg-[#2677FF] hover:!bg-[#1b64e0] shadow-xl shadow-blue-500/25 group"
                >
                  <span>Shop DYPULSE PLAY</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link to="/shop/campus" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  icon={Sparkles}
                  className="w-full sm:w-auto !border-white/20 !text-white hover:!bg-white/10 backdrop-blur-xs group"
                >
                  <span>Shop DYPULSE CAMPUS</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Quick Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Direct Hostel Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2677FF]" />
                <span>Inter-College Grade Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F044A5]" />
                <span>Cash on Delivery Available</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Visual Image Card */}
              <div className="relative z-10 rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-slate-900 aspect-[4/5] group">
                <img
                  src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80"
                  alt="DYPULSE Campus Athlete"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1730] via-black/30 to-transparent" />

                {/* Floating Tag Card 1: Sports */}
                <div className="absolute top-6 left-6 glass-dark rounded-2xl p-3 border border-white/20 shadow-xl flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-[#2677FF] flex items-center justify-center text-white">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">PLAY Department</p>
                    <p className="text-xs font-bold text-white">Pro Match Kits & Gear</p>
                  </div>
                </div>

                {/* Floating Tag Card 2: Campus */}
                <div className="absolute bottom-6 right-6 glass-dark rounded-2xl p-3 border border-white/20 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7849] to-[#F044A5] flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">CAMPUS Line</p>
                    <p className="text-xs font-bold text-white">Heavyweight Streetwear</p>
                  </div>
                </div>
              </div>

              {/* Decorative Background Accent */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#2677FF]/30 to-[#F044A5]/30 rounded-3xl blur-2xl -z-10 opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
