import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  Circle,
  X,
} from 'lucide-react';

export default function AddClientModal({ isOpen, onClose, onSaveClient }) {
  const [formData, setFormData] = useState({
    type: 'Individual', // 'Individual' | 'Company'
    name: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    gst: '',
    remarks: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const initials = formData.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    const newClient = {
      id: Date.now().toString(),
      initials: initials || 'CL',
      name: formData.name,
      type: formData.type,
      phone: formData.phone ? `+91 ${formData.phone}` : '+91 98765 43210',
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      location: formData.city ? `${formData.city}, TN` : 'Chennai, TN',
      projects: '1 Project',
      status: 'Active',
    };

    onSaveClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header with Villa Banner */}
        <div className="relative flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-white overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Add Client</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create a new client / customer profile.
              </p>
            </div>
          </div>

          <div className="w-28 h-16 rounded-xl overflow-hidden shadow-xs shrink-0 hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80"
              alt="Building Architecture"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Client Information */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold">
              <User size={13} />
              <span>Client Information</span>
            </div>

            {/* Client Type Radio */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Client Type <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setFormData({ ...formData, type: 'Individual' })}
                  className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.type === 'Individual'
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {formData.type === 'Individual' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white" />
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                  <span>Individual</span>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, type: 'Company' })}
                  className={`flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    formData.type === 'Company'
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {formData.type === 'Company' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white" />
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                  <span>Company</span>
                </div>
              </div>
            </div>

            {/* Client Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter client name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">
                    +91
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Details */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold">
              <MapPin size={13} />
              <span>Address Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Address Line 1 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="House No. / Building / Street"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Address Line 2
                </label>
                <input
                  type="text"
                  placeholder="Area / Landmark (Optional)"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  State <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="">Select state</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  PIN Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter PIN code"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Additional Details */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold">
              <FileText size={13} />
              <span>Additional Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  GST No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter GST number"
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Remarks
                </label>
                <input
                  type="text"
                  placeholder="Any notes about the client"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20"
            >
              <Save size={15} />
              <span>Save Client</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

