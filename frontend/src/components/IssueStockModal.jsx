import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  Package,
  Building2,
  Calendar,
  User,
  Truck,
  AlertTriangle,
  ChevronDown,
  Layers,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function IssueStockModal({
  isOpen,
  onClose,
  onIssueStock,
  materials = [],
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
  const [issuedTo, setIssuedTo] = useState('Muthu (Supervisor)');
  const [vehicleNo, setVehicleNo] = useState('');
  const [dcNumber, setDcNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected material record
  const currentMaterial = materials.find((m) => m.name === selectedMaterialName) || materials[0] || null;

  useEffect(() => {
    if (materials.length > 0 && !selectedMaterialName) {
      setSelectedMaterialName(materials[0].name);
    }
  }, [materials, isOpen]);

  // Generate DC number
  useEffect(() => {
    if (isOpen) {
      setDcNumber(`DC-${Math.floor(1000 + Math.random() * 9000)}`);
      setErrorMsg('');
      setQuantity('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableStock = currentMaterial ? currentMaterial.availableQuantity : 0;
  const unit = currentMaterial ? currentMaterial.unit : 'Units';

  const handleQuantityChange = (val) => {
    setQuantity(val);
    const num = parseFloat(val) || 0;
    if (num > availableStock) {
      setErrorMsg(`Cannot issue ${num} ${unit}! Maximum available stock in godown is ${availableStock} ${unit}.`);
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
      setErrorMsg(`Cannot issue ${qty} ${unit}! Maximum available stock is ${availableStock} ${unit}.`);
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
      vehicleNo: vehicleNo || '-',
      refNo: dcNumber,
      remarks: remarks || `Dispatched to ${selectedSite.name}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100/70 border border-blue-200 text-blue-700 flex items-center justify-center shadow-xs shrink-0">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Issue Stock (Outward)</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  Transfer to Site
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Issue materials from godown to an active construction project.
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
          {/* Material Selection & Live Stock Indicator */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-800 font-bold">
              <Package size={13} />
              <span>Material & Availability</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Material <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedMaterialName}
                    onChange={(e) => setSelectedMaterialName(e.target.value)}
                    className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {materials.map((m) => (
                      <option key={m.id || m.name} value={m.name}>
                        {m.name} ({m.availableQuantity} {m.unit} available)
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Live Stock Meter Badge */}
              <div className="flex flex-col justify-end">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-slate-600">Godown Available:</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-extrabold ${availableStock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {availableStock} {unit}
                    </span>
                    <div className="text-[10px] text-slate-400">Location: {currentMaterial?.godownLocation || 'Main Yard'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Destination Project & Issue Date */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
              <Building2 size={13} />
              <span>Destination Construction Site</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Target Project / Site <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={siteCode}
                    onChange={(e) => setSiteCode(e.target.value)}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {sites.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code}) - {s.location}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Issue Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  DC / Transfer Slip No.
                </label>
                <input
                  type="text"
                  value={dcNumber}
                  onChange={(e) => setDcNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quantity to Issue & Dispatch Logistics */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">
              <Truck size={13} />
              <span>Issue Quantity & Logistics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
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
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 ${
                      errorMsg ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Issued To / Receiver <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muthu (Site Engineer)"
                    value={issuedTo}
                    onChange={(e) => setIssuedTo(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Vehicle No. <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. TN 09 BX 4412"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in duration-150">
                <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Live Remaining Preview */}
            {!errorMsg && quantity && parseFloat(quantity) > 0 && (
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-800 font-medium">
                  <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                  <span>Valid issue request</span>
                </div>
                <div className="text-blue-900 font-bold">
                  Remaining in Godown after issue:{' '}
                  <span className="font-extrabold text-blue-700">
                    {(availableStock - parseFloat(quantity)).toFixed(1)} {unit}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Work Stage / Purpose</label>
            <textarea
              rows={2}
              placeholder="e.g. For foundation casting slab pouring at Green Villa..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  : 'bg-[#0072ff] hover:bg-blue-600 shadow-blue-500/25'
              }`}
            >
              <Send size={15} />
              <span>Confirm & Issue Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

