import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Layers,
  Building2,
  Calendar,
  ShoppingCart,
  User,
  CreditCard,
  CheckCircle2,
  Circle,
  FileEdit,
  Plus,
  ChevronDown,
  Banknote,
  Send,
  Upload,
  Image as ImageIcon,
  Hash,
  Trash2,
} from 'lucide-react';
import { CONSTRUCTION_MATERIALS, LABOUR_WORKER_TYPES } from '../constants/constructionData';

export default function AddExpenseModal({ isOpen, onClose, onAddExpense }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    category: 'Materials',
    site: 'Green Villa (KS-001)',
    date: '2026-11-01',
    description: 'Cement - 50 Bags',
    supplier: 'SM Traders',
    quantity: '50',
    unit: 'Bags',
    rate: '420',
    paymentMethod: 'Cash', // 'Cash' | 'UPI'
    paymentStatus: 'Paid',
    transactionId: '',
    notes: '',
  });

  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [totalAmount, setTotalAmount] = useState(21000);

  // Automatically calculate total = quantity * rate
  useEffect(() => {
    const qty = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    setTotalAmount(qty * rate);
  }, [formData.quantity, formData.rate]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description) return;

    const siteParts = formData.site.split(' (');
    const siteName = siteParts[0] || 'Green Villa';
    const siteCode = siteParts[1] ? siteParts[1].replace(')', '') : 'KS-001';

    const formattedAmount = `₹${totalAmount.toLocaleString('en-IN')}`;

    const newExpense = {
      id: Date.now().toString(),
      date: '01 Nov 2026',
      siteName: siteName,
      siteCode: siteCode,
      category: formData.category,
      description: formData.description,
      supplier: formData.supplier || '-',
      amount: formattedAmount,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId ? formData.transactionId.trim() : null,
      paymentScreenshot: screenshotPreview || null,
      notes: formData.notes || '',
    };

    onAddExpense(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add Expense</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record a new expense for a construction site.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="px-7 py-5 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Section 1: Expense Details */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <Layers size={13} />
              <span>Expense Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expense Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labour">Labour</option>
                    <option value="Rental">Rental</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Construction Site */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Construction Site <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Green Villa (KS-001)">Green Villa (KS-001)</option>
                    <option value="Office Renovation (KS-002)">Office Renovation (KS-002)</option>
                    <option value="RK Residence (KS-004)">RK Residence (KS-004)</option>
                    <option value="Metro Apartment (KS-005)">Metro Apartment (KS-005)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Expense Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Description & Item Quick Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {formData.category === 'Materials' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Construction Material <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.materialName || 'Cement'}
                      onChange={(e) => {
                        const mat = e.target.value;
                        setFormData({
                          ...formData,
                          materialName: mat,
                          description: `${mat} - ${formData.quantity || '50'} ${formData.unit || 'Bags'}`,
                        });
                      }}
                      className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {CONSTRUCTION_MATERIALS.map((mat) => (
                        <option key={mat} value={mat}>
                          {mat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {formData.category === 'Labour' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Labour / Worker Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.labourType || 'Mason'}
                      onChange={(e) => {
                        const role = e.target.value;
                        setFormData({
                          ...formData,
                          labourType: role,
                          description: `${role} Daily Wages`,
                        });
                      }}
                      className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {LABOUR_WORKER_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className={formData.category === 'Materials' || formData.category === 'Labour' ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={1}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Cement - 50 Bags"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Purchase Details */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <ShoppingCart size={13} />
              <span>Purchase Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              {/* Supplier / Vendor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Supplier / Vendor
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="SM Traders"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Unit <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-8"
                  >
                    <option value="Bags">Bags</option>
                    <option value="Loads">Loads</option>
                    <option value="Tons">Tons</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Hours">Hours</option>
                    <option value="Days">Days</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Rate per Unit */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rate per Unit (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder="420"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Total Amount Green Highlight Bar */}
            <div className="mt-3 flex items-center justify-between px-5 py-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
              <span className="text-xs font-bold text-slate-700">Total Amount (₹)</span>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                ₹ {totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Section 3: Payment Information */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <CreditCard size={13} />
              <span>Payment Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method Radio Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  {/* Cash Option */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                    className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'Cash'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    {formData.paymentMethod === 'Cash' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-300 shrink-0" />
                    )}
                    <Banknote size={15} />
                    <span className="text-xs font-bold">Cash</span>
                  </div>

                  {/* UPI Option */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                    className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'UPI'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    {formData.paymentMethod === 'UPI' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-300 shrink-0" />
                    )}
                    <Send size={14} className="rotate-45" />
                    <span className="text-xs font-bold">UPI</span>
                  </div>
                </div>
              </div>

              {/* Payment Status Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Status <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CheckCircle2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Transaction ID & Payment Screenshot (Both Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Transaction ID Text Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transaction ID <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. UPI / Ref / TXN-2026110199"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">UPI reference or bank transaction number</p>
              </div>

              {/* Payment Screenshot Image Upload Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Screenshot <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                  id="payment-screenshot-input"
                />

                {!screenshotPreview ? (
                  <label
                    htmlFor="payment-screenshot-input"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl text-xs cursor-pointer transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <Upload size={14} />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-slate-700 group-hover:text-emerald-700">Upload screenshot</div>
                      <div className="text-[10px] text-slate-400 truncate">PNG, JPG or receipt photo</div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{screenshotName || 'Screenshot uploaded'}</div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                          <CheckCircle2 size={10} />
                          <span>Ready</span>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes (Optional)
              </label>
              <div className="relative">
                <FileEdit size={14} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes here..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              <span>Add Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
