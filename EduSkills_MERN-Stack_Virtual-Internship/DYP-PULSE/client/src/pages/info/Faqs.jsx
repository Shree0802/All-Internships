import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Truck, RotateCcw, Award, ShieldCheck } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    title: 'Hostel Deliveries & Shipping',
    icon: Truck,
    items: [
      {
        q: 'How does hostel doorstep delivery work?',
        a: 'When placing your order, specify your Hostel Block and Room Number in the delivery address. Our campus runners coordinate with university security desks to ensure your parcel reaches your hostel wing directly.',
      },
      {
        q: 'What is the standard delivery timeframe?',
        a: 'Standard orders within campus zones arrive in 1 to 3 business days. Customized Team Kits require 5 to 7 days for sublimation and printing.',
      },
      {
        q: 'Are delivery charges applicable?',
        a: 'Direct campus shipping is FREE on all orders of ₹1,000 or above. For orders under ₹1,000, a flat ₹99 university delivery fee applies.',
      },
    ],
  },
  {
    title: 'Exchanges & Size Swaps',
    icon: RotateCcw,
    items: [
      {
        q: 'What is your size exchange policy?',
        a: 'We offer an easy 7-day swap window for unused apparel, footwear, and equipment with original tags attached. Simply submit an exchange request through your Account orders page.',
      },
      {
        q: 'Can customized Team Kits be returned or exchanged?',
        a: 'Customized jerseys featuring individualized names and numbers cannot be returned unless there is an evident manufacturing defect or printing error.',
      },
    ],
  },
  {
    title: 'Team Kit Studio & Customization',
    icon: Award,
    items: [
      {
        q: 'What is the minimum order quantity for Team Kits?',
        a: 'The minimum order quantity for custom sublimated jerseys is 10 kits. We accommodate single-piece reorders for new squad additions later in the tournament season.',
      },
      {
        q: 'Can we include college logos and tournament sponsors?',
        a: 'Yes! Vector crests, university emblems, and sponsor artwork can be printed seamlessly onto the breathable poly-mesh fabric.',
      },
    ],
  },
  {
    title: 'Authentication & Security',
    icon: ShieldCheck,
    items: [
      {
        q: 'How are student accounts secured on DYPULSE?',
        a: 'DYPULSE operates on pure server-side session management with HttpOnly, SameSite cookies. Your session tokens are never stored in unprotected localStorage, providing robust security on shared campus lab computers.',
      },
      {
        q: 'What payment methods are supported at checkout?',
        a: 'We support Cash on Campus Delivery (COD) as well as instant UPI transfers (GPay, PhonePe, Paytm, BHIM) upon delivery verification.',
      },
    ],
  },
];

export default function Faqs() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (secIdx, itemIdx) => {
    const key = `${secIdx}-${itemIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2677FF] text-xs font-bold uppercase tracking-wider mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Knowledgebase</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#172033]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-[#667085] mt-2">
          Everything you need to know about campus shopping, tournament kits, and deliveries.
        </p>
      </div>

      <div className="space-y-8">
        {FAQ_SECTIONS.map((sec, secIdx) => {
          const Icon = sec.icon;
          return (
            <div key={sec.title} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2677FF] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="font-heading font-bold text-base text-[#172033]">
                  {sec.title}
                </h2>
              </div>

              <div className="space-y-3">
                {sec.items.map((item, itemIdx) => {
                  const key = `${secIdx}-${itemIdx}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div
                      key={item.q}
                      className="border border-slate-100 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => toggleItem(secIdx, itemIdx)}
                        className="w-full text-left p-4 flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-heading font-bold text-xs text-[#172033]">
                          {item.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#2677FF]' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white text-xs text-[#667085] leading-relaxed border-t border-slate-100 animate-fadeIn">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
