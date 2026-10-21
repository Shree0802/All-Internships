import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Tag,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post } from '../services/api';
import { formatPrice, formatDate } from '../utils/formatters';
import { loadRazorpayScript } from '../utils/razorpay';
import Spinner from '../components/ui/Spinner';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of campus plans');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [switchingMethod, setSwitchingMethod] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await get(`/orders/${id}`);
      const orderData = res?.data?.order || res?.order || res;
      setOrder(orderData);
    } catch (err) {
      // Check local storage orders fallback
      try {
        const savedOrders = JSON.parse(localStorage.getItem('dypulse_orders') || '[]');
        const matched = savedOrders.find((o) => o._id === id || o.orderNumber === id || o.id === id);
        if (matched) {
          setOrder(matched);
          return;
        }
      } catch {
        // Fall through
      }
      setError(err.message || 'Could not find the specified order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await post(`/orders/${id}/cancel`, { reason: cancelReason });
      toast.success('Order cancelled and inventory restored');
      setCancelModalOpen(false);
      await fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleRetryPayment = async () => {
    setProcessingPayment(true);
    try {
      const res = await post('/payments/create-order', { orderId: order._id });
      if (!res.success || !res.data?.isConfigured) {
        toast.error(res.message || 'Razorpay keys not configured on this server. Switch to COD instead.');
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        toast.error('Unable to load Razorpay checkout script. Please check your connection.');
        return;
      }

      const pData = res.data;
      const options = {
        key: pData.keyId,
        amount: pData.amountInPaise,
        currency: pData.currency || 'INR',
        name: 'DYPULSE Campus Store',
        description: `Order #${order.orderNumber}`,
        order_id: pData.razorpayOrderId,
        handler: async function (response) {
          try {
            toast.loading('Verifying secure signature...', { id: 'order-verify-toast' });
            await post('/payments/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('Payment verified successfully! ⚡', { id: 'order-verify-toast' });
            await fetchOrder();
          } catch (vErr) {
            toast.error(vErr.message || 'Payment verification failed', { id: 'order-verify-toast' });
            await fetchOrder();
          }
        },
        modal: {
          ondismiss: async function () {
            await post('/payments/record-failure', {
              orderId: order._id,
              razorpayOrderId: pData.razorpayOrderId,
              error: { reason: 'user_dismissed', description: 'Customer dismissed Razorpay window' }
            }).catch(() => null);
            toast('Payment attempt dismissed', { icon: 'ℹ️' });
            await fetchOrder();
          }
        },
        prefill: {
          name: order.shippingAddress?.fullName || '',
          email: order.user?.email || '',
          contact: order.shippingAddress?.phone || ''
        },
        theme: {
          color: '#2677FF'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (fResp) {
        await post('/payments/record-failure', {
          orderId: order._id,
          razorpayOrderId: pData.razorpayOrderId,
          razorpayPaymentId: fResp.error?.metadata?.payment_id,
          error: fResp.error
        }).catch(() => null);
        toast.error(`Payment failed: ${fResp.error?.description || 'Transaction declined'}`);
        await fetchOrder();
      });

      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Failed to initialize payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSwitchToCod = async () => {
    setSwitchingMethod(true);
    try {
      await post(`/payments/switch-method/${order._id}`, { newMethod: 'COD' });
      toast.success('Switched to Cash on Delivery (COD)! 📦');
      await fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Could not switch payment method');
    } finally {
      setSwitchingMethod(false);
    }
  };

  if (loading) {
    return <Spinner fullPage label="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center w-full">
        <h2 className="text-2xl font-heading font-extrabold text-[#172033]">
          Order Not Found
        </h2>
        <p className="text-xs text-[#667085] mt-2 mb-6">
          {error || 'The requested order could not be located.'}
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#2677FF]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const status = (order.orderStatus || 'placed').toLowerCase();
  const isCancelled = status === 'cancelled';
  const canCancel = ['placed', 'confirmed'].includes(status);

  const steps = [
    { label: 'Placed', key: 'placed' },
    { label: 'Confirmed', key: 'confirmed' },
    { label: 'Processing', key: 'processing' },
    { label: 'Shipped', key: 'shipped' },
    { label: 'Delivered', key: 'delivered' }
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'placed': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIndex = getStepIndex(status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#667085] hover:text-[#2677FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        {canCancel && (
          <button
            onClick={() => setCancelModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#172033]">
                Order #{order.orderNumber || (order._id || id).slice(-8).toUpperCase()}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isCancelled
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-blue-50 text-[#2677FF] border border-blue-200'
                }`}
              >
                {order.orderStatus || 'Placed'}
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1">
              Placed on {formatDate(order.createdAt)} • Ref: {order._id}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-[#667085]">Payment Method & Status</p>
            <p className="text-xs font-bold uppercase text-slate-800">
              {order.paymentMethod} •{' '}
              <span className={order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>
                {order.paymentStatus || 'Pending'}
              </span>
            </p>
          </div>
        </div>

        {/* Cancelled Banner */}
        {isCancelled && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Order Cancelled</p>
              <p className="mt-0.5">
                Reason: {order.cancellation?.reason || 'Cancelled by student'}
              </p>
              {order.cancellation?.cancelledAt && (
                <p className="text-[11px] text-rose-600 mt-1">
                  Cancelled on {formatDate(order.cancellation.cancelledAt)} • All items restocked to inventory.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Unpaid / Failed Online Payment Action Card */}
        {!isCancelled && order.paymentMethod === 'ONLINE' && order.paymentStatus !== 'paid' && (
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-amber-950">
                    Online Payment Incomplete ({order.paymentStatus?.toUpperCase() || 'PENDING'})
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  {order.paymentDetails?.failureReason
                    ? `Previous attempt: ${order.paymentDetails.failureReason}. You can retry or switch to COD.`
                    : 'Your order is saved, but online payment has not been confirmed yet.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRetryPayment}
                disabled={processingPayment}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-[#2677FF] hover:bg-blue-600 rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                {processingPayment ? 'Opening Gateway...' : 'Pay via Razorpay'}
              </button>
              <button
                type="button"
                onClick={handleSwitchToCod}
                disabled={switchingMethod}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50"
              >
                {switchingMethod ? 'Switching...' : 'Switch to COD'}
              </button>
            </div>
          </div>
        )}

        {/* Timeline (if not cancelled) */}
        {!isCancelled && (
          <div className="py-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-6">
              Campus Delivery Progress
            </h2>
            <div className="grid grid-cols-5 text-center text-xs relative">
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.key} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`font-semibold ${
                        isCurrent
                          ? 'text-[#2677FF] font-bold'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Address and Student Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div>
            <p className="font-bold text-[#172033] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2677FF]" />
              <span>Campus Delivery Address</span>
            </p>
            <p className="font-semibold text-slate-800">
              {order.shippingAddress?.fullName || 'Collegiate Athlete'}
            </p>
            <p className="text-slate-600">{order.shippingAddress?.street}</p>
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            {order.shippingAddress?.phone && (
              <p className="text-slate-400 mt-1">Phone: {order.shippingAddress.phone}</p>
            )}
          </div>

          <div>
            <p className="font-bold text-[#172033] mb-1.5 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#8157F5]" />
              <span>Hostel Drop Notes</span>
            </p>
            <p className="text-slate-600 italic">
              {order.notes || 'Standard hostel reception / security drop.'}
            </p>
            {order.coupon?.code && (
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono text-[11px] font-bold border border-emerald-200">
                <Tag className="w-3 h-3" />
                <span>Coupon Applied: {order.coupon.code}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <h3 className="font-heading font-bold text-sm text-[#172033] mb-4">
            Items in this Shipment ({order.items?.length || 0})
          </h3>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {order.items?.map((item, idx) => (
              <div
                key={item._id || idx}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#172033]">{item.name}</h4>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                      {item.sku && (
                        <span className="font-mono text-[10px] text-slate-400">
                          SKU: {item.sku}
                        </span>
                      )}
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatPrice(item.price)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-heading font-bold text-sm text-[#172033]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-6">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Official DYPULSE Varsity Verification</span>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs text-[#667085]">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-800">{formatPrice(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Campus Delivery</span>
              <span className="font-semibold text-slate-800">
                {order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-heading font-extrabold text-[#172033]">
              <span>Final Total</span>
              <span className="text-[#2677FF]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalOpen && (
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
              Are you sure you want to cancel this order? The reserved inventory will be immediately restocked.
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
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
