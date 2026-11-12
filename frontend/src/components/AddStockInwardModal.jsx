import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  ArrowDownLeft,
  Package,
  Calendar,
  ChevronDown,
  Layers,
  Save,
  Plus,
} from 'lucide-react';

export default function AddStockInwardModal({
  isOpen,
  onClose,
  onSaveInward,
  materials = [],
  categories = [],
  initialMaterial = null,
}) {
  const [formData, setFormData] = useState({
    materialName: '',
    isNewMaterial: false,
    newMaterialName: '',
    category: 'Cement',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'Bags',
    remarks: '',
  });

  // Set pre-selected or default material on open
  useEffect(() => {
    if (isOpen) {
      if (initialMaterial) {
        setFormData({
          materialName: initialMaterial.name,
          isNewMaterial: false,
          newMaterialName: '',
          category: initialMaterial.category,
          date: new Date().toISOString().split('T')[0],
          quantity: '',
          unit: initialMaterial.unit,
          remarks: '',
        });
      } else if (materials.length > 0 && !formData.materialName) {
        const first = materials[0];
        setFormData((prev) => ({
          ...prev,
          materialName: first.name,
          category: first.category,
          unit: first.unit,
        }));
      }
    }
  }, [materials, isOpen, initialMaterial]);

  if (!isOpen) return null;

  const handleMaterialSelect = (selectedName) => {
    if (selectedName === '__NEW__') {
      setFormData({
        ...formData,
        isNewMaterial: true,
        materialName: '',
      });
    } else {
      const found = materials.find((m) => m.name === selectedName);
      setFormData({
        ...formData,
        isNewMaterial: false,
        materialName: selectedName,
        category: found ? found.category : formData.category,
        unit: found ? found.unit : formData.unit,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const resolvedName = formData.isNewMaterial
      ? formData.newMaterialName.trim()
      : formData.materialName;

    if (!resolvedName) return;

    const qty = parseFloat(formData.quantity) || 0;
    if (qty <= 0) return;

    onSaveInward({
      materialName: resolvedName,
      isNewMaterial: formData.isNewMaterial,
      category: formData.category,
      date: formData.date,
      quantity: qty,
      unit: formData.unit,
      remarks: formData.remarks || 'Stock received in godown',
    });

    // Reset and close
    setFormData((prev) => ({
      ...prev,
      quantity: '',
      remarks: '',
      isNewMaterial: false,
    }));
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
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Stock Inward</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Receive
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add received materials to warehouse stock.
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
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Material <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.isNewMaterial ? '__NEW__' : formData.materialName}
                onChange={(e) => handleMaterialSelect(e.target.value)}
                className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
              >
                {materials.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} ({m.availableQuantity} {m.unit} currently in stock)
                  </option>
                ))}
                <option value="__NEW__">+ Add New Material to Godown</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* If Adding New Material */}
          {formData.isNewMaterial && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  New Material Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. River Sand"
                  value={formData.newMaterialName}
                  onChange={(e) => setFormData({ ...formData, newMaterialName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Quantity Received <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="e.g. 50"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Unit <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                >
                  <option value="Bags">Bags</option>
                  <option value="Tons">Tons</option>
                  <option value="Kg">Kg</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Loads">Loads</option>
                  <option value="Sets">Sets</option>
                  <option value="Nos">Nos</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Inward Date */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Receive Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Remarks (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Remarks / Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Received from local supplier..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none shadow-2xs"
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
              className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
            >
              <ArrowDownLeft size={15} />
              <span>Add to Stock</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}
