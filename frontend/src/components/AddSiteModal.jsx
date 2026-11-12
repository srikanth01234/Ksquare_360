import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  Layers,
  Building2,
  Home,
  CheckCircle2,
  Circle,
  User,
  ChevronDown,
  Phone,
  FileEdit,
  MapPin,
  Calendar,
  IndianRupee,
  Plus,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

// Structured Project Code Generator (e.g. CHN-11-2026-NB-01 or CHN-11-2026-RE-01)
const generateStructuredProjectCode = (city = 'Chennai', projectType = 'New Building') => {
  const cityMap = {
    Chennai: 'CHN',
    Madurai: 'MDU',
    Tirunelveli: 'TNV',
    Coimbatore: 'CBE',
    Salem: 'SLM',
    Trichy: 'TRY',
  };
  const cityCode = cityMap[city] || (city ? city.slice(0, 3).toUpperCase() : 'CHN');
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  // Strictly 'NB' for New Building or 'RE' for Renovation
  const catCode = projectType === 'Renovation' ? 'RE' : 'NB';
  const runningNumber = String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');
  return `${cityCode}-${month}-${year}-${catCode}-${runningNumber}`;
};

export default function AddSiteModal({ isOpen, onClose, onAddSite }) {
  const [projectType, setProjectType] = useState('New Building');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    client: '',
    contact: '',
    description: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    startDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    budget: '',
    status: 'Active', // 'Active' | 'Completed' | 'On Hold'
  });

  // Auto-generate structured project code on modal open or when city/projectType changes
  useEffect(() => {
    if (isOpen) {
      const autoCode = generateStructuredProjectCode(formData.city, projectType);
      setFormData((prev) => ({
        ...prev,
        code: prev.code || autoCode,
        status: prev.status || 'Active',
      }));
    }
  }, [isOpen]);

  const handleRegenerateCode = () => {
    const freshCode = generateStructuredProjectCode(formData.city, projectType);
    setFormData((prev) => ({ ...prev, code: freshCode }));
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const finalCode =
      formData.code || generateStructuredProjectCode(formData.city, projectType);

    const newSite = {
      id: Date.now().toString(),
      code: finalCode,
      name: formData.name,
      client: formData.client || 'Client',
      contact: formData.contact || '',
      type: projectType,
      location: formData.city || 'Chennai',
      address: formData.address || '',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      expectedDate: formData.completionDate || '',
      budget: formData.budget ? `₹${formData.budget}` : '₹10,00,000',
      progress: formData.status === 'Completed' ? 100 : formData.status === 'On Hold' ? 30 : 15,
      status: formData.status || 'Active',
    };

    onAddSite(newSite);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
          >
            {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Project</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create a new construction project and start managing materials, labour, expenses and updates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Project Type */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 tracking-tight">
              <Layers size={14} className="text-slate-600" />
              <span>Project Type <span className="text-rose-500">*</span></span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: New Building */}
              <div
                onClick={() => setProjectType('New Building')}
                className={`relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                  projectType === 'New Building'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    projectType === 'New Building'
                      ? 'bg-emerald-100/70 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Building2 size={24} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">New Building</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Construction of a new property
                  </div>
                </div>
                {projectType === 'New Building' ? (
                  <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-600 text-white" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>

              {/* Option 2: Renovation */}
              <div
                onClick={() => setProjectType('Renovation')}
                className={`relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                  projectType === 'Renovation'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    projectType === 'Renovation'
                      ? 'bg-emerald-100/70 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Home size={24} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">Renovation</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Modification or improvement of an existing property
                  </div>
                </div>
                {projectType === 'Renovation' ? (
                  <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-600 text-white" />
                ) : (
                  <Circle size={20} className="text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Project Information */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <Building2 size={13} />
              <span>Project Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Villa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Project Code <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                    title="Auto-generate structured project code"
                  >
                    <RefreshCw size={10} />
                    <span>Auto Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. CHN-11-2026-N03-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                    Auto
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format: City-MM-YYYY-Category-RunningNo (e.g. CHN-11-2026-N03-01)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Select or add client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Description (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <FileEdit size={14} />
                  </div>
                  <textarea
                    rows={1}
                    placeholder="Add project notes, scope or special instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Address Details */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <MapPin size={13} />
              <span>Address Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={1}
                  placeholder="Enter complete address (House No., Street, Area, Landmark, etc.)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-8"
                  >
                    <option value="">Select City</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Madurai">Madurai</option>
                    <option value="Trichy">Trichy</option>
                    <option value="Tirunelveli">Tirunelveli</option>
                    <option value="Coimbatore">Coimbatore</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-8"
                  >
                    <option value="">Select State</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                PIN Code
              </label>
              <input
                type="text"
                placeholder="e.g. 629001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Project Plan */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <Calendar size={13} />
              <span>Project Plan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={14} />
                  </div>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expected Completion <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar size={14} />
                  </div>
                  <input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estimated Budget <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="font-bold text-xs">₹</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 25,00,000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Site Status <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-8"
                  >
                    <option value="Active">Active (Ongoing construction)</option>
                    <option value="Completed">Completed (Work finished)</option>
                    <option value="On Hold">On Hold (Temporarily stopped)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Project</span>
            </button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

