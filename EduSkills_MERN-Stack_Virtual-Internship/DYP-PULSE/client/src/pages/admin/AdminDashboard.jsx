import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  Layers,
  Tag,
  RefreshCw,
  AlertCircle,
  XCircle,
  MessageSquare,
  Users,
  Info,
  Calendar,
  CreditCard,
  HelpCircle
} from 'lucide-react';
import { get } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDefinitions, setShowDefinitions] = useState(false);

  const fetchDashboardData = async (selectedPeriod = period) => {
    try {
      const analyticsRes = await get(`/orders/admin/analytics?period=${selectedPeriod}`);
      const data = analyticsRes?.data || analyticsRes;
      setAnalytics(data);

      if (data?.recentOrders && data.recentOrders.length > 0) {
        setRecentOrders(data.recentOrders);
      } else {
        const ordRes = await get('/orders/all?limit=8');
        const orders = ordRes?.data?.orders || ordRes?.orders || [];
        setRecentOrders(orders);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(period);
  };

  if (loading) {
    return <Spinner fullPage label="Compiling real-time campus sales, inventory & customer metrics..." />;
  }

  const revenue = analytics?.revenue || {
    qualifyingRevenue: 0,
    unpaidCodRevenue: 0,
    pipelineRevenue: 0,
    averageOrderValue: 0
  };

  const ordersData = analytics?.orders || {
    total: 0,
    qualifyingCount: 0,
    awaitingProcessing: 0,
    byStatus: { placed: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
  };

  const customersData = analytics?.customers || { total: 0 };

  const productsData = analytics?.products || {
    total: 0,
    active: 0,
    byDepartment: { PLAY: 0, CAMPUS: 0 },
    lowStockVariantCount: 0,
    lowStockDetails: []
  };

  const topSelling = analytics?.topSellingProducts || [];
  const teamKits = analytics?.teamKits || { total: 0, byStatus: {} };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
              Campus Operations & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live DB
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time catalog analytics, strict revenue recognition, SKU stock tracking, and student orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === p.id
                    ? 'bg-white text-[#0B1730] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#2677FF]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 bg-blue-50 text-[#2677FF] hover:bg-blue-100 text-xs font-bold transition-all shadow-xs"
            title="Accounting Rules & Definitions"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Metric Definitions</span>
          </button>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Business Metric Definitions Collapsible Banner */}
      {showDefinitions && (
        <div className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 text-xs space-y-2 relative animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-black text-sm text-[#0B1730] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#2677FF]" />
              DYPULSE Accounting & Metric Business Meaning
            </h3>
            <button
              onClick={() => setShowDefinitions(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 mt-2">
            <li className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="font-bold text-[#2677FF] block">Qualifying Sales Revenue:</span>
              Strictly collected revenue from verified paid orders (Razorpay and delivered COD). Unpaid COD orders and cancelled orders are strictly excluded from collected sales.
            </li>
            <li className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="font-bold text-[#8157F5] block">Average Order Value (AOV):</span>
              Collected sales revenue divided by qualifying paid order count. Gives the authoritative revenue yield per completed student checkout.
            </li>
            <li className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="font-bold text-amber-600 block">Orders Awaiting Fulfillment:</span>
              Count of active orders in placed, confirmed, or processing states requiring squad packaging and hostel courier dispatch.
            </li>
            <li className="bg-white/80 p-3 rounded-xl border border-blue-100">
              <span className="font-bold text-rose-600 block">Low-Stock Threshold:</span>
              Any product variant or base item with 5 or fewer units in inventory, highlighted for timely replenishment.
            </li>
          </ul>
        </div>
      )}

      {/* Primary KPI Grid (6 Top Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Qualifying Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualifying Revenue</p>
              <Info className="w-3.5 h-3.5 text-slate-400" title="Excludes unpaid COD & cancelled orders" />
            </div>
            <p className="text-2xl font-heading font-black text-[#172033] mt-1">
              {formatPrice(revenue.qualifyingRevenue)}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              {ordersData.qualifyingCount} verified paid orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2677FF] flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Order Value</p>
            <p className="text-2xl font-heading font-black text-[#172033] mt-1">
              {formatPrice(revenue.averageOrderValue)}
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
              Per paid checkout
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customers</p>
            <p className="text-2xl font-heading font-black text-[#172033] mt-1">
              {customersData.total}
            </p>
            <Link to="/admin/customers" className="text-[11px] text-[#2677FF] hover:underline font-semibold mt-1 inline-block">
              View customer accounts →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Campus Orders</p>
            <p className="text-2xl font-heading font-black text-[#172033] mt-1">
              {ordersData.total}
            </p>
            <Link to="/admin/orders" className="text-[11px] text-[#8157F5] hover:underline font-semibold mt-1 inline-block">
              Review order list →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#8157F5] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Orders Awaiting Processing */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting Processing</p>
            <p className={`text-2xl font-heading font-black mt-1 ${ordersData.awaitingProcessing > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
              {ordersData.awaitingProcessing}
            </p>
            <Link to="/admin/orders" className="text-[11px] text-amber-700 hover:underline font-semibold mt-1 inline-block">
              Fulfill pending squad orders →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Variants</p>
            <p className={`text-2xl font-heading font-black mt-1 ${productsData.lowStockVariantCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {productsData.lowStockVariantCount}
            </p>
            <Link to="/admin/inventory" className="text-[11px] text-rose-700 hover:underline font-semibold mt-1 inline-block">
              Audit SKU inventory →
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Unpaid COD Pipeline Notice */}
      {revenue.unpaidCodRevenue > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-900">
                Pending Cash on Delivery Pipeline: {formatPrice(revenue.unpaidCodRevenue)}
              </p>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Per accounting rules, unpaid COD orders are not counted as collected revenue until delivered to students.
              </p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs self-start sm:self-auto"
          >
            Manage Deliveries
          </Link>
        </div>
      )}

      {/* Order Status Breakdown Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-heading font-bold text-base text-[#172033]">
              Order Pipeline by Fulfillment Status
            </h2>
            <p className="text-xs text-[#667085]">Distribution across current college hostel orders</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-[#2677FF] hover:underline">
            Manage Order Pipeline →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2677FF]">Placed</span>
            <span className="text-xl font-heading font-black text-[#172033] mt-1">{ordersData.byStatus?.placed || 0}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Awaiting confirm</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Confirmed</span>
            <span className="text-xl font-heading font-black text-[#172033] mt-1">{ordersData.byStatus?.confirmed || 0}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Approved for packing</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Processing</span>
            <span className="text-xl font-heading font-black text-[#172033] mt-1">{ordersData.byStatus?.processing || 0}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">In squad warehouse</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8157F5]">Shipped</span>
            <span className="text-xl font-heading font-black text-[#172033] mt-1">{ordersData.byStatus?.shipped || 0}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">With hostel runner</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Delivered</span>
            <span className="text-xl font-heading font-black text-[#172033] mt-1">{ordersData.byStatus?.delivered || 0}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Completed drop</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Cancelled</span>
            <span className="text-xl font-heading font-black text-[#172033] mt-1">{ordersData.byStatus?.cancelled || 0}</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Stock replenished</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top-Selling Products & Team Kit Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top-Selling Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#172033]">
                  Top-Selling Campus Gear
                </h3>
                <p className="text-xs text-[#667085]">Based on real completed and active order line items</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-[#2677FF]">
                Top 5
              </span>
            </div>

            {topSelling.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No order item sales recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Sales rankings update automatically as student checkouts occur.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topSelling.map((item, idx) => (
                  <div key={item.productId || idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-heading font-black text-xs text-slate-400">
                        #{idx + 1}
                      </span>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-xl bg-slate-100 border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-heading font-bold text-xs text-[#172033] line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-400">SKU: {item.sku || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-xs text-[#172033]">{formatPrice(item.revenue)}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">{item.unitsSold} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Non-cancelled orders</span>
            <Link to="/admin/products" className="text-xs font-bold text-[#2677FF] hover:underline">
              Inspect Catalog →
            </Link>
          </div>
        </div>

        {/* Team Kit Requests Pipeline */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-[#172033]">
                  Team Kit Studio Requests ({teamKits.total})
                </h3>
                <p className="text-xs text-[#667085]">Custom jersey & squad inquiries by stage</p>
              </div>
              <Link to="/admin/team-kits" className="text-xs font-bold text-[#F044A5] hover:underline">
                View Studio →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { status: 'submitted', label: 'Submitted', color: 'bg-blue-50 text-[#2677FF] border-blue-100' },
                { status: 'reviewing', label: 'Reviewing', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { status: 'quoted', label: 'Quoted', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                { status: 'approved', label: 'Approved', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { status: 'in_production', label: 'In Production', color: 'bg-purple-50 text-[#8157F5] border-purple-100' },
                { status: 'shipped', label: 'Shipped', color: 'bg-teal-50 text-teal-600 border-teal-100' },
                { status: 'completed', label: 'Completed', color: 'bg-slate-100 text-slate-800 border-slate-200' },
                { status: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-600 border-rose-100' }
              ].map((item) => (
                <div key={item.status} className={`p-3 rounded-2xl border ${item.color} flex flex-col`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                  <span className="text-lg font-heading font-black mt-1">
                    {teamKits.byStatus?.[item.status] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Total inquiries: {teamKits.total}</span>
            <Link to="/admin/team-kits" className="text-xs font-bold text-[#F044A5] hover:underline">
              Issue Quotations →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 className="font-heading font-bold text-base text-[#172033]">
              Recent Campus Transactions
            </h2>
            <p className="text-xs text-[#667085]">Latest customer transactions and drop deliveries</p>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-[#2677FF] hover:underline">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No customer orders placed yet in the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Drop Location</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Fulfillment</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord._id || ord.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-[#172033]">
                      #{ord.orderNumber || (ord._id || ord.id).slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 text-slate-700">
                      {ord.user?.firstName
                        ? `${ord.user.firstName} ${ord.user.lastName || ''}`
                        : ord.shippingAddress?.fullName || 'Student Athlete'}
                    </td>
                    <td className="py-3 text-slate-500">
                      {ord.shippingAddress?.street || ord.shippingAddress?.hostel || 'Hostel Delivery'}
                    </td>
                    <td className="py-3 font-bold text-[#172033]">
                      {formatPrice(ord.totalInPaise ? ord.totalInPaise / 100 : (ord.total || 0))}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ord.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {ord.paymentStatus || 'Pending'} ({ord.paymentMethod || 'COD'})
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-rose-50 text-rose-700'
                          : ord.orderStatus === 'shipped'
                          ? 'bg-purple-50 text-[#8157F5]'
                          : 'bg-blue-50 text-[#2677FF]'
                      }`}>
                        {ord.orderStatus || 'Placed'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-right">
                      {formatDate(ord.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
