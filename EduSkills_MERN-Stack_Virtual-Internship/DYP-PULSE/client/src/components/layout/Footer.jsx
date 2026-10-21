import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Twitter,
  Youtube,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid student email address');
      return;
    }
    toast.success('You’re on the VIP campus drop list! ⚡');
    setEmail('');
  };

  return (
    <footer className="bg-[#0B1730] text-slate-400 text-sm border-t border-white/10 mt-auto">
      {/* Top Banner: Campus Trust Highlights */}
      <div className="border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#2677FF] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-heading font-semibold text-sm">Direct Campus Delivery</h4>
                <p className="text-xs text-slate-400">Convenient delivery to college hostels & hubs</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#8157F5] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-heading font-semibold text-sm">7-Day Easy Exchange</h4>
                <p className="text-xs text-slate-400">Hassle-free size replacements on campus</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-[#F044A5] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-heading font-semibold text-sm">Secure Student Checkout</h4>
                <p className="text-xs text-slate-400">Cash on Delivery & instant verified UPI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group focus:outline-none" aria-label="DYPULSE Home">
              <div className="bg-white rounded-2xl px-3.5 py-1.5 shadow-md border border-white/20 inline-flex items-center transition-all group-hover:shadow-lg group-hover:scale-105">
                <img
                  src="/dypulse-logo.png"
                  alt="DYPULSE - Feel the Campus. Live the Game."
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </div>
              <span className="sr-only">DY PULSE</span>
            </Link>

            <p className="text-white text-sm font-heading font-extrabold tracking-wide uppercase">
              FEEL THE CAMPUS. <span className="text-gradient-dypulse">LIVE THE GAME.</span>
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The premier college apparel & sports lifestyle brand. Engineered for collegiate athletes, tournament fighters, and campus trendsetters.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Join the Campus Pulse
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your student email"
                  required
                  className="bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2677FF] flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#2677FF] hover:bg-[#1b64e0] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Join</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Shop Departments
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/shop/play" className="hover:text-[#2677FF] transition-colors">
                  DYPULSE PLAY (Sports)
                </Link>
              </li>
              <li>
                <Link to="/shop/campus" className="hover:text-[#F044A5] transition-colors">
                  DYPULSE CAMPUS (Streetwear)
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/team-kit" className="hover:text-purple-400 transition-colors">
                  Custom Team Kit Studio
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Catalog Gear
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Customer Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track My Shipment
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-white transition-colors">
                  FAQs & Sizing Guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Campus Support & Contact
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  My Profile & Addresses
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  My Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Policies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              DYPULSE Brand
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About DYPULSE
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </Link>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Payments & Legal */}
      <div className="border-t border-white/5 py-6 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DYPULSE. All rights reserved. Crafted for university athletes & student culture.</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 text-slate-300 text-[11px] font-medium border border-white/5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              COD Available
            </span>
            <span className="px-2.5 py-1 rounded bg-white/5 text-slate-300 text-[11px] font-medium border border-white/5">
              UPI Accepted
            </span>
            <span className="px-2.5 py-1 rounded bg-white/5 text-slate-300 text-[11px] font-medium border border-white/5">
              NetBanking / Cards
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
