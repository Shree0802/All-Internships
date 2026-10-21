import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, put } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await get('/reviews/admin/all');
      const list = res?.data?.reviews || [];
      setReviews(list);
    } catch (err) {
      console.warn('Failed to fetch reviews:', err);
      toast.error('Could not load reviews from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (reviewId, newStatus) => {
    setActionLoading(reviewId);
    try {
      await put(`/reviews/admin/${reviewId}/status`, { moderationStatus: newStatus });
      toast.success(`Review ${newStatus === 'approved' ? 'approved & published' : 'rejected'} successfully.`);
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, moderationStatus: newStatus } : r))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update review status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = selectedStatus === 'ALL' || r.moderationStatus === selectedStatus;
    const cleanQ = searchQuery.toLowerCase().trim();
    if (!cleanQ) return matchesStatus;

    const productName = (r.product?.name || '').toLowerCase();
    const studentName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
    const reviewText = (r.reviewText || '').toLowerCase();

    return (
      matchesStatus &&
      (productName.includes(cleanQ) || studentName.includes(cleanQ) || reviewText.includes(cleanQ))
    );
  });

  const pendingCount = reviews.filter((r) => r.moderationStatus === 'pending').length;
  const approvedCount = reviews.filter((r) => r.moderationStatus === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.moderationStatus === 'rejected').length;

  if (loading) {
    return <Spinner fullPage label="Loading collegiate reviews ledger..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
          Student Product Reviews ({reviews.length})
        </h1>
        <p className="text-xs text-[#667085] mt-0.5">
          Moderate verified collegiate athlete ratings, tournament feedback, and product remarks.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Reviews</p>
            <p className="text-xl font-heading font-black text-[#172033] mt-0.5">{reviews.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2677FF] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
            <p className="text-xl font-heading font-black text-amber-600 mt-0.5">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Approved & Live</p>
            <p className="text-xl font-heading font-black text-emerald-600 mt-0.5">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejected</p>
            <p className="text-xl font-heading font-black text-rose-600 mt-0.5">{rejectedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStatus === status
                  ? 'bg-[#2677FF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athlete, gear, text..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#2677FF]"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No reviews found</p>
            <p className="text-[11px] text-slate-400 mt-1">Try selecting a different status filter or clearing search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Student Athlete</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Feedback Remarks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => {
                  const studentName = rev.user
                    ? `${rev.user.firstName || ''} ${rev.user.lastName || ''}`.trim() || rev.user.name || 'Verified Athlete'
                    : 'Campus Athlete';

                  const prodImage =
                    rev.product?.images?.[0] || rev.product?.image || null;

                  return (
                    <tr key={rev._id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-[#172033] max-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          {prodImage ? (
                            <img
                              src={prodImage}
                              alt={rev.product?.name || 'Product'}
                              className="w-9 h-9 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <span className="truncate">{rev.product?.name || 'Unknown Product'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{studentName}</span>
                          {rev.verifiedPurchase && (
                            <span title="Verified Purchaser">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(rev.createdAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex text-amber-400 items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-[11px] font-bold text-slate-700 ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-[280px]">
                        {rev.title && (
                          <p className="font-bold text-[#172033] text-xs mb-0.5">{rev.title}</p>
                        )}
                        <p className="text-[11px] leading-relaxed line-clamp-2">{rev.reviewText}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            rev.moderationStatus === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : rev.moderationStatus === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rev.moderationStatus || 'pending'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rev.moderationStatus !== 'approved' && (
                            <button
                              type="button"
                              disabled={actionLoading === rev._id}
                              onClick={() => handleUpdateStatus(rev._id, 'approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {rev.moderationStatus !== 'rejected' && (
                            <button
                              type="button"
                              disabled={actionLoading === rev._id}
                              onClick={() => handleUpdateStatus(rev._id, 'rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] active:scale-95 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
