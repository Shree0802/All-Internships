import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Sparkles, Award, ShieldCheck, Heart, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Brand Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#2677FF] text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
          <Zap className="w-3.5 h-3.5" />
          <span>The DYPULSE Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-[#172033] leading-tight">
          FEEL THE CAMPUS. <br />
          <span className="text-gradient-dypulse">LIVE THE GAME.</span>
        </h1>
        <p className="mt-4 text-base text-[#667085] leading-relaxed">
          DYPULSE was founded with a singular conviction: university students and athletes shouldn't have to choose between durable sports gear and contemporary campus style. We unite both worlds under one authentic roof.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2677FF] flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-[#172033]">
              DYPULSE PLAY
            </h2>
            <p className="text-xs text-[#667085] mt-3 leading-relaxed">
              Engineered for university tournaments, inter-collegiate leagues, and everyday hostel turf matches. From English willow cricket bats to seamless moisture-wicking jerseys and speed footwear, every piece of athletic gear undergoes rigorous field durability checks.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link to="/shop/play" className="text-xs font-bold text-[#2677FF] inline-flex items-center gap-1.5 hover:underline">
              <span>Explore Athletic Gear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#F044A5] flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-[#172033]">
              DYPULSE CAMPUS
            </h2>
            <p className="text-xs text-[#667085] mt-3 leading-relaxed">
              Tailored for lecture halls, library sprints, and late-night cafeteria meetups. Heavyweight 380 GSM fleece hoodies, oversized graphic tees, ergonomic laptop backpacks, and tech essentials designed specifically for the modern collegiate lifestyle.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link to="/shop/campus" className="text-xs font-bold text-[#F044A5] inline-flex items-center gap-1.5 hover:underline">
              <span>Explore Campus Fits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold">
            Built by Students, for Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
            No fabricated counts, no hidden convenience charges. Transparent pricing, reliable campus deliveries, and customized team kits to help every university squad stand tall on the field.
          </p>
          <div className="mt-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2677FF] text-white text-xs font-bold hover:bg-[#1b64e0] transition-colors"
            >
              <span>Shop All Campus Drops</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
