import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Zap,
  ShieldCheck,
  ShoppingBag,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login, isAuthenticated, loading: authLoading } = useAuth();
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err.message || 'Login failed. Please verify your campus email and password.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#F5F7FA] px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Brand Panel (hidden on mobile, visible on lg) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0B1730] via-[#8157F5] to-[#2677FF] text-white relative overflow-hidden">
          {/* Ambient decorative elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-[#F044A5]/20 blur-3xl pointer-events-none" />

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
              <Flame className="w-3.5 h-3.5 text-[#FF7849]" />
              <span>Collegiate Athletics & Streetwear</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-heading font-extrabold tracking-tight text-white leading-tight">
              Feel the Campus. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-pink-200">
                Live the Game.
              </span>
            </h1>

            <p className="mt-4 text-sm text-slate-200 leading-relaxed max-w-sm">
              Your official hub for premium campus gear, authentic university sports kits, and heavyweight lifestyle drops.
            </p>
          </div>

          {/* Feature list */}
          <div className="relative z-10 space-y-4 py-8">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Zap className="w-4 h-4 text-[#FF7849]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Direct Hostel Delivery</p>
                <p className="text-slate-300">Fast doorstep deliveries right to college premises</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Pure Session Security</p>
                <p className="text-slate-300">Encrypted server sessions keeping your student data safe</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <ShoppingBag className="w-4 h-4 text-sky-300" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Exclusive Member Drops</p>
                <p className="text-slate-300">Early access to tournament jerseys and campus hoodies</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-[11px] text-slate-300/80">
            © {new Date().getFullYear()} DYPULSE. Designed for student athletes & college culture.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
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

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#172033] tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-[#667085] mt-1.5">
              Sign in to manage your orders, saved addresses, and bag.
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
                <p className="font-semibold">Authentication Error</p>
                <p className="text-xs text-rose-700 mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#172033] mb-2"
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
                  placeholder="athlete@campus.edu"
                  className={`w-full pl-10 pr-4 py-3 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-200 focus:border-[#2677FF] focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-rose-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#172033]"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#2677FF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-3 bg-[#F5F7FA] text-[#172033] text-sm rounded-xl border transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white ${
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
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-rose-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-6 rounded-xl font-heading font-semibold text-sm text-white bg-[#2677FF] hover:bg-[#1b64e0] active:scale-[0.99] transition-all duration-150 shadow-md shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                    role="status"
                    aria-label="Signing in..."
                  />
                  <span>Signing in to session...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-[#667085]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#2677FF] hover:text-[#1b64e0] hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
