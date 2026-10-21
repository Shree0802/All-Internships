import React from 'react';
import { ShieldCheck, Lock, Eye, Server } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Student Data Integrity</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#172033]">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#667085] mt-2">
          Effective Date: Academic Year 2026–2027 • Last updated October 2026
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 text-xs text-[#667085] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-heading font-bold text-[#172033] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#2677FF]" />
            <span>1. Session Management & Cookies</span>
          </h2>
          <p>
            DYPULSE implements robust server-side session authentication. Upon sign-in, an encrypted session ID is stored within MongoDB and transmitted solely through a secure, HttpOnly, SameSite browser cookie. We do not store raw authorization tokens in web localStorage, protecting your session on shared college computers and library workstations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-heading font-bold text-[#172033] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#8157F5]" />
            <span>2. Information We Collect</span>
          </h2>
          <p>
            To process your orders and facilitate hostel deliveries, we gather basic identity information: your student name, verified email address, contact phone number, and campus hostel room address. We never fabricate testimonials or inflate customer metrics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-heading font-bold text-[#172033] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#F044A5]" />
            <span>3. Third-Party Integrations</span>
          </h2>
          <p>
            When product imagery is updated, assets are stored in production Cloudinary CDN buckets with strict access controls. Database records reside on secure MongoDB Atlas clusters protected by IP whitelisting and encrypted connections.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-heading font-bold text-[#172033]">
            4. Data Retention & Deletion
          </h2>
          <p>
            You may request deletion of your account, saved addresses, and active wishlist at any time by contacting support@dypulse.edu. Order records required for statutory audit and university financial reconciliation are preserved as required by campus e-commerce regulations.
          </p>
        </section>
      </div>
    </div>
  );
}
