import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  Award,
  Ticket,
  Settings,
  ArrowLeft,
  Menu,
  X,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Layers,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Products Catalog', path: '/admin/products', icon: Package },
  { name: 'Add Product', path: '/admin/products/new', icon: PlusCircle },
  { name: 'Categories', path: '/admin/categories', icon: Layers },
  { name: 'Orders & Shipments', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Inventory Audit', path: '/admin/inventory', icon: Boxes },
  { name: 'Customer Accounts', path: '/admin/customers', icon: Users },
  { name: 'Team Kit Requests', path: '/admin/team-kits', icon: Award },
  { name: 'Campus Coupons', path: '/admin/coupons', icon: Ticket },
  { name: 'Student Reviews', path: '/admin/reviews', icon: MessageSquare },
  { name: 'Store Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-[#0B1730] text-white h-16 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="bg-white rounded-xl px-2 py-0.5 shadow-sm border border-white/20">
              <img
                src="/dypulse-logo.png"
                alt="DYPULSE"
                className="h-7 w-auto object-contain"
              />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2677FF] text-white">
              Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit to Campus Store</span>
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2677FF] to-[#F044A5] flex items-center justify-center font-bold text-xs text-white">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-bold text-white leading-tight">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400">Superuser</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 p-4 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Management Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0B1730] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2677FF]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="mt-auto pt-6 border-t border-slate-100 px-3">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs">
              <p className="font-bold text-[#2677FF] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Session Secure
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Admin actions require authenticated cookie credentials.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-64 bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto z-10">
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <span className="font-heading font-black text-sm text-[#172033]">
                    DYPULSE ADMIN
                  </span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/admin'
                      ? location.pathname === '/admin'
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-[#0B1730] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Store</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
