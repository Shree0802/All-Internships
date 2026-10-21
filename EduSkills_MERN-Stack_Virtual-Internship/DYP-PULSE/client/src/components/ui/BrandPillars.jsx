import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Shirt,
  ShoppingBag,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

/**
 * 4 Brand Pillars directly derived from the official DYPULSE logo identity:
 * - SPORTS: Running athlete with mint/teal bubble
 * - FASHION: Apparel with pink/rose bubble
 * - ESSENTIALS: Backpack with yellow/amber bubble
 * - FOR STUDENTS: Laptop/Cap with purple/indigo bubble
 */
export const BRAND_PILLARS = [
  {
    id: 'sports',
    name: 'SPORTS',
    tagline: 'Varsity Kits & Arena Gear',
    description: 'Cricket, football, basketball & tournament performance gear engineered for champions.',
    link: '/shop/play',
    accentColor: '#10B981',
    bgColor: 'bg-emerald-50',
    circleBg: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200/80',
    icon: Activity,
  },
  {
    id: 'fashion',
    name: 'FASHION',
    tagline: 'Collegiate Streetwear',
    description: 'Heavyweight hoodies, oversized tees, retro sneakers, and everyday campus drip.',
    link: '/shop/campus',
    accentColor: '#F044A5',
    bgColor: 'bg-pink-50',
    circleBg: 'bg-pink-100',
    textColor: 'text-pink-700',
    iconColor: 'text-[#F044A5]',
    borderColor: 'border-pink-200/80',
    icon: Shirt,
  },
  {
    id: 'essentials',
    name: 'ESSENTIALS',
    tagline: 'Campus Carry & Daily Gear',
    description: 'Laptop backpacks, insulated bottles, hardbound stationery, and tech drops.',
    link: '/shop?category=Backpacks+%26+Bags',
    accentColor: '#FF7849',
    bgColor: 'bg-amber-50',
    circleBg: 'bg-amber-100',
    textColor: 'text-amber-800',
    iconColor: 'text-[#FF7849]',
    borderColor: 'border-amber-200/80',
    icon: ShoppingBag,
  },
  {
    id: 'for_students',
    name: 'FOR STUDENTS',
    tagline: 'Exclusive Student Value',
    description: 'Campus budget collections under ₹499, custom team kit studio, and hostel drop.',
    link: '/budget-finder',
    accentColor: '#8157F5',
    bgColor: 'bg-purple-50',
    circleBg: 'bg-purple-100',
    textColor: 'text-purple-800',
    iconColor: 'text-[#8157F5]',
    borderColor: 'border-purple-200/80',
    icon: GraduationCap,
  },
];

export default function BrandPillars({ variant = 'cards', className = '' }) {
  if (variant === 'bar') {
    return (
      <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {BRAND_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.id}
                to={pillar.link}
                className="group flex flex-col items-center text-center p-4 hover:bg-slate-50/60 rounded-2xl transition-all"
              >
                <div className="relative mb-3 flex items-center justify-center">
                  <div
                    className={`w-12 h-12 rounded-full ${pillar.circleBg} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <Icon className={`w-6 h-6 ${pillar.iconColor} stroke-[2]`} />
                  </div>
                </div>
                <h4 className="font-heading font-extrabold text-sm text-[#0B1730] tracking-wider uppercase group-hover:text-[#2677FF] transition-colors">
                  {pillar.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{pillar.tagline}</p>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {BRAND_PILLARS.map((pillar) => {
        const Icon = pillar.icon;
        return (
          <Link
            key={pillar.id}
            to={pillar.link}
            className={`group relative bg-white rounded-3xl p-6 sm:p-7 border ${pillar.borderColor} shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1`}
          >
            {/* Subtle top accent corner glow */}
            <div
              className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity"
              style={{ backgroundColor: pillar.accentColor }}
            />

            <div>
              {/* Icon with pastel highlight circle identical to logo */}
              <div className="relative inline-flex mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl ${pillar.circleBg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300 shadow-xs`}
                >
                  <Icon className={`w-7 h-7 ${pillar.iconColor} stroke-[2]`} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${pillar.bgColor} ${pillar.textColor}`}>
                  Official Pillar
                </span>
              </div>

              <h3 className="font-heading font-black text-xl text-[#0B1730] tracking-tight group-hover:text-[#2677FF] transition-colors">
                {pillar.name}
              </h3>

              <p className="font-semibold text-xs text-slate-700 mt-1">
                {pillar.tagline}
              </p>

              <p className="text-xs text-[#667085] mt-2.5 leading-relaxed">
                {pillar.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#2677FF] transition-colors">
              <span>Explore {pillar.name}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
