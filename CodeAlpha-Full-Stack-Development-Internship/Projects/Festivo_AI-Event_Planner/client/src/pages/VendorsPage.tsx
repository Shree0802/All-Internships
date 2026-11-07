import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../lib/api';
import { IEvent, IVendor, VendorCategory, BookingStatus, PaymentStatus } from '../types';
import { formatCurrency, formatDate, triggerCelebrationConfetti } from '../lib/utils';
import { EventSubNav } from '../components/EventSubNav';
import { ExportModal } from '../components/ExportModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const VendorsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  // Modal State for Add / Edit Vendor
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState<{
    name: string;
    category: VendorCategory;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    estimatedCost: number;
    actualCost: number;
    bookingStatus: BookingStatus;
    paymentStatus: PaymentStatus;
    bookingDeadline: string;
    notes: string;
  }>({
    name: '',
    category: 'catering',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    estimatedCost: 0,
    actualCost: 0,
    bookingStatus: 'to_research',
    paymentStatus: 'unpaid',
    bookingDeadline: '',
    notes: '',
  });

  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVendors(id);
    }
  }, [id]);

  const loadVendors = async (eventId: string) => {
    try {
      setLoading(true);
      const evt = await api.getEvent(eventId);
      setEvent(evt);
      setVendors(evt.vendors || []);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVendorId(null);
    setVendorForm({
      name: '',
      category: 'catering',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      estimatedCost: 50000,
      actualCost: 0,
      bookingStatus: 'to_research',
      paymentStatus: 'unpaid',
      bookingDeadline: event?.date || '',
      notes: '',
    });
    setIsVendorModalOpen(true);
  };

  const handleOpenEdit = (v: IVendor) => {
    setEditingVendorId(v.id);
    setVendorForm({
      name: v.name,
      category: v.category,
      contactName: v.contactName || '',
      contactPhone: v.contactPhone || '',
      contactEmail: v.contactEmail || '',
      estimatedCost: v.estimatedCost || 0,
      actualCost: v.actualCost || 0,
      bookingStatus: v.bookingStatus,
      paymentStatus: v.paymentStatus,
      bookingDeadline: v.bookingDeadline || '',
      notes: v.notes || '',
    });
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !vendorForm.name.trim()) return;

    try {
      if (editingVendorId) {
        await api.updateVendor(event.id, editingVendorId, vendorForm);
      } else {
        await api.addVendor(event.id, vendorForm);
      }
      setIsVendorModalOpen(false);
      loadVendors(event.id);
      if (vendorForm.bookingStatus === 'booked') {
        triggerCelebrationConfetti();
      }
    } catch (err) {
      console.error('Failed to save vendor:', err);
    }
  };

  const handleDeleteVendor = async () => {
    if (!event || !deleteVendorId) return;
    try {
      await api.deleteVendor(event.id, deleteVendorId);
      setDeleteVendorId(null);
      loadVendors(event.id);
    } catch (err) {
      console.error('Failed to delete vendor:', err);
    }
  };

  if (loading || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-festivo-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-serif text-lg text-festivo-plum-950 font-medium">Loading vendor directory & contracts...</p>
        <p className="text-xs text-festivo-plum-500 mt-1">Retrieving quotes, booking milestones, and contact dossiers</p>
      </div>
    );
  }

  // Booking stats
  const totalVendors = vendors.length;
  const bookedCount = vendors.filter((v) => v.bookingStatus === 'booked').length;
  const negotiatingCount = vendors.filter((v) => v.bookingStatus === 'negotiating' || v.bookingStatus === 'contacted').length;
  const researchingCount = vendors.filter((v) => v.bookingStatus === 'to_research' || v.bookingStatus === 'shortlisted').length;
  const committedVendorSpend = vendors.reduce((acc, v) => acc + (v.actualCost || v.estimatedCost || 0), 0);

  // Filter and search
  const filteredVendors = vendors.filter((v) => {
    if (statusFilter !== 'all' && v.bookingStatus !== statusFilter) return false;
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.name.toLowerCase().includes(q);
      const matchCat = v.category.toLowerCase().includes(q);
      const matchContact = (v.contactName || '').toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchContact) return false;
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'booked':
        return <span className="badge-emerald inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Booked</span>;
      case 'negotiating':
        return <span className="badge-gold inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Negotiating</span>;
      case 'contacted':
        return <span className="badge-coral inline-flex items-center gap-1"><Mail className="w-3 h-3" /> Contacted</span>;
      case 'shortlisted':
        return <span className="badge-plum inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> Shortlisted</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600">To Research</span>;
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">Fully Paid</span>;
      case 'partially_paid':
        return <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">Deposit Paid</span>;
      default:
        return <span className="text-[10px] font-bold uppercase text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">Unpaid</span>;
    }
  };

  return (
    <div className="min-h-screen bg-festivo-ivory/30 pb-20">
      <EventSubNav event={event} onOpenExport={() => setShowExportModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & New Vendor CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-coral">
                Procurement & Partner Operations
              </span>
              <span className="text-[11px] font-medium text-festivo-plum-500">
                • {event.name}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1.5 tracking-tight">
              Vendor Pipeline & Contracts
            </h1>
            <p className="text-xs sm:text-sm text-festivo-plum-600 mt-1 max-w-2xl leading-relaxed">
              Track vendor lifecycle from discovery and proposals to signed contracts, deposit releases, and day-of execution.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vendor</span>
          </button>
        </div>

        {/* Pipeline Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="festivo-card p-4.5 bg-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-festivo-plum-500">Total Pipeline</span>
              <Briefcase className="w-4 h-4 text-festivo-plum-400" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-festivo-plum-950 mt-1.5 tabular-nums">
              {totalVendors}
            </div>
            <div className="text-[11px] text-festivo-plum-600 mt-1 flex items-center justify-between">
              <span>Committed volume</span>
              <span className="font-semibold tabular-nums text-festivo-plum-800">
                {formatCurrency(committedVendorSpend, event.currency)}
              </span>
            </div>
          </div>

          <div className="festivo-card p-4.5 bg-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Confirmed & Booked</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700 mt-1.5 tabular-nums">
              {bookedCount}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
              Contracts locked & secured
            </span>
          </div>

          <div className="festivo-card p-4.5 bg-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">In Negotiation</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-amber-700 mt-1.5 tabular-nums">
              {negotiatingCount}
            </div>
            <span className="text-[11px] text-amber-600 font-medium mt-1 block">
              Reviewing quotes & menus
            </span>
          </div>

          <div className="festivo-card p-4.5 bg-white relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-festivo-coral-600">To Research</span>
              <Sparkles className="w-4 h-4 text-festivo-coral-500" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-festivo-coral-600 mt-1.5 tabular-nums">
              {researchingCount}
            </div>
            <span className="text-[11px] text-festivo-coral-600 font-medium mt-1 block">
              Shortlisted candidates
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-festivo-plum-100 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-festivo-plum-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search partner name, category, lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-festivo-plum-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-festivo-plum-200 text-xs font-semibold text-festivo-plum-900 bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
              >
                <option value="all">All Statuses ({vendors.length})</option>
                <option value="to_research">To Research</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="contacted">Contacted</option>
                <option value="negotiating">Negotiating</option>
                <option value="booked">Booked</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-festivo-plum-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-festivo-plum-200 text-xs font-semibold text-festivo-plum-900 bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
              >
                <option value="all">All Categories</option>
                <option value="venue">Venue</option>
                <option value="catering">Catering</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="decorations">Decorations & Florals</option>
                <option value="entertainment">Entertainment & Sound</option>
                <option value="cake_desserts">Cake & Desserts</option>
                <option value="makeup_styling">Makeup & Styling</option>
                <option value="invitations">Invitations</option>
                <option value="transportation">Logistics / Transport</option>
                <option value="equipment_rental">Equipment Rental</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.length === 0 ? (
            <div className="col-span-full festivo-card p-14 bg-white text-center">
              <Briefcase className="w-10 h-10 text-festivo-plum-300 mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-festivo-plum-950">No Vendors Found</h3>
              <p className="text-xs text-festivo-plum-600 mt-1 max-w-md mx-auto">
                No vendor records match your active search and filter criteria. Try resetting the filters or add a new vendor partner.
              </p>
              <button
                onClick={handleOpenAdd}
                className="mt-4 bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vendor Partner</span>
              </button>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="festivo-card p-5.5 bg-white flex flex-col justify-between space-y-4 hover:shadow-card hover:-translate-y-0.5 transition-all group border border-festivo-plum-100/90"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-festivo-plum-100/80 mb-3">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-festivo-plum-50 text-festivo-plum-900 border border-festivo-plum-200/60">
                      {vendor.category.replace('_', ' ')}
                    </span>
                    {getStatusBadge(vendor.bookingStatus)}
                  </div>

                  <h4 className="font-serif text-lg font-bold text-festivo-plum-950 group-hover:text-festivo-coral-600 transition-colors">
                    {vendor.name}
                  </h4>

                  {vendor.contactName && (
                    <div className="text-xs text-festivo-plum-700 font-medium mt-1 flex items-center gap-1.5">
                      <span className="text-festivo-plum-400 text-[11px]">Lead:</span>
                      <span className="text-festivo-plum-900 font-semibold">{vendor.contactName}</span>
                    </div>
                  )}

                  {/* Contact Chips */}
                  <div className="mt-3 space-y-1.5 text-xs text-festivo-plum-700">
                    {vendor.contactPhone && (
                      <a
                        href={`tel:${vendor.contactPhone}`}
                        className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-festivo-ivory text-festivo-plum-700 hover:text-festivo-coral-600 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-festivo-coral-500 shrink-0" />
                        <span className="font-medium">{vendor.contactPhone}</span>
                      </a>
                    )}
                    {vendor.contactEmail && (
                      <a
                        href={`mailto:${vendor.contactEmail}`}
                        className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-festivo-ivory text-festivo-plum-700 hover:text-festivo-coral-600 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-festivo-plum-500 shrink-0" />
                        <span className="truncate font-medium">{vendor.contactEmail}</span>
                      </a>
                    )}
                  </div>

                  {vendor.notes && (
                    <div className="mt-3.5 p-2.5 rounded-xl bg-festivo-ivory/60 border border-festivo-plum-100 text-[11px] text-festivo-plum-700 leading-relaxed italic">
                      "{vendor.notes}"
                    </div>
                  )}
                </div>

                <div className="pt-3.5 border-t border-festivo-plum-100/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-festivo-plum-500 uppercase font-bold tracking-wider">
                        {vendor.actualCost ? 'Agreed Fee' : 'Est. Quote'}
                      </span>
                      {getPaymentBadge(vendor.paymentStatus)}
                    </div>
                    <span className="font-serif text-base font-bold text-festivo-plum-950 tabular-nums block mt-0.5">
                      {formatCurrency(vendor.actualCost || vendor.estimatedCost, event.currency)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-2 rounded-xl text-festivo-plum-600 hover:text-festivo-plum-950 hover:bg-festivo-cream transition-colors cursor-pointer"
                      title="Edit Vendor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteVendorId(vendor.id)}
                      className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add / Edit Vendor Modal */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-festivo-plum-950/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-floating border border-festivo-plum-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-festivo-plum-100">
              <div>
                <span className="badge-coral text-[10px]">Vendor Partner Dossier</span>
                <h3 className="font-serif text-xl font-bold text-festivo-plum-950 mt-1">
                  {editingVendorId ? 'Edit Vendor Record' : 'Add New Vendor Partner'}
                </h3>
              </div>
              <button
                onClick={() => setIsVendorModalOpen(false)}
                className="p-2 rounded-xl text-festivo-plum-400 hover:text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-festivo-plum-900 mb-1">
                  Vendor / Studio Name <span className="text-festivo-coral-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drishti Cinematics & Drone Studio"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Category</label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value as VendorCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  >
                    <option value="venue">Venue</option>
                    <option value="catering">Catering</option>
                    <option value="photography">Photography</option>
                    <option value="videography">Videography</option>
                    <option value="decorations">Decorations & Florals</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="cake_desserts">Cake & Desserts</option>
                    <option value="makeup_styling">Makeup & Styling</option>
                    <option value="invitations">Invitations</option>
                    <option value="transportation">Transportation</option>
                    <option value="equipment_rental">Equipment Rental</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Booking Status</label>
                  <select
                    value={vendorForm.bookingStatus}
                    onChange={(e) => setVendorForm({ ...vendorForm, bookingStatus: e.target.value as BookingStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  >
                    <option value="to_research">To Research</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="contacted">Contacted</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="booked">Booked (Confirmed)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Pooja Kashyap"
                    value={vendorForm.contactName}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98290 12345"
                    value={vendorForm.contactPhone}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-900 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@studio.com"
                  value={vendorForm.contactEmail}
                  onChange={(e) => setVendorForm({ ...vendorForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">
                    Estimated Cost ({event.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.estimatedCost}
                    onChange={(e) => setVendorForm({ ...vendorForm, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">
                    Agreed Contract Fee ({event.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={vendorForm.actualCost}
                    onChange={(e) => setVendorForm({ ...vendorForm, actualCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Payment Status</label>
                  <select
                    value={vendorForm.paymentStatus}
                    onChange={(e) => setVendorForm({ ...vendorForm, paymentStatus: e.target.value as PaymentStatus })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Deposit Paid</option>
                    <option value="paid">Fully Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-festivo-plum-900 mb-1">Booking Deadline</label>
                  <input
                    type="date"
                    value={vendorForm.bookingDeadline}
                    onChange={(e) => setVendorForm({ ...vendorForm, bookingDeadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-festivo-plum-900 mb-1">
                  Contract Deliverables & Milestone Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50% advance disbursed; includes 4K drone teaser delivered within 14 days"
                  value={vendorForm.notes}
                  onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-festivo-plum-200 text-xs text-festivo-plum-950 bg-festivo-ivory/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-festivo-coral-400"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-festivo-plum-100">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-festivo-plum-700 hover:bg-festivo-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-festivo-coral-500 hover:bg-festivo-coral-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs hover:shadow-sm transition-all"
                >
                  {editingVendorId ? 'Save Vendor Record' : 'Add Vendor Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteVendorId}
        title="Delete Vendor Record"
        message="Are you sure you want to remove this vendor partner? All contact notes and associated quote information will be removed."
        confirmLabel="Yes, Delete Vendor"
        onConfirm={handleDeleteVendor}
        onCancel={() => setDeleteVendorId(null)}
      />

      <ExportModal
        isOpen={showExportModal}
        event={event}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};
