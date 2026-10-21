import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, ShoppingBag, Flame } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2677FF] text-xs font-bold uppercase tracking-wider mb-6 border border-blue-200">
          <Flame className="w-3.5 h-3.5 text-[#FF7849]" />
          <span>Error 404</span>
        </div>

        <h1 className="text-7xl font-heading font-black text-[#0B1730] tracking-tighter">
          4<span className="text-[#2677FF]">0</span>4
        </h1>

        <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#172033] mt-3">
          Arena Out of Bounds
        </h2>

        <p className="text-xs sm:text-sm text-[#667085] mt-2 mb-8 leading-relaxed">
          The campus page or gear you are looking for has expired, relocated, or never made it onto the field.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-heading font-semibold text-xs text-white bg-[#0B1730] hover:bg-[#162446] transition-colors shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-heading font-semibold text-xs text-[#172033] bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-[#2677FF]" />
            <span>Explore Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
