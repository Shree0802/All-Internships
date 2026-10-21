import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Tag,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';

export default function Cart() {
  const {
    items,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    summary,
    cartTotal,
    cartSubtotal,
    shippingCharge,
    discount,
    cartSavings
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplyingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    if (success) {
      setCouponInput('');
    }
    setApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center w-full">
        <div className="w-20 h-20 bg-blue-50 text-[#2677FF] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033]">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-sm text-[#667085] mt-2 mb-8 max-w-sm mx-auto">
          Explore our latest campus jerseys, performance gear, and collegiate streetwear drops.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-heading font-bold text-sm text-white bg-[#2677FF] hover:bg-[#1b64e0] transition-colors shadow-lg shadow-blue-500/25"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033]">
            Shopping Bag
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            {items.length} unique item{items.length !== 1 ? 's' : ''} in your campus order
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Bag</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const isOutOfStock = item.stock !== undefined && item.stock <= 0;
            const isLowStock = item.stock !== undefined && item.stock > 0 && item.stock <= 5;

            return (
              <div
                key={item.cartItemId || item._id}
                className={`bg-white rounded-2xl p-5 border shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-all ${
                  isOutOfStock ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23f1f5f9'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' font-weight='600' fill='%2394a3b8'%3EDYPULSE%3C/text%3E%3C/svg%3E";
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase text-white tracking-wider px-1 text-center">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2677FF]">
                        {item.brand || 'DYPULSE'}
                      </span>
                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span>Low Stock ({item.stock})</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-sm text-[#172033] line-clamp-1 mt-0.5">
                      {item.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      {item.sku && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          SKU: {item.sku}
                        </span>
                      )}
                      {item.size && (
                        <span>
                          Size: <strong className="text-slate-700">{item.size}</strong>
                        </span>
                      )}
                      {item.color && (
                        <span>
                          Color: <strong className="text-slate-700">{item.color}</strong>
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-heading font-extrabold text-[#172033]">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-[#F5F7FA]">
                    <button
                      type="button"
                      onClick={() => updateItem(item.cartItemId || item._id, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors focus-visible:ring-1 focus-visible:ring-[#2677FF]"
                      title="Decrease quantity"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-[#172033] min-w-[28px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.stock !== undefined && item.quantity >= item.stock}
                      onClick={() => updateItem(item.cartItemId || item._id, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-r-lg disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:ring-1 focus-visible:ring-[#2677FF]"
                      title="Increase quantity"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-heading font-bold text-[#172033]">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeItem(item.cartItemId || item._id)}
                      className="text-[11px] text-rose-500 hover:text-rose-700 mt-0.5 font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#2677FF] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right: Summary & Coupon */}
        <div className="lg:col-span-1 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-heading font-bold text-sm text-[#172033] mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#F044A5]" />
              <span>Campus Coupons & Promo</span>
            </h3>

            {summary?.appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-900 uppercase">
                      {summary.appliedCoupon.code}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Savings: {formatPrice(summary.appliedCoupon.discount)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-emerald-700 hover:text-rose-600 rounded-lg transition-colors"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. CAMPUS10, VARSITY20"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] uppercase font-mono tracking-wider"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-[#0B1730] hover:bg-[#172033] text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors"
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCouponInput('CAMPUS10')}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                CAMPUS10
              </button>
              <button
                type="button"
                onClick={() => setCouponInput('VARSITY20')}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                VARSITY20
              </button>
              <button
                type="button"
                onClick={() => setCouponInput('FLAT100')}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                FLAT100
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="font-heading font-bold text-lg text-[#172033] pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-[#667085]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#172033]">{formatPrice(cartSubtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promotional Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              {cartSavings > 0 && discount === 0 && (
                <div className="flex justify-between text-pink-600">
                  <span>Student Discount Savings</span>
                  <span className="font-semibold">-{formatPrice(cartSavings)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Direct Campus Shipping</span>
                </span>
                <span
                  className={`font-semibold ${
                    shippingCharge === 0 ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}
                </span>
              </div>

              {shippingCharge > 0 && (
                <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-xl">
                  Add items worth ₹{(1000 - cartSubtotal).toFixed(0)} more for FREE campus shipping!
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-heading font-extrabold text-[#172033]">
                <span>Total Amount</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3.5 px-6 rounded-xl font-heading font-semibold text-sm text-white bg-[#2677FF] hover:bg-[#1b64e0] active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 group text-center"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Encrypted Student Session Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
