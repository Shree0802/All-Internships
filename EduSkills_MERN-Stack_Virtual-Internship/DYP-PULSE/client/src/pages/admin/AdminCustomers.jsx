import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, put } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import Spinner from '../../components/ui/Spinner';

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [statusModalUser, setStatusModalUser] = useState(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 20);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedRole !== 'all') params.append('role', selectedRole);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const res = await get(`/auth/admin/users?${params.toString()}`);
      const data = res?.data || res;
      setUsers(data?.users || []);
      if (data?.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.warn('Failed to fetch customers:', err);
      toast.error('Could not load student user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [selectedRole, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleToggleStatus = async () => {
    if (!statusModalUser) return;
    const newActiveState = !statusModalUser.isActive;
    setActionLoadingId(statusModalUser._id);

    try {
      await put(`/auth/admin/users/${statusModalUser._id}/status`, {
        isActive: newActiveState
      });

      toast.success(
        `Account for ${statusModalUser.firstName} ${statusModalUser.lastName} is now ${
          newActiveState ? 'Active' : 'Suspended'
        }`
      );

      // Update state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === statusModalUser._id
            ? { ...u, isActive: newActiveState, status: newActiveState ? 'active' : 'suspended' }
            : u
        )
      );

      setStatusModalUser(null);
    } catch (err) {
      toast.error(err.message || 'Failed to update account status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openUserDetails = async (user) => {
    try {
      const res = await get(`/auth/admin/users/${user._id}`);
      setSelectedUserDetail(res?.data || { user });
    } catch (err) {
      setSelectedUserDetail({ user });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
              Student & Customer Accounts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-[#2677FF] border border-blue-200">
              {pagination.total} Accounts
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage student registrations, review verified hostel addresses, and monitor varsity spending.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchUsers(pagination.page)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2677FF]' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, or phone..."
            className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#0B1730] text-white rounded-lg text-[11px] font-bold hover:bg-[#172033] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['all', 'customer', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  selectedRole === role
                    ? 'bg-white text-[#0B1730] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {[
              { id: 'all', label: 'All Status' },
              { id: 'active', label: 'Active' },
              { id: 'suspended', label: 'Suspended' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-white text-[#0B1730] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20">
            <Spinner fullPage={false} label="Loading registered campus accounts..." />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-sm">No campus accounts found</p>
            <p className="text-slate-400 mt-1">Try modifying your search or filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student / Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Lifetime Spent</th>
                  <th className="py-3.5 px-4">Member Since</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Campus Student';
                  const initials = `${u.firstName?.[0] || 'C'}${u.lastName?.[0] || 'S'}`.toUpperCase();
                  const isAdmin = u.role === 'admin';
                  const isActive = u.isActive !== false && u.status !== 'suspended' && u.status !== 'deactivated';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B1730] to-[#2677FF] flex items-center justify-center font-bold text-white text-xs shadow-xs">
                            {initials}
                          </div>
                          <div>
                            <p className="font-heading font-bold text-xs text-[#172033]">
                              {fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              {u.email}
                              {u.isEmailVerified && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" title="Verified Email" />
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {u.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {u.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No phone added</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isAdmin
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-blue-50 text-[#2677FF] border border-blue-200'
                          }`}
                        >
                          {isAdmin ? <Shield className="w-3 h-3" /> : null}
                          {u.role || 'customer'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Suspended
                            </>
                          )}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="py-3.5 px-4 font-bold text-[#172033]">
                        {u.orderCount || 0}
                      </td>

                      {/* Lifetime Spent */}
                      <td className="py-3.5 px-4 font-bold text-[#172033]">
                        {formatPrice(u.totalSpent || (u.totalSpentInPaise ? u.totalSpentInPaise / 100 : 0))}
                      </td>

                      {/* Member Since */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openUserDetails(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#2677FF] hover:bg-blue-50 transition-colors"
                            title="Inspect Profile & Addresses"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setStatusModalUser(u)}
                            disabled={actionLoadingId === u._id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={isActive ? 'Suspend Customer Account' : 'Reactivate Account'}
                          >
                            {isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total accounts)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-bold disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Inspection Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B1730] to-[#2677FF] flex items-center justify-center text-white font-black text-base">
                  {selectedUserDetail.user?.firstName?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-[#172033]">
                    {selectedUserDetail.user?.firstName} {selectedUserDetail.user?.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedUserDetail.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Contact Info</p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedUserDetail.user?.email}
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedUserDetail.user?.phone || 'No phone registered'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Registered: {formatDate(selectedUserDetail.user?.createdAt)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Account Security</p>
                <p className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Role: <span className="font-bold capitalize">{selectedUserDetail.user?.role}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-700">
                  {selectedUserDetail.user?.isEmailVerified ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Email
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Pending Verification
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  Status: {selectedUserDetail.user?.isActive !== false ? 'Active Account' : 'Suspended Account'}
                </p>
              </div>
            </div>

            {/* Delivery Addresses */}
            <div>
              <h4 className="font-heading font-bold text-sm text-[#172033] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2677FF]" />
                Saved Delivery Addresses ({selectedUserDetail.user?.addresses?.length || 0})
              </h4>
              {(!selectedUserDetail.user?.addresses || selectedUserDetail.user.addresses.length === 0) ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  No delivery addresses saved on this customer profile.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedUserDetail.user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white text-xs space-y-1 relative"
                    >
                      {addr.isDefault && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-50 text-[#2677FF] border border-blue-200">
                          Default
                        </span>
                      )}
                      <p className="font-bold text-slate-900">{addr.label || 'Campus Address'}</p>
                      <p className="text-slate-600 font-medium">{addr.fullName}</p>
                      <p className="text-slate-500">{addr.street}</p>
                      {addr.apartment && <p className="text-slate-500">{addr.apartment}</p>}
                      <p className="text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Overview */}
            {selectedUserDetail.orders && selectedUserDetail.orders.length > 0 && (
              <div>
                <h4 className="font-heading font-bold text-sm text-[#172033] mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#8157F5]" />
                  Recent Campus Orders ({selectedUserDetail.orders.length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  {selectedUserDetail.orders.map((ord) => (
                    <div key={ord._id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-[#172033]">#{ord.orderNumber || ord._id.slice(-6).toUpperCase()}</p>
                        <p className="text-[11px] text-slate-400">{formatDate(ord.createdAt)} • {ord.items?.length || 1} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatPrice(ord.totalInPaise / 100)}</p>
                        <span className="text-[10px] uppercase font-bold text-[#2677FF]">{ord.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Toggle Confirmation Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading font-black text-lg text-[#172033]">
                {statusModalUser.isActive ? 'Suspend Student Account?' : 'Reactivate Account?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {statusModalUser.isActive
                  ? `Are you sure you want to suspend the account for ${statusModalUser.firstName} ${statusModalUser.lastName}? Suspended users will not be able to log in or place orders.`
                  : `Are you sure you want to reactivate the account for ${statusModalUser.firstName} ${statusModalUser.lastName}? They will regain full shopping and varsity order capabilities.`}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={actionLoadingId === statusModalUser._id}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  statusModalUser.isActive
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {statusModalUser.isActive ? 'Confirm Suspension' : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
