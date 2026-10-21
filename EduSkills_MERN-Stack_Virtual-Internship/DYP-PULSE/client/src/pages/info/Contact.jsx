import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order & Delivery Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please complete all contact fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Your message has been received! Our support team will respond shortly.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#172033]">
          Campus Support Desk
        </h1>
        <p className="text-xs text-[#667085] mt-2">
          Have questions about your hostel order, team kit customization, or product sizing? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2677FF] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#172033]">Hostel Delivery Helpline</h3>
              <p className="text-xs text-[#667085] mt-0.5">+91 (022) 2774-8000</p>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Mon–Sat, 9 AM – 8 PM
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8157F5] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#172033]">Campus Email Desk</h3>
              <p className="text-xs text-[#667085] mt-0.5">support@dypulse.edu</p>
              <p className="text-[11px] text-slate-400 mt-1">Average reply in 2 hours</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#F044A5] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#172033]">Depot & Varsity Lab</h3>
              <p className="text-xs text-[#667085] mt-0.5">
                D.Y. Patil Stadium Complex, Sector 7, Nerul, Navi Mumbai 400706
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-heading font-bold text-base text-emerald-950">Inquiry Dispatched!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you for contacting DYPULSE Support. A representative from our campus operations desk will reach out to <strong>{email}</strong> shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sameer Kulkarni"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-1.5">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#172033]"
                >
                  <option value="Order & Delivery Inquiry">Order & Hostel Delivery Inquiry</option>
                  <option value="Team Kit Bulk Order">Team Kit Studio Quotation</option>
                  <option value="Returns & Size Swaps">Returns & Size Exchange</option>
                  <option value="Campus Partnership">College Sports Committee Partnership</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help your campus sporting journey?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Support Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
