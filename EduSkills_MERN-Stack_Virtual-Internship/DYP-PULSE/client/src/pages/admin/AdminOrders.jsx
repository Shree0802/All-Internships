import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Filter,
  MapPin,
  Package,
  Search,
  XCircle,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, put } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusNote, setStatusNote] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('orderStatus', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const url = `/orders/all?${params.toString()}`;
      const res = await get(url);
      const orderList = res?.data?.orders || res?.orders || [];
      setOrders(orderList);
    } catch (err) {
      console.warn('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await put(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
        note: statusNote || `Status updated to ${newStatus} by admin`
      });
      toast.success(`Order #${orderId.slice(-6).toUpperCase()} updated to ${newStatus}!`);

      // Update local state
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (activeOrderModal && (activeOrderModal._id || activeOrderModal.id) === orderId) {
        setActiveOrderModal((prev) => ({ ...prev, orderStatus: newStatus }));
      }
      setStatusNote('');
    } catch (err) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    setUpdatingId(orderId);
    try {
      await put(`/orders/${orderId}/status`, { paymentStatus: newPaymentStatus });
      toast.success(`Payment marked as ${newPaymentStatus}`);

      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === orderId ? { ...o, paymentStatus: newPaymentStatus } : o))
      );
      if (activeOrderModal && (activeOrderModal._id || activeOrderModal.id) === orderId) {
        setActiveOrderModal((prev) => ({ ...prev, paymentStatus: newPaymentStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update payment status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
            Orders & Shipments ({orders.length})
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Monitor varsity deliveries, hostel drops, and dispatch statuses.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto self-start sm:self-auto">
          {['ALL', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-white text-[#0B1730] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, student name, city..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#2677FF]"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#0B1730] text-white text-xs font-bold rounded-xl hover:bg-[#172033] transition-colors"
        >
          Search
        </button>
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              fetchOrders();
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Clear
          </button>
        )}
      </form>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Spinner fullPage={false} label="Retrieving campus orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No orders found matching the filter "{selectedStatus}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Student / Hostel Drop</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const id = ord._id || ord.id;
                  const currentStatus = (ord.orderStatus || 'placed').toLowerCase();
                  const paymentStatus = (ord.paymentStatus || 'pending').toLowerCase();

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#172033]">
                        #{ord.orderNumber ? ord.orderNumber.slice(-8) : id.slice(-6).toUpperCase()}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(ord.createdAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">
                          {ord.shippingAddress?.fullName || ord.user?.firstName || 'Collegiate Athlete'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {ord.shippingAddress?.street}, {ord.shippingAddress?.city}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 mr-1.5">
                          {ord.paymentMethod}
                        </span>
                        <select
                          value={paymentStatus}
                          disabled={updatingId === id}
                          onChange={(e) => handlePaymentStatusChange(id, e.target.value)}
                          className={`text-[10px] font-bold uppercase rounded-md px-1.5 py-0.5 border cursor-pointer ${
                            paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : paymentStatus === 'refunded'
                              ? 'bg-purple-50 text-[#8157F5] border-purple-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                          <option value="failed">Failed</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#172033]">
                        {formatPrice(ord.total)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={currentStatus}
                          disabled={updatingId === id || currentStatus === 'cancelled'}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          className={`text-xs font-bold uppercase rounded-lg px-2.5 py-1 border focus:outline-none cursor-pointer ${
                            currentStatus === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : currentStatus === 'shipped'
                              ? 'bg-blue-50 text-[#2677FF] border-blue-200'
                              : currentStatus === 'processing' || currentStatus === 'confirmed'
                              ? 'bg-purple-50 text-[#8157F5] border-purple-200'
                              : currentStatus === 'cancelled'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveOrderModal(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#2677FF] hover:bg-blue-50 transition-colors font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setActiveOrderModal(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-black text-lg text-[#172033]">
                  Order #{activeOrderModal.orderNumber || (activeOrderModal._id || activeOrderModal.id).slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-[#667085]">
                  Placed on {formatDate(activeOrderModal.createdAt)} • Status:{' '}
                  <strong className="uppercase text-[#2677FF]">
                    {activeOrderModal.orderStatus || 'Placed'}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Address & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-[#172033] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2677FF]" />
                  <span>Hostel Delivery Point</span>
                </p>
                <p className="font-semibold text-slate-800">
                  {activeOrderModal.shippingAddress?.fullName}
                </p>
                <p className="text-slate-700">{activeOrderModal.shippingAddress?.street}</p>
                <p className="text-slate-500">
                  {activeOrderModal.shippingAddress?.city}, {activeOrderModal.shippingAddress?.state} - {activeOrderModal.shippingAddress?.pincode}
                </p>
                {activeOrderModal.shippingAddress?.phone && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Phone: {activeOrderModal.shippingAddress.phone}
                  </p>
                )}
                {activeOrderModal.notes && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    Notes: {activeOrderModal.notes}
                  </p>
                )}
              </div>

              <div>
                <p className="font-bold text-[#172033] mb-1">Payment Method & Status</p>
                <p className="text-slate-700 font-medium">Method: {activeOrderModal.paymentMethod}</p>
                <p className="text-slate-700 font-medium mt-1">
                  Status:{' '}
                  <span className="uppercase font-bold text-emerald-600">
                    {activeOrderModal.paymentStatus || 'Pending'}
                  </span>
                </p>
                {activeOrderModal.coupon?.code && (
                  <p className="mt-2 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    Coupon: {activeOrderModal.coupon.code} (-{formatPrice(activeOrderModal.coupon.discountInPaise / 100)})
                  </p>
                )}
              </div>
            </div>

            {/* Line Items */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-3">
                Parcel Line Items ({activeOrderModal.items?.length || 0})
              </h4>
              <div className="space-y-2">
                {activeOrderModal.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-[#172033]">{item.name}</span>
                        <div className="text-[11px] text-slate-400">
                          {item.sku && `SKU: ${item.sku} • `}
                          {item.size && `Size: ${item.size} • `}
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-[#172033]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Totals */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-[#172033]">
              <div className="text-xs text-slate-500 font-normal">
                Subtotal: {formatPrice(activeOrderModal.subtotal)} | Shipping: {formatPrice(activeOrderModal.shippingCharge)} | Discount: {formatPrice(activeOrderModal.discount)}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Order Total</p>
                <span className="text-xl font-heading font-black text-[#2677FF]">
                  {formatPrice(activeOrderModal.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
