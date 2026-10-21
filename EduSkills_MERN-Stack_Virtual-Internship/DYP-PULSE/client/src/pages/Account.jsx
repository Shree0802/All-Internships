import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Shield,
  MapPin,
  Lock,
  Phone,
  Mail,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  Check,
  Building,
  Home,
  Save,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post, put, del } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { generateInitials } from '../utils/formatters';

// Validation Schemas
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/\d/, 'Must contain at least one number'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address / Hostel room is required'),
  apartment: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(4, 'PIN / Postal Code is required'),
  phone: z.string().min(6, 'Valid contact number is required'),
  isDefault: z.boolean().default(false),
});

export default function Account() {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'addresses'

  // Security show/hide toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Address state
  const [addresses, setAddresses] = useState(() => {
    return user?.addresses && user.addresses.length > 0
      ? user.addresses
      : [
          {
            id: 'addr-1',
            fullName: `${user?.firstName || 'College'} ${user?.lastName || 'Athlete'}`.trim(),
            street: 'Hostel Block 4, Room 302, Campus North',
            apartment: 'D.Y. Patil University Campus',
            city: 'Navi Mumbai',
            state: 'Maharashtra',
            zipCode: '400706',
            phone: user?.phone || '+91 98765 43210',
            isDefault: true,
          },
        ];
  });

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  // Sync profile form when user object updates
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || '',
      });
      if (user.addresses && user.addresses.length > 0) {
        setAddresses(user.addresses);
      }
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    }
  };

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onPasswordSubmit = async (data) => {
    setSecurityError('');
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
    } catch (err) {
      setSecurityError(err.message || 'Failed to change password. Please verify current password.');
      toast.error(err.message || 'Failed to change password.');
    }
  };

  // Address Form
  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    reset: resetAddress,
    setValue: setAddressValue,
    formState: { errors: addressErrors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      isDefault: false,
    },
  });

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    resetAddress({
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      phone: user?.phone || '',
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id || addr._id);
    resetAddress({
      fullName: addr.fullName,
      street: addr.street,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
      phone: addr.phone,
      isDefault: !!addr.isDefault,
    });
    setAddressModalOpen(true);
  };

  const onAddressSubmit = async (data) => {
    setAddressSubmitting(true);
    try {
      const payload = {
        ...data,
        pincode: data.zipCode || data.pincode || '400706',
        zipCode: data.zipCode || data.pincode || '400706',
      };

      if (editingAddressId) {
        // Edit existing via backend API
        const res = await put(`/auth/addresses/${editingAddressId}`, payload);
        const serverAddresses = res?.data?.addresses || res?.addresses;
        if (serverAddresses) {
          setAddresses(serverAddresses);
        } else {
          setAddresses((prev) =>
            prev.map((a) => ((a.id || a._id) === editingAddressId ? { ...a, ...payload } : a))
          );
        }
        toast.success('Address updated successfully!');
      } else {
        // Add new via backend API
        const res = await post('/auth/addresses', payload);
        const serverAddresses = res?.data?.addresses || res?.addresses;
        if (serverAddresses) {
          setAddresses(serverAddresses);
        } else {
          const newAddress = { id: `addr-${Date.now()}`, ...payload };
          setAddresses((prev) => [...prev, newAddress]);
        }
        toast.success('Address added to your account!');
      }
      setAddressModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleDeleteAddress = async (idToDelete) => {
    if (confirm('Are you sure you want to remove this delivery address?')) {
      try {
        const res = await del(`/auth/addresses/${idToDelete}`);
        const serverAddresses = res?.data?.addresses || res?.addresses;
        if (serverAddresses) {
          setAddresses(serverAddresses);
        } else {
          setAddresses((prev) => prev.filter((a) => (a.id || a._id) !== idToDelete));
        }
        toast.success('Address removed.');
      } catch (err) {
        toast.error(err.message || 'Failed to delete address.');
      }
    }
  };

  const handleSetDefaultAddress = async (idToDefault) => {
    try {
      const res = await put(`/auth/addresses/${idToDefault}/default`);
      const serverAddresses = res?.data?.addresses || res?.addresses;
      if (serverAddresses) {
        setAddresses(serverAddresses);
      } else {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: (a.id || a._id) === idToDefault }))
        );
      }
      toast.success('Default delivery address updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update default address.');
    }
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || user?.email?.split('@')[0] || 'Athlete';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header Profile Summary Banner */}
      <div className="bg-gradient-to-r from-[#0B1730] via-[#162446] to-[#2677FF] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-[#F044A5]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar Circle */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#2677FF] via-[#8157F5] to-[#F044A5] p-1 shadow-lg shrink-0">
            <div className="w-full h-full bg-[#0B1730] rounded-xl flex items-center justify-center font-heading font-black text-2xl sm:text-3xl tracking-tight text-white">
              {generateInitials(displayName)}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
                {displayName}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-sky-200 border border-white/20">
                {user?.role === 'admin' ? 'Administrator' : 'DYPULSE Athlete'}
              </span>
            </div>
            <p className="text-sm text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Student Session
              </span>
              <span>•</span>
              <span>Saved Addresses: {addresses.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabs + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-semibold text-sm transition-all duration-150 text-left ${
                activeTab === 'profile'
                  ? 'bg-[#2677FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-[#172033] hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-semibold text-sm transition-all duration-150 text-left ${
                activeTab === 'security'
                  ? 'bg-[#2677FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-[#172033] hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security & Password</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-heading font-semibold text-sm transition-all duration-150 text-left ${
                activeTab === 'addresses'
                  ? 'bg-[#2677FF] text-white shadow-md shadow-blue-500/20'
                  : 'text-[#172033] hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <div className="flex items-center justify-between flex-1">
                <span>Campus Addresses</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'addresses'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {addresses.length}
                </span>
              </div>
            </button>

            <div className="pt-2 border-t border-slate-100 mt-2">
              <Link
                to="/team-kit-studio?tab=my-requests"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all duration-150 text-left text-purple-700 bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/60"
              >
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="flex items-center justify-between flex-1">
                  <span>Team Kit Requests</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-200/80 text-purple-800 px-2 py-0.5 rounded-full">
                    Studio
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm animate-fadeIn">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h2 className="text-xl font-heading font-bold text-[#172033]">
                  Personal Information
                </h2>
                <p className="text-sm text-[#667085] mt-1">
                  Manage your name, campus identity, and contact information.
                </p>
              </div>

              <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="profile-firstName"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="profile-firstName"
                        type="text"
                        {...registerProfile('firstName')}
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all focus:outline-none focus:bg-white ${
                          profileErrors.firstName
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {profileErrors.firstName && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">
                        {profileErrors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="profile-lastName"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="profile-lastName"
                        type="text"
                        {...registerProfile('lastName')}
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all focus:outline-none focus:bg-white ${
                          profileErrors.lastName
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {profileErrors.lastName && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">
                        {profileErrors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Email (Readonly) */}
                  <div>
                    <label
                      htmlFor="profile-email"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
                    >
                      Email Address (Locked)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="profile-email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 text-slate-500 text-sm rounded-xl border border-slate-200 cursor-not-allowed select-none"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#667085]">
                      Session authenticated email cannot be modified directly.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="profile-phone"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="profile-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        {...registerProfile('phone')}
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all focus:outline-none focus:bg-white ${
                          profileErrors.phone
                            ? 'border-rose-400 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">
                        {profileErrors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-sm text-white bg-[#2677FF] hover:bg-[#1b64e0] active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
                  >
                    {profileSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm animate-fadeIn">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h2 className="text-xl font-heading font-bold text-[#172033]">
                  Security & Authentication
                </h2>
                <p className="text-sm text-[#667085] mt-1">
                  Update your account password to protect your session credentials.
                </p>
              </div>

              {securityError && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Security Update Failed</p>
                    <p className="text-xs text-rose-700 mt-0.5">{securityError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-5" noValidate>
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="sec-current"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="sec-current"
                      type={showCurrent ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      {...registerPassword('currentPassword')}
                      className={`w-full pl-10 pr-11 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all focus:outline-none focus:bg-white ${
                        passwordErrors.currentPassword
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="sec-new"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="sec-new"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters with upper, lower & number"
                      {...registerPassword('newPassword')}
                      className={`w-full pl-10 pr-11 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all focus:outline-none focus:bg-white ${
                        passwordErrors.newPassword
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="sec-confirm"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="sec-confirm"
                      type={showConfirmNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat your new password"
                      {...registerPassword('confirmNewPassword')}
                      className={`w-full pl-10 pr-11 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all focus:outline-none focus:bg-white ${
                        passwordErrors.confirmNewPassword
                          ? 'border-rose-400 focus:border-rose-500'
                          : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNew(!showConfirmNew)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordErrors.confirmNewPassword && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {passwordErrors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-semibold text-sm text-white bg-[#2677FF] hover:bg-[#1b64e0] active:scale-[0.99] transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
                  >
                    {passwordSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-heading font-bold text-[#172033]">
                    Delivery Addresses
                  </h2>
                  <p className="text-sm text-[#667085] mt-1">
                    Manage hostel rooms, campus drop points, and home addresses for checkout.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold text-xs text-white bg-[#2677FF] hover:bg-[#1b64e0] transition-colors shadow-sm self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Address List */}
              {addresses.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-heading font-bold text-lg text-[#172033]">No addresses saved yet</h3>
                  <p className="text-xs text-[#667085] mt-1 mb-5">
                    Add your hostel or campus address for 1-click checkout.
                  </p>
                  <button
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold text-xs text-white bg-[#2677FF] hover:bg-[#1b64e0]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const id = addr.id || addr._id;
                    return (
                      <div
                        key={id}
                        className={`bg-white rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
                          addr.isDefault
                            ? 'border-[#2677FF] ring-2 ring-blue-100 shadow-md'
                            : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-heading font-bold text-sm text-[#172033] flex items-center gap-2">
                              <Building className="w-4 h-4 text-slate-400" />
                              {addr.fullName}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2677FF] border border-blue-200">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#667085] space-y-1 mb-4">
                            <p className="font-medium text-[#172033]">{addr.street}</p>
                            {addr.apartment && <p>{addr.apartment}</p>}
                            <p>
                              {addr.city}, {addr.state} - {addr.zipCode}
                            </p>
                            <p className="flex items-center gap-1.5 pt-1 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{addr.phone}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(id)}
                                className="text-xs text-[#2677FF] hover:underline font-medium"
                              >
                                Set as default
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#2677FF] hover:bg-slate-50 transition-colors"
                              aria-label="Edit address"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              aria-label="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Address Modal Dialog */}
              {addressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
                  <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                      <h3 className="font-heading font-bold text-lg text-[#172033]">
                        {editingAddressId ? 'Edit Delivery Address' : 'Add New Campus Address'}
                      </h3>
                      <button
                        onClick={() => setAddressModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSubmitAddress(onAddressSubmit)} className="space-y-4" noValidate>
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1">
                          Recipient Full Name
                        </label>
                        <input
                          type="text"
                          {...registerAddress('fullName')}
                          placeholder="Alex Rivera"
                          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] focus:bg-white"
                        />
                        {addressErrors.fullName && (
                          <p className="mt-1 text-xs text-rose-600">{addressErrors.fullName.message}</p>
                        )}
                      </div>

                      {/* Street / Hostel Room */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1">
                          Street Address / Room & Hostel
                        </label>
                        <input
                          type="text"
                          {...registerAddress('street')}
                          placeholder="Hostel B, Room 204 or Sector 7"
                          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] focus:bg-white"
                        />
                        {addressErrors.street && (
                          <p className="mt-1 text-xs text-rose-600">{addressErrors.street.message}</p>
                        )}
                      </div>

                      {/* Apartment / Landmark */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1">
                          Campus Name / Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          {...registerAddress('apartment')}
                          placeholder="Near North Gate / Sports Complex"
                          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] focus:bg-white"
                        />
                      </div>

                      {/* City & State */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            {...registerAddress('city')}
                            placeholder="Navi Mumbai"
                            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] focus:bg-white"
                          />
                          {addressErrors.city && (
                            <p className="mt-1 text-xs text-rose-600">{addressErrors.city.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            {...registerAddress('state')}
                            placeholder="Maharashtra"
                            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] focus:bg-white"
                          />
                          {addressErrors.state && (
                            <p className="mt-1 text-xs text-rose-600">{addressErrors.state.message}</p>
                          )}
                        </div>
                      </div>

                      {/* PIN & Phone */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1">
                            Postal / PIN Code
                          </label>
                          <input
                            type="text"
                            {...registerAddress('zipCode')}
                            placeholder="400706"
                            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] focus:bg-white"
                          />
                          {addressErrors.zipCode && (
                            <p className="mt-1 text-xs text-rose-600">{addressErrors.zipCode.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            {...registerAddress('phone')}
                            placeholder="+91 98765 43210"
                            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-[#2677FF] focus:bg-white"
                          />
                          {addressErrors.phone && (
                            <p className="mt-1 text-xs text-rose-600">{addressErrors.phone.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Default checkbox */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          id="isDefault"
                          type="checkbox"
                          {...registerAddress('isDefault')}
                          className="w-4 h-4 rounded text-[#2677FF] focus:ring-[#2677FF] border-slate-300"
                        />
                        <label htmlFor="isDefault" className="text-xs text-[#172033] font-medium">
                          Set as default delivery address
                        </label>
                      </div>

                      {/* Buttons */}
                      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setAddressModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addressSubmitting}
                          className="px-5 py-2.5 rounded-xl font-heading font-semibold text-xs text-white bg-[#2677FF] hover:bg-[#1b64e0] shadow-md shadow-blue-500/20 disabled:opacity-60"
                        >
                          {addressSubmitting ? 'Saving Address...' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
