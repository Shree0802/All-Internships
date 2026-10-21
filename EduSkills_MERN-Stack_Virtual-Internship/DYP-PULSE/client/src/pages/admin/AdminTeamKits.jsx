import React, { useState, useEffect } from 'react';
import {
  Award,
  Mail,
  Phone,
  Building,
  Check,
  Clock,
  Eye,
  Search,
  Filter,
  X,
  Tag,
  DollarSign,
  Shirt,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, put } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';

export default function AdminTeamKits() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Quotation form states inside modal
  const [quotePrice, setQuotePrice] = useState('');
  const [quotePerUnit, setQuotePerUnit] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedSport !== 'ALL') params.append('sport', selectedSport);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await get(`/team-kits/admin/all?${params.toString()}`);
      setRequests(res?.data?.requests || []);
    } catch (err) {
      console.warn('Failed to load team kit requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedStatus, selectedSport]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleOpenModal = (req) => {
    setActiveModal(req);
    setQuotePrice(req.quotation?.estimatedPriceInPaise ? (req.quotation.estimatedPriceInPaise / 100).toString() : '');
    setQuotePerUnit(req.quotation?.pricePerUnitInPaise ? (req.quotation.pricePerUnitInPaise / 100).toString() : '');
    setQuoteNotes(req.quotation?.notes || '');
    setAdminNotes(req.adminNotes || '');
    setStatusNote('');
  };

  const handleStatusChange = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      await put(`/team-kits/admin/${requestId}/status`, {
        status: newStatus,
        note: statusNote || `Status changed to ${newStatus} by admin`,
        adminNotes
      });
      toast.success(`Request status updated to ${newStatus}`);

      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: newStatus, adminNotes } : r))
      );
      if (activeModal && activeModal._id === requestId) {
        setActiveModal((prev) => ({ ...prev, status: newStatus, adminNotes }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    if (!activeModal) return;

    setUpdatingId(activeModal._id);
    try {
      const res = await put(`/team-kits/admin/${activeModal._id}/quotation`, {
        estimatedPrice: Number(quotePrice),
        pricePerUnit: quotePerUnit ? Number(quotePerUnit) : Math.round(Number(quotePrice) / (activeModal.totalQuantity || 1)),
        notes: quoteNotes
      });

      toast.success('Official quotation recorded!');
      await fetchRequests();
      setActiveModal(res.data?.request || null);
    } catch (err) {
      toast.error(err.message || 'Failed to record quotation');
    } finally {
      setUpdatingId(null);
    }
  };

  const STATUS_LIST = [
    'ALL',
    'Submitted',
    'Under Review',
    'Quotation Prepared',
    'Approved',
    'In Production',
    'Completed',
    'Rejected',
    'Cancelled'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
            Team Kit Studio Requests ({requests.length})
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage custom varsity jersey requests, issue official quotations, and monitor production lines.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto self-start sm:self-auto">
          {STATUS_LIST.map((st) => (
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

      {/* Search and Sport Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, team, college, email..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#2677FF]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0B1730] text-white text-xs font-bold rounded-xl hover:bg-[#172033]"
          >
            Search
          </button>
        </form>

        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <option value="ALL">All Sports</option>
          <option value="Cricket">Cricket</option>
          <option value="Football">Football</option>
          <option value="Basketball">Basketball</option>
          <option value="Badminton">Badminton</option>
          <option value="Other">Other Sports</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16">
            <Spinner fullPage={false} label="Retrieving custom squad requests..." />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No team kit requests matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Team & College</th>
                  <th className="py-3.5 px-4">Sport & Spec</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Quotation</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const id = req._id;
                  const currentStatus = req.status;

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#172033]">
                        #{req.requestReference}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(req.createdAt)}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{req.teamInfo?.teamName}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {req.teamInfo?.organization} • {req.teamInfo?.contactPerson}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {req.sport} ({req.kitType})
                      </td>

                      <td className="py-3.5 px-4 font-heading font-black text-[#172033]">
                        {req.totalQuantity}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={currentStatus}
                          disabled={updatingId === id}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          className={`text-xs font-bold uppercase rounded-lg px-2 py-1 border focus:outline-none cursor-pointer ${
                            currentStatus === 'Completed' || currentStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : currentStatus === 'In Production'
                              ? 'bg-blue-50 text-[#2677FF] border-blue-200'
                              : currentStatus === 'Quotation Prepared'
                              ? 'bg-purple-50 text-[#8157F5] border-purple-200'
                              : currentStatus === 'Cancelled' || currentStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {STATUS_LIST.filter((s) => s !== 'ALL').map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        {req.quotation?.estimatedPriceInPaise ? (
                          <span className="font-bold text-emerald-600">
                            {formatPrice(req.quotation.estimatedPriceInPaise / 100)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenModal(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-[#2677FF] hover:bg-blue-50 transition-colors font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
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

      {/* Inspect & Quotation Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-black text-lg text-[#172033]">
                  Request #{activeModal.requestReference} — {activeModal.teamInfo?.teamName}
                </h3>
                <p className="text-xs text-[#667085]">
                  Submitted on {formatDate(activeModal.createdAt)} • Status:{' '}
                  <strong className="uppercase text-[#2677FF]">{activeModal.status}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Team Info & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-[#172033] mb-1">College & Team</p>
                <p className="text-slate-700 font-semibold">{activeModal.teamInfo?.teamName}</p>
                <p className="text-slate-500">{activeModal.teamInfo?.organization}</p>
                <p className="text-slate-700 mt-2">
                  <strong>Captain:</strong> {activeModal.teamInfo?.contactPerson}
                </p>
                <p className="text-slate-500">Email: {activeModal.teamInfo?.contactEmail}</p>
                <p className="text-slate-500">Phone: {activeModal.teamInfo?.contactPhone}</p>
              </div>

              <div>
                <p className="font-bold text-[#172033] mb-1">Kit Specifications</p>
                <p className="text-slate-700">Sport: {activeModal.sport}</p>
                <p className="text-slate-700">Kit Type: {activeModal.kitType}</p>
                <p className="text-slate-700">Collar / Cut: {activeModal.design?.jerseyStyle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-slate-500">Colors:</span>
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: activeModal.design?.primaryColor }} />
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: activeModal.design?.secondaryColor }} />
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: activeModal.design?.accentColor }} />
                </div>
                {activeModal.additionalRequirements?.desiredDeliveryDate && (
                  <p className="text-slate-500 mt-1">
                    Target Delivery: {formatDate(activeModal.additionalRequirements.desiredDeliveryDate)}
                  </p>
                )}
              </div>
            </div>

            {/* Size Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] mb-2 flex items-center justify-between">
                <span>Size Breakdown</span>
                <span className="text-[#2677FF] font-black">{activeModal.totalQuantity} Total Units</span>
              </h4>
              <div className="grid grid-cols-6 gap-2 text-center text-xs">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                  <div key={sz} className="p-2.5 rounded-xl border bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold">{sz}</p>
                    <p className="font-heading font-black text-sm text-[#172033]">
                      {activeModal.sizeBreakdown?.[sz] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Crest / Logo and Reference */}
            {(activeModal.design?.logoUrl || activeModal.design?.referenceImageUrl || activeModal.design?.rosterNotes) && (
              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs space-y-2">
                <p className="font-bold text-[#172033]">Attached Assets & Notes</p>
                <div className="flex flex-wrap gap-4 items-center">
                  {activeModal.design?.logoUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Team Logo:</span>
                      <a href={activeModal.design.logoUrl} target="_blank" rel="noreferrer" className="underline text-blue-600">
                        View Image
                      </a>
                    </div>
                  )}
                  {activeModal.design?.referenceImageUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Reference:</span>
                      <a href={activeModal.design.referenceImageUrl} target="_blank" rel="noreferrer" className="underline text-blue-600">
                        Design Link
                      </a>
                    </div>
                  )}
                </div>
                {activeModal.design?.rosterNotes && (
                  <p className="text-slate-600 italic">Roster: {activeModal.design.rosterNotes}</p>
                )}
              </div>
            )}

            {/* Quotation Editor */}
            <form onSubmit={handleSaveQuotation} className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-4 text-xs">
              <h4 className="font-heading font-bold text-sm text-[#0B1730] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#2677FF]" />
                <span>Issue / Update Official Quotation</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Total Estimated Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="e.g. 15999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#172033]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Price Per Unit (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quotePerUnit}
                    onChange={(e) => setQuotePerUnit(e.target.value)}
                    placeholder="e.g. 999"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#172033]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quotation Notes / Terms for Student Captain
                </label>
                <input
                  type="text"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. Includes dry-fit sublimation, vectorization, and 8-day turnaround."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#172033]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updatingId !== null}
                  className="px-5 py-2 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {updatingId ? 'Saving...' : 'Save & Issue Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
