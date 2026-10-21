import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Trophy,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register: registerUser, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, from]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const passwordValue = watch('password', '');

  // Password strength calculation
  const strength = useMemo(() => {
    if (!passwordValue) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[a-z]/.test(passwordValue)) score += 1;
    if (/\d/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-[#F044A5]', text: 'text-[#F044A5]' };
    if (score === 3) return { score: 2, label: 'Fair', color: 'bg-[#FF7849]', text: 'text-[#FF7849]' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-[#2677FF]', text: 'text-[#2677FF]' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [passwordValue]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      if (err.status === 409) {
        setServerError('An account with this email already exists. Please sign in or use another email.');
      } else {
        setServerError(
          err.message || 'Registration failed. An account with this email may already exist.'
        );
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#F5F7FA] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Brand Panel (hidden on mobile, visible on lg) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0B1730] via-[#8157F5] to-[#2677FF] text-white relative overflow-hidden">
          {/* Ambient decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#F044A5]/25 blur-3xl pointer-events-none" />

          {/* Brand header */}
          <div className="relative z-10">
            <Link to="/" className="inline-block group mb-8 focus:outline-none" aria-label="DYPULSE Home">
              <div className="bg-white rounded-2xl px-4 py-2 shadow-lg border border-white/20 inline-flex items-center transition-all group-hover:scale-105">
                <img
                  src="/dypulse-logo.png"
                  alt="DYPULSE"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <span className="sr-only">DY PULSE</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#2677FF]" />
              <span>Join the Campus Movement</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-heading font-extrabold tracking-tight text-white leading-tight">
              Gear Up for the Game. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-pink-200">
                Own the Street.
              </span>
            </h1>

            <p className="mt-4 text-sm text-slate-200 leading-relaxed max-w-sm">
              Create your DYPULSE account to unlock student athlete perks, direct campus delivery, and priority access to limited edition drops.
            </p>
          </div>

          {/* Member perks */}
          <div className="relative z-10 space-y-4 py-8">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Trophy className="w-4 h-4 text-[#FF7849]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Official Varsity Drops</p>
                <p className="text-slate-300">Authentic jerseys, shorts, and activewear for collegiate sports</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Campus Order Tracking</p>
                <p className="text-slate-300">Track shipments live from warehouse to your hostel door</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Secure Student Session</p>
                <p className="text-slate-300">Protected cookie-based session with zero token leakage</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-[11px] text-slate-300/80">
            By signing up, you agree to DYPULSE Terms of Service and Campus Code.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-12 lg:p-12 flex flex-col justify-center">
          {/* Mobile Brand Link */}
          <div className="lg:hidden mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1 group">
              <span className="font-heading font-black text-2xl tracking-tighter text-[#0B1730]">
                DY
              </span>
              <span className="font-heading font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#2677FF] to-[#8157F5]">
                PULSE
              </span>
              <span className="w-2 h-2 rounded-full bg-[#2677FF] ml-0.5" />
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#172033] tracking-tight">
              Create an account
            </h2>
            <p className="text-sm text-[#667085] mt-1.5">
              Enter your details below to become a member of DYPULSE.
            </p>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm animate-fadeIn"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Registration Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name fields row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5"
                >
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    {...register('firstName')}
                    placeholder="Alex"
                    className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                      errors.firstName
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p id="firstName-error" className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5"
                >
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    {...register('lastName')}
                    placeholder="Rivera"
                    className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                      errors.lastName
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p id="lastName-error" className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5"
              >
                Campus / Personal Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                  placeholder="alex.rivera@campus.edu"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby="password-requirements"
                  {...register('password')}
                  placeholder="At least 8 characters"
                  className={`w-full pl-10 pr-11 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>

              {/* Password strength bar */}
              {passwordValue && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#667085]">Password Strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          strength.score >= step ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <p id="password-requirements" className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  {...register('confirmPassword')}
                  placeholder="Repeat your password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                    errors.confirmPassword
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 py-3.5 px-6 rounded-xl font-heading font-semibold text-sm text-white bg-[#2677FF] hover:bg-[#1b64e0] active:scale-[0.99] transition-all duration-150 shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    role="status"
                    aria-label="Creating account..."
                  />
                  <span>Creating student session...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-sm text-[#667085]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#2677FF] hover:text-[#1b64e0] hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
