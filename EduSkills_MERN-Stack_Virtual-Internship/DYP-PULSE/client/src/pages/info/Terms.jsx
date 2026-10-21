import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2677FF] text-xs font-bold uppercase tracking-wider mb-3">
          <FileText className="w-3.5 h-3.5" />
          <span>Campus Commerce Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#172033]">
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#667085] mt-2">
          Governing purchases, hostel deliveries, and varsity equipment on the DYPULSE platform.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 text-xs text-[#667085] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-heading font-bold text-[#172033] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>1. Account Eligibility</span>
          </h2>
          <p>
            DYPULSE is accessible to university students, faculty, collegiate tournament participants, and sports enthusiasts. By establishing an account, you represent that the contact information and campus hostel room details provided are accurate and current.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-heading font-bold text-[#172033] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#2677FF]" />
            <span>2. Orders & Campus Delivery Guidelines</span>
          </h2>
          <p>
            Delivery timeframes are estimates based on campus security protocols and hostel reception hours. Deliveries are typically completed within 1 to 3 days for in-stock catalog products. For Cash on Delivery (COD) orders, full payment must be handed over or transmitted via authorized UPI QR codes upon parcel presentation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-heading font-bold text-[#172033] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>3. Team Kit Studio Specifications</span>
          </h2>
          <p>
            Customized sports jerseys and athletic apparel produced with individualized player names, squad numbers, and collegiate crests represent bespoke manufacturing. Once artwork and sizing rosters are finalized with our team kit director, modifications or cancellations are subject to materials already committed.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-heading font-bold text-[#172033]">
            4. Product Authenticity & Warranty
          </h2>
          <p>
            All cricket bats, tournament balls, racquets, and footwear distributed through DYPULSE are 100% genuine varsity merchandise. Equipment warranties apply as designated by respective original manufacturers against manufacturing faults.
          </p>
        </section>
      </div>
    </div>
  );
}
