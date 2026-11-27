import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Calendar,
  ChevronDown,
  AlertTriangle,
  Send,
  Save,
  IndianRupee,
} from 'lucide-react';
import { getMaterialConfig } from '../constants/materialsData';

/**
 * Strict positive whole number check (>= 1, no 0, no negatives, no decimals)
 */
function isPositiveWholeNumber(val) {
  if (val === undefined || val === null) return false;
  const str = String(val).trim();
  if (!/^[1-9]\d*$/.test(str)) return false;
  const num = Number(str);
  return Number.isSafeInteger(num) && num >= 1;
}

/**
 * Block invalid keys for positive whole number inputs
 */
function handleWholeNumberKeyDown(e) {
  if (['.', '-', '+', 'e', 'E', ','].includes(e.key)) {
    e.preventDefault();
  }
}

export default function GodownStockActionModal({
  isOpen,
  onClose,
  material,
  sites = [],
  onSaveInward,
  onIssueStock,
}) {
  const [activeTab, setActiveTab] = useState('INWARD'); // 'INWARD' | 'OUTWARD'
  const [submitting, setSubmitting] = useState(false);

  const config = useMemo(() => {
    if (!material) return { units: ['Units'], types: [], sizes: [], brands: [] };
    return getMaterialConfig(material.name, material.category, material.unit);
  }, [material]);

  const availableStock = material?.availableQuantity ?? material?.stock ?? 0;

  // Inward state
  const [inwardForm, setInwardForm] = useState({
    variantType: '',
    variantSize: '',
    variantBrand: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    supplierName: '',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  // Outward state
  const [outwardForm, setOutwardForm] = useState({
    variantType: '',
    variantSize: '',
    variantBrand: '',
    siteId: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    issuedTo: 'Site Supervisor',
    date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [errors, setErrors] = useState({ quantity: '', unitPrice: '', general: '' });

  // Reset form cleanly whenever modal opens or selected material changes
  useEffect(() => {
    if (!isOpen || !material) return;

    const cfg = getMaterialConfig(material.name, material.category, material.unit);
    const defaultUnit = cfg.units[0] || material.unit || 'Units';
    const defaultType = cfg.types[0] || '';
    const defaultSize = cfg.sizes[0] || '';
    const defaultBrand = cfg.brands[0] || '';
    const defaultSite = sites[0]?._id || sites[0]?.code || '';

    setActiveTab('INWARD');
    setSubmitting(false);
    setErrors({ quantity: '', unitPrice: '', general: '' });

    setInwardForm({
      variantType: defaultType,
      variantSize: defaultSize,
      variantBrand: defaultBrand,
      quantity: '',
      unit: defaultUnit,
      unitPrice: '',
      supplierName: '',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    });

    setOutwardForm({
      variantType: defaultType,
      variantSize: defaultSize,
      variantBrand: defaultBrand,
      siteId: defaultSite,
      quantity: '',
      unit: defaultUnit,
      unitPrice: '',
      issuedTo: 'Site Supervisor',
      date: new Date().toISOString().split('T')[0],
      remarks: '',
    });
  }, [isOpen, material, sites]);

  // Clear errors when switching tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrors({ quantity: '', unitPrice: '', general: '' });
  };

  if (!material) return null;

  const isInward = activeTab === 'INWARD';
  const currentForm = isInward ? inwardForm : outwardForm;
  const setCurrentForm = isInward ? setInwardForm : setOutwardForm;

  const handleNumericChange = (field, rawValue) => {
    // Allow empty string so user can clear the field, otherwise only digits (no decimals, no minus)
    const cleaned = rawValue.replace(/[^\d]/g, '');
    setCurrentForm((prev) => ({ ...prev, [field]: cleaned }));

    // Live validation feedback
    if (cleaned === '') {
      setErrors((prev) => ({ ...prev, [field]: '' }));
      return;
    }

    if (!isPositiveWholeNumber(cleaned)) {
      setErrors((prev) => ({
        ...prev,
        [field]: `${field === 'quantity' ? 'Quantity' : 'Unit price'} must be a positive whole number (1 or more, no zero/decimals).`,
      }));
      return;
    }

    const num = Number(cleaned);
    if (field === 'quantity' && !isInward && num > availableStock) {
      setErrors((prev) => ({
        ...prev,
        quantity: `Cannot issue ${num} ${currentForm.unit}. Maximum available stock is ${availableStock} ${material.unit}.`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: '', general: '' }));
  };

  const qtyNum = isPositiveWholeNumber(currentForm.quantity) ? Number(currentForm.quantity) : 0;
  const priceNum = isPositiveWholeNumber(currentForm.unitPrice) ? Number(currentForm.unitPrice) : 0;
  const totalAmount = qtyNum > 0 && priceNum > 0 ? qtyNum * priceNum : 0;

  const validateBeforeSubmit = () => {
    const newErrors = { quantity: '', unitPrice: '', general: '' };
    let valid = true;

    if (material.status === 'Inactive') {
      newErrors.general = `${material.name} is Inactive and cannot be transacted.`;
      valid = false;
    }

    if (!isPositiveWholeNumber(currentForm.quantity)) {
      newErrors.quantity = 'Enter a valid positive whole number (minimum 1, no zero or decimals).';
      valid = false;
    } else if (!isInward && Number(currentForm.quantity) > availableStock) {
      newErrors.quantity = `Cannot issue ${currentForm.quantity} ${currentForm.unit}. Available stock is ${availableStock} ${material.unit}.`;
      valid = false;
    }

    if (!isPositiveWholeNumber(currentForm.unitPrice)) {
      newErrors.unitPrice = 'Enter a valid unit price (positive whole number, minimum ₹1).';
      valid = false;
    }

    if (!isInward && !outwardForm.siteId && sites.length > 0) {
      newErrors.general = 'Please select a destination construction site.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    setSubmitting(true);
    try {
      const qty = Number(currentForm.quantity);
      const unitPrice = Number(currentForm.unitPrice);

      const variantNotesParts = [
        currentForm.variantType ? `Type: ${currentForm.variantType}` : '',
        currentForm.variantSize ? `Size: ${currentForm.variantSize}` : '',
        currentForm.variantBrand ? `Brand: ${currentForm.variantBrand}` : '',
      ].filter(Boolean);

      const combinedRemarks = [
        variantNotesParts.join(' | '),
        currentForm.remarks?.trim(),
      ]
        .filter(Boolean)
        .join(' — ');

      if (isInward) {
        await onSaveInward({
          materialId: material._id || material.id,
          materialName: material.name,
          category: material.category,
          quantity: qty,
          unit: inwardForm.unit,
          unitPrice,
          totalAmount: qty * unitPrice,
          variantType: inwardForm.variantType,
          variantSize: inwardForm.variantSize,
          variantBrand: inwardForm.variantBrand,
          supplierName: inwardForm.supplierName.trim() || 'Direct Vendor',
          date: inwardForm.date,
          remarks: combinedRemarks || 'Stock received in godown',
        });
      } else {
        const selectedSite =
          sites.find((s) => s._id === outwardForm.siteId || s.code === outwardForm.siteId) ||
          sites[0] ||
          { name: 'Main Site', code: 'KS-001' };

        await onIssueStock({
          materialId: material._id || material.id,
          materialName: material.name,
          category: material.category,
          quantity: qty,
          unit: outwardForm.unit,
          unitPrice,
          totalAmount: qty * unitPrice,
          variantType: outwardForm.variantType,
          variantSize: outwardForm.variantSize,
          variantBrand: outwardForm.variantBrand,
          siteId: selectedSite._id,
          siteName: selectedSite.name,
          siteCode: selectedSite.code || '',
          projectLabel: `${selectedSite.name} (${selectedSite.code || ''})`,
          date: outwardForm.date,
          issuedTo: outwardForm.issuedTo.trim() || 'Site Supervisor',
          remarks: combinedRemarks || `Dispatched to ${selectedSite.name}`,
        });
      }

      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err?.message || 'Failed to save stock transaction. Please check inputs.',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/60 backdrop-blur-xs"
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Fixed Top Header */}
            <div
              className={`shrink-0 flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 bg-gradient-to-r ${
                isInward ? 'from-emerald-50' : 'from-blue-50'
              } via-white to-white`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-xs shrink-0 ${
                    isInward
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-blue-100 border-blue-300 text-blue-800'
                  }`}
                >
                  {isInward ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">
                      {material.name} — Stock Entry
                    </h2>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    Available in Godown:{' '}
                    <strong className={availableStock > 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>
                      {availableStock.toLocaleString('en-IN')} {material.unit}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Fixed Inward / Outward Tabs */}
            <div className="shrink-0 px-6 pt-4 pb-2 bg-white border-b border-slate-100">
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('INWARD')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isInward
                      ? 'bg-[#008744] text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  <ArrowDownLeft size={15} />
                  <span>Inward (Add Stock)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('OUTWARD')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    !isInward
                      ? 'bg-[#0072ff] text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                  }`}
                >
                  <ArrowUpRight size={15} />
                  <span>Outward (Issue Stock)</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 text-xs" noValidate>
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Locked Material Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Material <span className="text-rose-600">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">
                    <Lock size={10} />
                    Locked
                  </span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-950 font-extrabold cursor-not-allowed select-none">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={material.image}
                      alt={material.name}
                      className="w-6 h-6 rounded-md object-cover border border-slate-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span>{material.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-300">
                      {material.category}
                    </span>
                  </div>
                  <Lock size={14} className="text-slate-600 shrink-0" />
                </div>
              </div>

              {/* Dynamic Material Variants (Type / Size / Brand) */}
              {(config.types.length > 0 || config.sizes.length > 0 || config.brands.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-300 rounded-2xl">
                  {config.types.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-900 mb-1">
                        {material.name === 'Bricks' ? 'Brick Type' : 'Type / Grade'}
                      </label>
                      <div className="relative">
                        <select
                          value={currentForm.variantType}
                          onChange={(e) =>
                            setCurrentForm((prev) => ({ ...prev, variantType: e.target.value }))
                          }
                          className="w-full appearance-none pl-3 pr-7 py-2 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >
                          {config.types.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                        />
                      </div>
                    </div>
                  )}

                  {config.sizes.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-900 mb-1">
                        Size
                      </label>
                      <div className="relative">
                        <select
                          value={currentForm.variantSize}
                          onChange={(e) =>
                            setCurrentForm((prev) => ({ ...prev, variantSize: e.target.value }))
                          }
                          className="w-full appearance-none pl-3 pr-7 py-2 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >
                          {config.sizes.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                        />
                      </div>
                    </div>
                  )}

                  {config.brands.length > 0 && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-900 mb-1">
                        Brand
                      </label>
                      <div className="relative">
                        <select
                          value={currentForm.variantBrand}
                          onChange={(e) =>
                            setCurrentForm((prev) => ({ ...prev, variantBrand: e.target.value }))
                          }
                          className="w-full appearance-none pl-3 pr-7 py-2 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >
                          {config.brands.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Outward Destination Site & Receiver OR Inward Supplier */}
              {!isInward ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Destination Site <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={outwardForm.siteId}
                        onChange={(e) =>
                          setOutwardForm((prev) => ({ ...prev, siteId: e.target.value }))
                        }
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                      >
                        {sites.length === 0 ? (
                          <option value="">No sites available</option>
                        ) : (
                          sites.map((s) => (
                            <option key={s._id || s.code} value={s._id || s.code}>
                              {s.name} ({s.code})
                            </option>
                          ))
                        )}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Received By (Site Incharge)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Site Supervisor"
                      value={outwardForm.issuedTo}
                      onChange={(e) =>
                        setOutwardForm((prev) => ({ ...prev, issuedTo: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Supplier / Vendor <span className="text-slate-600 font-medium">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sri Murugan Traders"
                    value={inwardForm.supplierName}
                    onChange={(e) =>
                      setInwardForm((prev) => ({ ...prev, supplierName: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>
              )}

              {/* Quantity, Measurement Unit, & Unit Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Quantity <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="1"
                    required
                    placeholder={!isInward ? `Max ${availableStock}` : 'e.g. 100'}
                    value={currentForm.quantity}
                    onKeyDown={handleWholeNumberKeyDown}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => handleNumericChange('quantity', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl font-black text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 shadow-2xs ${
                      errors.quantity
                        ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-600'
                        : isInward
                        ? 'border-slate-400 focus:ring-emerald-500/20 focus:border-emerald-600'
                        : 'border-slate-400 focus:ring-blue-500/20 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Unit <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={currentForm.unit}
                      onChange={(e) =>
                        setCurrentForm((prev) => ({ ...prev, unit: e.target.value }))
                      }
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
                    >
                      {config.units.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Unit Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min="1"
                      required
                      placeholder={isInward ? 'e.g. 15' : 'e.g. 20'}
                      value={currentForm.unitPrice}
                      onKeyDown={handleWholeNumberKeyDown}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => handleNumericChange('unitPrice', e.target.value)}
                      className={`w-full pl-8 pr-3.5 py-2.5 bg-white border rounded-xl font-black text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 shadow-2xs ${
                        errors.unitPrice
                          ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-600'
                          : isInward
                          ? 'border-slate-400 focus:ring-emerald-500/20 focus:border-emerald-600'
                          : 'border-slate-400 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Validation Error Messages */}
              {(errors.quantity || errors.unitPrice || errors.general) && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    {errors.general && <div>{errors.general}</div>}
                    {errors.quantity && <div>{errors.quantity}</div>}
                    {errors.unitPrice && <div>{errors.unitPrice}</div>}
                  </div>
                </div>
              )}

              {/* Live Total Amount Summary */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${
                  isInward
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-blue-50 border-blue-300 text-blue-950'
                }`}
              >
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider">
                    Total {isInward ? 'Purchase' : 'Issue'} Amount
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                    {qtyNum > 0 && priceNum > 0
                      ? `${qtyNum.toLocaleString('en-IN')} ${currentForm.unit} × ₹${priceNum.toLocaleString('en-IN')}`
                      : 'Enter positive whole number quantity & unit price'}
                  </div>
                </div>
                <div className="text-xl font-black tracking-tight text-slate-950">
                  ₹ {totalAmount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Date & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Date <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
                    />
                    <input
                      type="date"
                      required
                      value={currentForm.date}
                      onChange={(e) =>
                        setCurrentForm((prev) => ({ ...prev, date: e.target.value }))
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Remarks <span className="text-slate-600 font-medium">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={isInward ? 'e.g. Chalan #204' : 'e.g. For Slab Casting'}
                    value={currentForm.remarks}
                    onChange={(e) =>
                      setCurrentForm((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-400 rounded-xl font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  />
                </div>
              </div>
              </div>

              {/* Fixed Bottom Footer Actions */}
              <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    material.status === 'Inactive' ||
                    (!isInward && availableStock <= 0) ||
                    !isPositiveWholeNumber(currentForm.quantity) ||
                    !isPositiveWholeNumber(currentForm.unitPrice) ||
                    (!isInward && Number(currentForm.quantity) > availableStock)
                  }
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                    isInward
                      ? 'bg-[#008744] hover:bg-[#00743a] shadow-emerald-800/20'
                      : 'bg-[#0072ff] hover:bg-blue-600 shadow-blue-500/20'
                  }`}
                >
                  {isInward ? <Save size={15} /> : <Send size={15} />}
                  <span>
                    {submitting
                      ? 'Saving...'
                      : isInward
                      ? 'Save Stock Inward'
                      : 'Confirm Issue Stock'}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
