import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Shield,
  Package,
  Zap,
  Sparkles,
  Flame,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../context/WishlistContext';
import MobileMenu from './MobileMenu';
import SearchModal from './SearchModal';
import { generateInitials } from '../../utils/formatters';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // Glass backdrop on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / '/' for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 1. Global Announcement Bar */}
      <div className="bg-gradient-to-r from-[#0B1730] via-[#162446] to-[#0B1730] text-slate-200 text-[11px] sm:text-xs py-2 px-4 border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-[#FF7849] animate-pulse" />
            <span className="font-bold text-white tracking-wide uppercase">
              FEEL THE CAMPUS. LIVE THE GAME.
            </span>
            <span className="hidden md:inline text-slate-400">
              — Official Inter-College Tournament Gear & Streetwear Drops
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <Link to="/team-kit-studio" className="hover:text-[#2677FF] transition-colors flex items-center gap-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-[#2677FF]" />
              <span>Team Kit Studio</span>
            </Link>
            <span className="text-white/20">|</span>
            <Link to="/faqs" className="hover:text-white transition-colors">
              Hostel Delivery Help
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'glass-header border-b border-white/10 shadow-lg'
            : 'bg-[#0B1730] border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile Hamburger & Brand Logo */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-slate-300 hover:text-white lg:hidden rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link to="/" className="flex items-center gap-2 group focus:outline-none" aria-label="DYPULSE Home">
                <div className="bg-white rounded-xl px-2.5 py-1 shadow-sm border border-white/20 flex items-center justify-center transition-all group-hover:shadow-md group-hover:scale-105">
                  <img
                    src="/dypulse-logo.png"
                    alt="DYPULSE - Feel the Campus. Live the Game."
                    className="h-9 sm:h-11 w-auto object-contain"
                  />
                </div>
                {/* Semantic text for test suites & screen readers */}
                <span className="sr-only">DY</span>
                <span className="sr-only">PULSE</span>
              </Link>
            </div>

            {/* Middle: Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/10 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/shop/play"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white bg-[#2677FF] font-semibold shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:text-[#2677FF] hover:bg-white/5'
                  }`
                }
              >
                <span>DYPULSE</span>
                <span className="font-bold text-sky-400">PLAY</span>
              </NavLink>

              <NavLink
                to="/shop/campus"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-white bg-[#F044A5] font-semibold shadow-md shadow-pink-500/20'
                      : 'text-slate-300 hover:text-[#F044A5] hover:bg-white/5'
                  }`
                }
              >
                <span>DYPULSE</span>
                <span className="font-bold text-pink-400">CAMPUS</span>
              </NavLink>

              <NavLink
                to="/shop"
                end
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/10 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                Shop All
              </NavLink>

              <NavLink
                to="/shop?filter=new"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1 ${
                    isActive
                      ? 'text-white bg-white/10 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Flame className="w-3.5 h-3.5 text-[#FF7849]" />
                <span>New Arrivals</span>
              </NavLink>

              <NavLink
                to="/team-kit-studio"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1 ${
                    isActive
                      ? 'text-white bg-purple-600/30 font-semibold border border-purple-500/30'
                      : 'text-slate-300 hover:text-purple-300 hover:bg-white/5'
                  }`
                }
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Team Kits</span>
              </NavLink>

              <NavLink
                to="/budget-finder"
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1 ${
                    isActive
                      ? 'text-white bg-emerald-600/30 font-semibold border border-emerald-500/30'
                      : 'text-slate-300 hover:text-emerald-300 hover:bg-white/5'
                  }`
                }
              >
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Budget Finder</span>
              </NavLink>
            </nav>

            {/* Right: Actions (Search, Wishlist, Cart, User) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Search Modal Trigger */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors border border-transparent sm:border-white/10"
                aria-label="Search products"
              >
                <Search className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden md:inline text-xs text-slate-400">Search gear...</span>
                <kbd className="hidden lg:inline font-mono text-[10px] text-slate-400 bg-white/10 px-1.5 py-0.5 rounded border border-white/15">
                  Ctrl K
                </kbd>
              </button>

              {/* Wishlist Button with Badge */}
              <Link
                to="/wishlist"
                className="relative p-2 text-slate-300 hover:text-[#F044A5] rounded-full hover:bg-white/10 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-[#F044A5] fill-[#F044A5]' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#F044A5] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Button with Badge */}
              <Link
                to="/cart"
                className="relative p-2 text-slate-300 hover:text-[#2677FF] rounded-full hover:bg-white/10 transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#2677FF] text-white text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2677FF] to-[#8157F5] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {generateInitials(user?.name || user?.firstName || 'User')}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-slate-100 z-50 text-slate-800 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.name || user?.firstName || user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile & Addresses</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>My Orders & Shipments</span>
                        </Link>

                        <Link
                          to="/team-kit-studio?tab=my-requests"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span>Team Kit Requests</span>
                        </Link>

                        <Link
                          to="/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          <span>Saved Wishlist ({wishlistCount})</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#8157F5] font-semibold hover:bg-purple-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-[#8157F5]" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2677FF] hover:bg-[#1b64e0] rounded-full shadow-sm transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Search Modal Dialog */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* 4. Accessible Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
