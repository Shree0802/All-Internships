import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post } from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of tournament schedule');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get('/orders/my-orders');
      const orderList = res?.data?.orders || res?.orders || [];
      try {
        const savedOrders = JSON.parse(localStorage.getItem('dypulse_orders') || '[]');
        const combined = [...orderList];
        for (const so of savedOrders) {
          if (!combined.some((o) => o._id === so._id || o.orderNumber === so.orderNumber)) {
            combined.unshift(so);
          }
        }
        setOrders(combined);
      } catch {
        setOrders(orderList);
      }
    } catch (err) {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('dypulse_orders') || '[]');
        if (savedOrders.length > 0) {
          setOrders(savedOrders);
          return;
        }
      } catch {
        // Fall through
      }
      setError(err.message || 'Could not load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openCancelModal = (order) => {
    setCancelTargetOrder(order);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTargetOrder) return;
    const orderId = cancelTargetOrder._id || cancelTargetOrder.id;
    setCancellingId(orderId);

    try {
      await post(`/orders/${orderId}/cancel`, { reason: cancelReason });
      toast.success('Order cancelled and items restocked');
      setCancelModalOpen(false);
      setCancelTargetOrder(null);
      await fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <Spinner fullPage label="Retrieving your campus orders..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033]">
          Campus Orders & Deliveries
        </h1>
        <p className="text-xs text-[#667085] mt-1">
          Track packages, check shipping updates, and view your hostel delivery history.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="No orders placed yet"
          description="You haven’t ordered any tournament gear or campus drops yet. Start exploring the catalog!"
          actionText="Shop Official Drops"
          actionHref="/shop"
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderId = order._id || order.id;
            const status = (order.orderStatus || 'placed').toLowerCase();
            const canCancel = ['placed', 'confirmed'].includes(status);

            return (
              <div
                key={orderId}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-heading font-extrabold text-base text-[#172033]">
                        Order #{order.orderNumber || orderId.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : status === 'shipped'
                            ? 'bg-blue-50 text-[#2677FF] border border-blue-200'
                            : status === 'processing' || status === 'confirmed'
                            ? 'bg-purple-50 text-[#8157F5] border border-purple-200'
                            : status === 'cancelled'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {status === 'delivered' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : status === 'cancelled' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Truck className="w-3.5 h-3.5" />
                        )}
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] mt-1">
                      Placed on {formatDate(order.createdAt)} • Payment:{' '}
                      <strong className="text-slate-700">{order.paymentMethod}</strong> (
                      <span className="capitalize">{order.paymentStatus || 'Pending'}</span>)
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[#667085]">Total Amount</p>
                    <p className="font-heading font-extrabold text-base text-[#172033]">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-4 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#172033] line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {item.size && `Size: ${item.size} • `}Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#172033]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span>Hostel Drop: </span>
                    <strong className="text-slate-700">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}
                    </strong>
                  </div>

                  <div className="flex items-center gap-3">
                    {canCancel && (
                      <button
                        onClick={() => openCancelModal(order)}
                        disabled={cancellingId === orderId}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    <Link
                      to={`/orders/${orderId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B1730] hover:bg-[#172033] transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && cancelTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setCancelModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-heading font-black text-lg text-[#172033]">
                Cancel Campus Order
              </h3>
            </div>

            <p className="text-xs text-[#667085]">
              Are you sure you want to cancel order #{cancelTargetOrder.orderNumber || cancelTargetOrder._id?.slice(-8)}? The items will be released back into inventory immediately.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF]"
              >
                <option value="Change of tournament schedule">Change of tournament schedule</option>
                <option value="Ordered incorrect size or color">Ordered incorrect size or color</option>
                <option value="Need to change hostel drop point">Need to change hostel drop point</option>
                <option value="Found alternative collegiate gear">Found alternative collegiate gear</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancellingId !== null}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
