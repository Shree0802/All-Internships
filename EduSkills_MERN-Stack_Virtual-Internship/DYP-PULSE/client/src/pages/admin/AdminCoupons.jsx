import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post, del, put } from '../../services/api';
import Spinner from '../../components/ui/Spinner';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' | 'fixed'
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(499);
  const [maxDiscount, setMaxDiscount] = useState(500);
  const [applicableDepartment, setApplicableDepartment] = useState('ALL');
  const [usageLimit, setUsageLimit] = useState(500);
  const [perUserLimit, setPerUserLimit] = useState(1);
  const [expiryDays, setExpiryDays] = useState(90);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await get('/coupons');
      const list = res?.data?.coupons || [];
      setCoupons(list);
    } catch (err) {
      console.warn('Failed to fetch coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxDiscount: discountType === 'percentage' && maxDiscount ? Number(maxDiscount) : null,
        expiresAt: new Date(Date.now() + Number(expiryDays || 90) * 24 * 60 * 60 * 1000),
        usageLimit: Number(usageLimit || 1000),
        perUserLimit: perUserLimit ? Number(perUserLimit) : null,
        applicableDepartment
      };

      const res = await post('/coupons', payload);
      toast.success(`Coupon ${res.data?.coupon?.code || code} issued successfully! ⚡`);

      setCode('');
      setDescription('');
      setDiscountValue(10);
      setMinOrderAmount(499);
      await fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (couponId, couponCode) => {
    try {
      await del(`/coupons/${couponId}`);
      toast.success(`Coupon ${couponCode} deleted.`);
      setCoupons((prev) => prev.filter((c) => (c._id || c.id) !== couponId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  const handleToggleActive = async (coupon) => {
    const id = coupon._id || coupon.id;
    try {
      const res = await put(`/coupons/${id}`, { isActive: !coupon.isActive });
      toast.success(`Coupon status updated!`);
      setCoupons((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update coupon status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
          Campus Discount Codes ({coupons.length})
        </h1>
        <p className="text-xs text-[#667085] mt-0.5">
          Issue semester promos, hostel free shipping vouchers, and sports tournament codes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Coupon Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs h-fit">
          <h2 className="font-heading font-bold text-sm text-[#172033] mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#2677FF]" />
            <span>Create Promotional Code</span>
          </h2>

          <form onSubmit={handleAddCoupon} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FINALS20"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase text-[#172033] focus:outline-none focus:border-[#2677FF]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 20% off during campus finals week"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Type *</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹ Amount)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {discountType === 'percentage' ? 'Percentage (%) *' : 'Amount (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? '15' : '100'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Min Order (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="499"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Cap (₹)</label>
                <input
                  type="number"
                  min="0"
                  disabled={discountType !== 'percentage'}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="500"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF] disabled:opacity-40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Uses</label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="500"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Per Student</label>
                <input
                  type="number"
                  min="1"
                  value={perUserLimit}
                  onChange={(e) => setPerUserLimit(e.target.value)}
                  placeholder="1 (Blank = ∞)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Valid For (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  placeholder="90"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Applies To</label>
                <select
                  value={applicableDepartment}
                  onChange={(e) => setApplicableDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                >
                  <option value="ALL">All Campus & Sports Orders</option>
                  <option value="PLAY">DYPULSE PLAY (Sports & Kits)</option>
                  <option value="CAMPUS">DYPULSE CAMPUS (Streetwear & Tech)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating Coupon...' : 'Issue Campus Coupon'}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-200/80">
              <Spinner fullPage={false} label="Retrieving campus promo codes..." />
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 text-xs text-slate-500">
              No promotional coupons created yet. Create your first coupon using the form.
            </div>
          ) : (
            coupons.map((c) => {
              const id = c._id || c.id;
              const discountText =
                c.discountType === 'percentage'
                  ? `${c.discountValue}% OFF`
                  : `₹${(c.discountValue || 0) / 100 || c.discountValue} OFF`;

              return (
                <div
                  key={c.code}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2677FF] flex items-center justify-center shrink-0">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-sm tracking-wider text-[#172033]">
                          {c.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#8157F5]">
                          {discountText}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {c.perUserLimit && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            {c.perUserLimit} use/student
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          {c.usageCount || 0} / {c.usageLimit || 1000} used
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Min spend: ₹{c.minOrderAmountInPaise ? c.minOrderAmountInPaise / 100 : c.minOrderAmount || 0}
                        {c.maxDiscountInPaise ? ` • Max cap: ₹${c.maxDiscountInPaise / 100}` : ''}
                        {c.applicableDepartment && c.applicableDepartment !== 'ALL' ? ` • ${c.applicableDepartment} Only` : ''}
                        {c.description ? ` • ${c.description}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(id, c.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
