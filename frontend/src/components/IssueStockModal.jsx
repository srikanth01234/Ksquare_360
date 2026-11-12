import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  ArrowUpRight,
  Package,
  Building2,
  Calendar,
  User,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Send,
} from 'lucide-react';

export default function IssueStockModal({
  isOpen,
  onClose,
  onIssueStock,
  materials = [],
  initialMaterial = null,
  sites = [
    { code: 'KS-001', name: 'Green Villa', location: 'Chennai' },
    { code: 'KS-002', name: 'Office Renovation', location: 'Madurai' },
    { code: 'KS-004', name: 'RK Residence', location: 'Tirunelveli' },
    { code: 'KS-005', name: 'Metro Apartment', location: 'Chennai' },
  ],
}) {
  const [selectedMaterialName, setSelectedMaterialName] = useState('');
  const [siteCode, setSiteCode] = useState('KS-001');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [issuedTo, setIssuedTo] = useState('Site Supervisor');
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected material record
  const currentMaterial =
    materials.find((m) => m.name === selectedMaterialName) || materials[0] || null;

  useEffect(() => {
    if (isOpen) {
      if (initialMaterial) {
        setSelectedMaterialName(initialMaterial.name);
      } else if (materials.length > 0 && !selectedMaterialName) {
        setSelectedMaterialName(materials[0].name);
      }
      setErrorMsg('');
      setQuantity('');
    }
  }, [materials, isOpen, initialMaterial]);

  if (!isOpen) return null;

  const availableStock = currentMaterial ? currentMaterial.availableQuantity : 0;
  const unit = currentMaterial ? currentMaterial.unit : 'Units';

  const handleQuantityChange = (val) => {
    setQuantity(val);
    const num = parseFloat(val) || 0;
    if (num > availableStock) {
      setErrorMsg(
        `Cannot issue ${num} ${unit}! Maximum available stock in godown is ${availableStock} ${unit}.`
      );
    } else if (num <= 0 && val !== '') {
      setErrorMsg('Quantity must be greater than zero.');
    } else {
      setErrorMsg('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 0;

    if (!currentMaterial) {
      setErrorMsg('Please select a material.');
      return;
    }

    if (qty <= 0) {
      setErrorMsg('Please enter a valid quantity.');
      return;
    }

    if (qty > availableStock) {
      setErrorMsg(
        `Cannot issue ${qty} ${unit}! Maximum available stock is ${availableStock} ${unit}.`
      );
      return;
    }

    const selectedSite = sites.find((s) => s.code === siteCode) || sites[0];

    onIssueStock({
      materialId: currentMaterial.id,
      materialName: currentMaterial.name,
      category: currentMaterial.category,
      quantity: qty,
      unit: unit,
      siteName: selectedSite.name,
      siteCode: selectedSite.code,
      projectLabel: `${selectedSite.name} (${selectedSite.code})`,
      date: issueDate,
      issuedTo: issuedTo || 'Site Incharge',
      remarks: remarks || `Dispatched to ${selectedSite.name}`,
    });

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
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
          >
            {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shadow-xs shrink-0">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Issue Stock (Outward)</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Transfer to Site
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue materials from godown to an active site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Simple Form (Essential Fields Only) */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 text-xs">
          {/* Material Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Material to Issue <span className="text-rose-500">*</span>
              </label>
              <span className={`text-[11px] font-black ${availableStock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                In Stock: {availableStock} {unit}
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedMaterialName}
                onChange={(e) => setSelectedMaterialName(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                {materials.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} ({m.availableQuantity} {m.unit} available)
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Construction Site & Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Destination Site <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={siteCode}
                  onChange={(e) => setSiteCode(e.target.value)}
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                >
                  {sites.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Quantity to Issue */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Quantity to Issue <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                max={availableStock}
                required
                placeholder={`Max ${availableStock}`}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={`w-full pl-3.5 pr-14 py-2.5 bg-white border rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 shadow-2xs ${
                  errorMsg
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-600 pointer-events-none">
                {unit}
              </span>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in duration-150">
              <AlertTriangle size={15} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Remaining Stock Preview */}
          {!errorMsg && quantity && parseFloat(quantity) > 0 && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-blue-800 font-semibold">
                <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                <span>Ready to dispatch</span>
              </div>
              <div className="text-blue-900 font-bold">
                Remaining:{' '}
                <span className="font-black text-blue-700">
                  {(availableStock - parseFloat(quantity)).toFixed(1)} {unit}
                </span>
              </div>
            </div>
          )}

          {/* Receiver / Site Incharge (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Issued To / Receiver <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Muthu (Site Supervisor)"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Remarks / Purpose (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Remarks / Purpose <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. For foundation casting / column work..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none shadow-2xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(errorMsg) || !quantity}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                Boolean(errorMsg) || !quantity
                  ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
                  : 'bg-[#0072ff] hover:bg-blue-600 shadow-blue-500/20'
              }`}
            >
              <Send size={15} />
              <span>Confirm & Issue</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}
