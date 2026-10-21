import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  X,
  User,
  ShoppingBag,
  Heart,
  Shield,
  LogOut,
  Zap,
  Sparkles,
  Flame,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../context/WishlistContext';

export default function MobileMenu({ isOpen, onClose }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1730]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative flex flex-col w-full max-w-xs bg-[#0B1730] text-white h-full shadow-2xl z-10 p-6 border-r border-white/10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2 group"
            aria-label="DYPULSE Home"
          >
            <div className="bg-white rounded-xl p-1.5 shadow-sm border border-white/20">
              <img
                src="/dypulse-logo.png"
                alt="DYPULSE"
                className="h-8 w-auto object-contain"
              />
            </div>
            <span className="sr-only">DY PULSE</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="py-6 flex flex-col gap-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Campus Departments
          </div>

          <NavLink
            to="/"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-white/15 text-white font-semibold' : 'text-slate-200 hover:bg-white/5'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop/play"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-[#2677FF] text-white' : 'text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#2677FF]" />
              <span>DYPULSE PLAY</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-[#2677FF] px-2 py-0.5 rounded-full">
              Sports
            </span>
          </NavLink>

          <NavLink
            to="/shop/campus"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-[#F044A5] text-white' : 'text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#F044A5]" />
              <span>DYPULSE CAMPUS</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-[#F044A5] px-2 py-0.5 rounded-full">
              Streetwear
            </span>
          </NavLink>

          <NavLink
            to="/shop"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-white/15 text-white font-semibold' : 'text-slate-200 hover:bg-white/5'
              }`
            }
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-purple-400" />
              <span>Shop All Gear</span>
            </div>
          </NavLink>

          <NavLink
            to="/shop?filter=new"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-[#FF7849]" />
              <span>New Arrivals</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-[#FF7849] px-2 py-0.5 rounded-full">
              Hot
            </span>
          </NavLink>

          <NavLink
            to="/team-kit-studio"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Team Kit Studio</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
              Custom
            </span>
          </NavLink>

          <NavLink
            to="/budget-finder"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Budget Finder</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
              Steals
            </span>
          </NavLink>

          <div className="pt-2 border-t border-white/10 mt-1">
            <NavLink
              to="/wishlist"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#F044A5]" />
                <span>Wishlist</span>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-[#F044A5] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/cart"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[#2677FF]" />
                <span>Shopping Bag</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-[#2677FF] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>

        {/* User Account Section */}
        <div className="mt-auto pt-4 border-t border-white/10">
          {isAuthenticated ? (
            <div className="space-y-1.5">
              <div className="px-3 py-2 flex items-center gap-3 bg-white/5 rounded-xl mb-2">
                <div className="w-8 h-8 rounded-full bg-[#2677FF] flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0] || user?.firstName?.[0] || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'College Athlete'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/orders"
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-slate-400" />
                <span>My Orders</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#8157F5] hover:bg-purple-500/10 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4 text-[#8157F5]" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-white/10 hover:bg-white/15 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-center text-xs font-semibold text-white bg-[#2677FF] hover:bg-[#1b64e0] rounded-xl shadow-md transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <Link to="/faqs" onClick={onClose} className="hover:text-slate-300">
              FAQs & Help
            </Link>
            <Link to="/contact" onClick={onClose} className="hover:text-slate-300">
              Campus Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
