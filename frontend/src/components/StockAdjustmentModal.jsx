import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  Sliders,
  Package,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  onSaveAdjustment,
  materials = [],
}) {
  const [selectedMaterialName, setSelectedMaterialName] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' | 'reduce'
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Audit Physical Count Correction');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentMaterial = materials.find((m) => m.name === selectedMaterialName) || materials[0] || null;

  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialName) {
      setSelectedMaterialName(materials[0].name);
    }
  }, [materials, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableStock = currentMaterial ? currentMaterial.availableQuantity : 0;
  const unit = currentMaterial ? currentMaterial.unit : 'Units';

  const handleQtyChange = (val) => {
    setQuantity(val);
    const num = parseFloat(val) || 0;
    if (adjustmentType === 'reduce' && num > availableStock) {
      setErrorMsg(`Cannot reduce more than current available stock (${availableStock} ${unit}).`);
    } else if (num <= 0 && val !== '') {
      setErrorMsg('Adjustment quantity must be greater than zero.');
    } else {
      setErrorMsg('');
    }
  };

  const handleTypeChange = (type) => {
    setAdjustmentType(type);
    const num = parseFloat(quantity) || 0;
    if (type === 'reduce' && num > availableStock) {
      setErrorMsg(`Cannot reduce more than current available stock (${availableStock} ${unit}).`);
    } else {
      setErrorMsg('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseFloat(quantity) || 0;
    if (qty <= 0) {
      setErrorMsg('Please specify a valid quantity.');
      return;
    }

    if (adjustmentType === 'reduce' && qty > availableStock) {
      setErrorMsg(`Cannot reduce by ${qty} ${unit}! Current stock is only ${availableStock} ${unit}.`);
      return;
    }

    const netAdjustment = adjustmentType === 'add' ? qty : -qty;

    onSaveAdjustment({
      materialId: currentMaterial.id,
      materialName: currentMaterial.name,
      category: currentMaterial.category,
      unit: unit,
      adjustmentQuantity: netAdjustment,
      rawQuantity: qty,
      adjustmentType: adjustmentType,
      reason: reason,
      date: date,
      refNo: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: remarks || reason,
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
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
          >
            {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 via-white to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-100/70 border border-purple-200 text-purple-700 flex items-center justify-center shadow-xs shrink-0">
              <Sliders size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Stock Adjustment</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Audit & Correction
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reconcile physical stock counts, report damage or record returns.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* Select Material */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Select Material <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedMaterialName}
                onChange={(e) => setSelectedMaterialName(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
              >
                {materials.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} (Current: {m.availableQuantity} {m.unit})
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Adjustment Action Toggle */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Adjustment Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('add')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  adjustmentType === 'add'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                + Increase Stock (Surplus / Return)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('reduce')}
                className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                  adjustmentType === 'reduce'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                - Reduce Stock (Damage / Loss / Defect)
              </button>
            </div>
          </div>

          {/* Quantity & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Adjustment Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="e.g. 5"
                  value={quantity}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                    errorMsg ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-purple-500/20'
                  }`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Adjustment Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Reason for Adjustment <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
              >
                <option value="Audit Physical Count Correction">Audit Physical Count Correction</option>
                <option value="Rain / Water Damage Loss">Rain / Water Damage Loss</option>
                <option value="Breakage / Cement Bag Tear">Breakage / Cement Bag Tear</option>
                <option value="Site Surplus Material Return">Site Surplus Material Return</option>
                <option value="Supplier Replacement Delivery">Supplier Replacement Delivery</option>
                <option value="Other Discrepancy Correction">Other Discrepancy Correction</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Error Warning */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertTriangle size={15} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview */}
          {!errorMsg && quantity && parseFloat(quantity) > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-200/70 rounded-xl flex items-center justify-between">
              <span className="font-semibold text-purple-900">New Available Stock will be:</span>
              <span className="text-sm font-extrabold text-purple-800">
                {(
                  availableStock + (adjustmentType === 'add' ? parseFloat(quantity) : -parseFloat(quantity))
                ).toFixed(1)}{' '}
                {unit}
              </span>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Audit Notes / Signature</label>
            <textarea
              rows={2}
              placeholder="e.g. Verified by Store Manager during monthly physical count..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(errorMsg) || !quantity}
              className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                Boolean(errorMsg) || !quantity
                  ? 'bg-slate-300 shadow-none cursor-not-allowed text-slate-500'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25'
              }`}
            >
              <Save size={15} />
              <span>Confirm Adjustment</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}

