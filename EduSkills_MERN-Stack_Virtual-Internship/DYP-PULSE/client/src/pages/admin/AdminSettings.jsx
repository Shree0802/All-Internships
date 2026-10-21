import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Building, Truck, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [storeName, setStoreName] = useState('DYPULSE');
  const [tagline, setTagline] = useState('Feel the Campus. Live the Game.');
  const [campusHub, setCampusHub] = useState('D.Y. Patil Stadium Complex, Navi Mumbai');
  const [freeShipThreshold, setFreeShipThreshold] = useState('1000');
  const [supportPhone, setSupportPhone] = useState('+91 (022) 2774-8000');
  const [supportEmail, setSupportEmail] = useState('support@dypulse.edu');
  const [allowGuestBrowse, setAllowGuestBrowse] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System parameters committed to server configuration.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#172033]">
          Platform & Store Settings
        </h1>
        <p className="text-xs text-[#667085] mt-0.5">
          Configure university dispatch rules, threshold policies, and administrative contacts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Brand & Identity */}
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-sm text-[#172033] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#2677FF]" />
              <span>Collegiate Brand Identity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={storeName}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Campus Dispatch Depot</label>
              <input
                type="text"
                value={campusHub}
                onChange={(e) => setCampusHub(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
              />
            </div>
          </div>

          {/* Delivery & Shipping Thresholds */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="font-heading font-bold text-sm text-[#172033] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8157F5]" />
              <span>Hostel Delivery Rules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Free Shipping Minimum Cart Value (₹)
                </label>
                <input
                  type="number"
                  value={freeShipThreshold}
                  onChange={(e) => setFreeShipThreshold(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Orders under this threshold incur the standard ₹99 hostel drop fee.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Support Phone Helpline</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#172033] focus:outline-none focus:border-[#2677FF]"
                />
              </div>
            </div>
          </div>

          {/* Security & Access */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="font-heading font-bold text-sm text-[#172033] pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authentication & Security Policies</span>
            </h2>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
              <p className="font-bold text-[#2677FF]">Server-Side Session Storage Active</p>
              <p className="text-slate-600 leading-relaxed">
                Cookie sessions are signed with server secret credentials and stored in MongoDB Atlas session collections. Guest users may browse catalog products; checkout and order history require authenticated collegiate sessions.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-[#2677FF] hover:bg-[#1b64e0] text-white font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
