import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { post } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) {
      toast.error('Please enter your university email address.');
      return;
    }

    setLoading(true);
    try {
      await post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
      toast.success('Password reset instructions dispatched.');
    } catch (err) {
      setErrorMessage(err.message || 'Unable to process reset request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 w-full">
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2677FF] flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-[#172033]">
            Reset Campus Password
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Enter the email address registered with your DYPULSE student session.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="font-heading font-bold text-sm text-emerald-950">
              Reset Instructions Dispatched
            </h2>
            <p className="text-xs text-emerald-700 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, you will receive password reset instructions with a secure link shortly.
            </p>
            <div className="pt-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-[#172033] mb-1.5">
                University Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-xs text-[#172033] rounded-xl focus:outline-none focus:border-[#2677FF] focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {loading ? 'Transmitting Reset Key...' : 'Send Password Reset Key'}
            </button>

            <div className="pt-4 text-center border-t border-slate-100">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2677FF] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Campus Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
