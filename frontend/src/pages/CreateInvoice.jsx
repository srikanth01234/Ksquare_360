import React, { useState, useMemo } from 'react';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Building2,
  User,
  Plus,
  Trash2,
  FileEdit,
  ChevronDown,
  Layers,
  Save,
  Send,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export default function CreateInvoice({ onBack = () => {}, onInvoiceCreated = () => {} }) {
  const [formData, setFormData] = useState({
    invoiceNumber: 'INV-0025',
    invoiceDate: '2026-11-01',
    dueDate: '2026-11-15',
    clientName: 'Mr. Rajesh Kumar',
    site: 'Green Villa (KS-001)',
    projectRef: 'Villa Construction - Phase 1',
    paymentTerms: 'Net 15 Days',
    notes: '',
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Foundation Work', quantity: 1, unit: 'Lot', rate: 500000 },
    { id: 2, description: 'RCC Work', quantity: 1, unit: 'Lot', rate: 350000 },
    { id: 3, description: 'Brick Work', quantity: 1, unit: 'Lot', rate: 200000 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now(), description: '', quantity: 1, unit: 'Lot', rate: 0 },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  }, [items]);

  const gst = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const totalAmount = useMemo(() => subtotal + gst, [subtotal, gst]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const siteParts = formData.site.split(' (');
    const siteName = siteParts[0] || 'Green Villa';
    const siteCode = siteParts[1] ? siteParts[1].replace(')', '') : 'KS-001';

    const newInvoice = {
      id: formData.invoiceNumber,
      client: formData.clientName,
      project: formData.projectRef,
      siteName: siteName,
      siteCode: siteCode,
      date: '01 Nov 2026',
      amount: `₹ ${totalAmount.toLocaleString('en-IN')}`,
      received: '₹ 0',
      balance: `₹ ${totalAmount.toLocaleString('en-IN')}`,
      status: 'Pending',
    };

    onInvoiceCreated(newInvoice);
    onBack();
  };

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <FileText size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Invoice</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Generate a new invoice for a client, site or construction project.
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Invoices</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. Invoice Details Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                <FileText size={13} />
                <span>Invoice Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Invoice Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Invoice Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Due Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Client & Project Details Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                <User size={13} />
                <span>Client & Project Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Client Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="Mr. Rajesh Kumar">Mr. Rajesh Kumar</option>
                      <option value="Ms. Priya Menon">Ms. Priya Menon</option>
                      <option value="Metro Builders">Metro Builders</option>
                      <option value="Mr. Arvind Nathan">Mr. Arvind Nathan</option>
                      <option value="Lotus Developers">Lotus Developers</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

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
                      <option value="RK Residence (KS-004)">RK Residence (KS-004)</option>
                      <option value="Metro Apartment (KS-005)">Metro Apartment (KS-005)</option>
                      <option value="Office Renovation (KS-002)">Office Renovation (KS-002)</option>
                      <option value="Lotus Heights (KS-006)">Lotus Heights (KS-006)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project / Reference
                </label>
                <input
                  type="text"
                  value={formData.projectRef}
                  onChange={(e) => setFormData({ ...formData, projectRef: e.target.value })}
                  placeholder="Villa Construction - Phase 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 3. Invoice Items Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                <Layers size={13} />
                <span>Invoice Items</span>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2.5 px-2 w-8">#</th>
                      <th className="py-2.5 px-2">Description *</th>
                      <th className="py-2.5 px-2 w-20">Quantity</th>
                      <th className="py-2.5 px-2 w-24">Unit</th>
                      <th className="py-2.5 px-2 w-28">Rate (₹)</th>
                      <th className="py-2.5 px-2 w-28 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-2 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-3 px-2">
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              placeholder="Work description"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 text-center"
                            />
                          </td>
                          <td className="py-3 px-2">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                            >
                              <option value="Lot">Lot</option>
                              <option value="Sq.Ft">Sq.Ft</option>
                              <option value="Hours">Hours</option>
                              <option value="Days">Days</option>
                            </select>
                          </td>
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                            />
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-slate-900">
                            ₹ {amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Item</span>
              </button>
            </div>

            {/* 4. Notes & Payment Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <FileEdit size={13} />
                  <span>Notes (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes, terms or instructions..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 resize-none"
                />
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Calendar size={13} />
                  <span>Payment Terms</span>
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Net 15 Days">Net 15 Days</option>
                  <option value="Net 30 Days">Net 30 Days</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Summary & Live Invoice Preview */}
          <div className="lg:col-span-4 space-y-5">
            {/* Invoice Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                <Layers size={13} />
                <span>Invoice Summary</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹ {subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <span>Tax (GST 18%)</span>
                    <FileEdit size={11} className="text-slate-400" />
                  </span>
                  <span className="font-bold text-slate-900">₹ {gst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total Amount Green Highlight Box */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
                <span className="text-xs font-bold text-slate-800">Total Amount</span>
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                  ₹ {totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Invoice Preview Document */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Eye size={14} className="text-emerald-600" />
                  <span>Invoice Preview</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-bold text-white bg-[#008744] px-2.5 py-1 rounded-lg shadow-2xs"
                >
                  <Eye size={11} />
                  <span>Preview</span>
                </button>
              </div>

              {/* Mini Invoice Sheet */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-[10px] space-y-3 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      K
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight">KBuild 360</div>
                      <div className="text-[8px] text-slate-400">Construction Management</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-xs">INVOICE</div>
                  </div>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-2 text-[9px]">
                  <div>
                    <span className="text-slate-400">Bill To:</span>
                    <div className="font-bold text-slate-800">{formData.clientName}</div>
                    <div className="text-slate-500">{formData.projectRef}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div><span className="text-slate-400">Invoice No:</span> <strong className="text-slate-800">{formData.invoiceNumber}</strong></div>
                    <div><span className="text-slate-400">Invoice Date:</span> <strong className="text-slate-800">01 Nov 2026</strong></div>
                    <div><span className="text-slate-400">Due Date:</span> <strong className="text-slate-800">15 Nov 2026</strong></div>
                  </div>
                </div>

                {/* Items in preview */}
                <div className="border-t border-slate-200 pt-2 space-y-1">
                  <div className="flex justify-between font-bold text-slate-500 text-[8px] uppercase">
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Rate</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {items.map((it, i) => (
                    <div key={i} className="flex justify-between text-slate-700">
                      <span className="truncate max-w-[90px]">{it.description || 'Item'}</span>
                      <span>{it.quantity} {it.unit}</span>
                      <span>{it.rate}</span>
                      <span className="text-right font-medium">₹ {(it.quantity * it.rate).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Total in preview */}
                <div className="border-t border-slate-200 pt-2 space-y-0.5 text-right text-[9px]">
                  <div className="text-slate-500">Subtotal: <strong className="text-slate-800">₹ {subtotal.toLocaleString('en-IN')}</strong></div>
                  <div className="text-slate-500">GST (18%): <strong className="text-slate-800">₹ {gst.toLocaleString('en-IN')}</strong></div>
                  <div className="text-[10px] font-bold text-emerald-700 pt-1">
                    Total Amount: ₹ {totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Save size={14} />
            <span>Save as Draft</span>
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Send size={14} />
            <span>Create Invoice</span>
          </button>
        </div>
      </form>
    </div>
  );
}

