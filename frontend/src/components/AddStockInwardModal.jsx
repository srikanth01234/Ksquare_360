import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  Package,
  Calendar,
  User,
  IndianRupee,
  FileText,
  MapPin,
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
}) {
  const [formData, setFormData] = useState({
    materialName: '',
    isNewMaterial: false,
    newMaterialName: '',
    category: 'Cement',
    supplier: 'SM Traders',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'Bags',
    rate: '',
    invoiceNo: '',
    godownLocation: 'Bay A - Main Yard',
    minStockLevel: '50',
    remarks: '',
  });

  const [totalAmount, setTotalAmount] = useState(0);

  // Auto calculate total = quantity * rate
  useEffect(() => {
    const qty = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    setTotalAmount(qty * rate);
  }, [formData.quantity, formData.rate]);

  // Set default material on open
  useEffect(() => {
    if (materials.length > 0 && !formData.materialName) {
      const first = materials[0];
      setFormData((prev) => ({
        ...prev,
        materialName: first.name,
        category: first.category,
        unit: first.unit,
        godownLocation: first.godownLocation || 'Bay A - Main Yard',
      }));
    }
  }, [materials, isOpen]);

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
        godownLocation: found ? found.godownLocation : formData.godownLocation,
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
      supplier: formData.supplier || 'General Supplier',
      date: formData.date,
      quantity: qty,
      unit: formData.unit,
      rate: parseFloat(formData.rate) || 0,
      totalAmount: totalAmount,
      invoiceNo: formData.invoiceNo || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      godownLocation: formData.godownLocation,
      minStockLevel: parseFloat(formData.minStockLevel) || 20,
      remarks: formData.remarks || '',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 via-white to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
              <ArrowDownLeft size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Stock Inward</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Receive Materials
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Record purchased materials received into the godown warehouse.
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
          {/* Section: Material Selection */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 font-bold">
              <Package size={13} />
              <span>Material Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Material <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.isNewMaterial ? '__NEW__' : formData.materialName}
                    onChange={(e) => handleMaterialSelect(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    {materials.map((m) => (
                      <option key={m.id || m.name} value={m.name}>
                        {m.name} ({m.availableQuantity} {m.unit} in stock)
                      </option>
                    ))}
                    <option value="__NEW__">+ Add New Material to Godown</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {formData.isNewMaterial ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    New Material Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UltraTech Super Cement"
                    value={formData.newMaterialName}
                    onChange={(e) => setFormData({ ...formData, newMaterialName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {formData.isNewMaterial && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Min Stock Alert Level <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Supplier & Purchase Info */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
              <User size={13} />
              <span>Purchase & Supplier Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Supplier / Vendor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. SM Traders"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Inward Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Invoice / DC Number
                </label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. INV-9041 / DC-88"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Quantity, Pricing & Location */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
              <Layers size={13} />
              <span>Quantity & Pricing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Quantity Received <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="e.g. 500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Unit <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Bags">Bags</option>
                    <option value="Loads">Loads</option>
                    <option value="Tons">Tons</option>
                    <option value="Kg">Kg</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Bundles">Bundles</option>
                    <option value="Cu. ft">Cu. ft</option>
                    <option value="Liters">Liters</option>
                    <option value="Boxes">Boxes</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Rate per Unit (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="420"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Godown Bay / Location
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Bay A - Main Yard"
                    value={formData.godownLocation}
                    onChange={(e) => setFormData({ ...formData, godownLocation: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Total Amount Green Highlight */}
            <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200/70">
              <span className="text-xs font-bold text-emerald-900">Total Purchase Value</span>
              <span className="text-base font-extrabold text-emerald-800 tracking-tight">
                ₹ {totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Remarks / Batch Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Delivered via lorry TN 09 B 8821, verified by storekeeper..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
              className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <Save size={15} />
              <span>Save Inward Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

