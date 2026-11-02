import React, { useState } from 'react';
import {
  X,
  CalendarCheck,
  Building2,
  Calendar,
  Layers,
  ClipboardList,
  Users,
  Plus,
  Trash2,
  ChevronDown,
  User,
  CheckSquare,
  Square,
  FileEdit,
} from 'lucide-react';
import { CONSTRUCTION_MATERIALS, LABOUR_WORKER_TYPES } from '../constants/constructionData';

export default function AddDailyUpdateModal({ isOpen, onClose, onAddUpdate }) {
  const [formData, setFormData] = useState({
    site: 'Green Villa (KS-001)',
    date: '2026-11-01',
    activity: 'Foundation Work',
    description: 'Column foundation reinforcement and formwork setup completed on the north side.',
    progress: 60,
    totalLabour: '6',
    remarks: '',
  });

  const [selectedLabourTypes, setSelectedLabourTypes] = useState(['Mason', 'Carpenter']);

  const [materials, setMaterials] = useState([
    { id: 1, material: 'Steel', quantity: '200', unit: 'Kg' },
    { id: 2, material: 'Cement', quantity: '10', unit: 'Bags' },
  ]);

  if (!isOpen) return null;

  const toggleLabourType = (workerType) => {
    if (selectedLabourTypes.includes(workerType)) {
      setSelectedLabourTypes(selectedLabourTypes.filter((t) => t !== workerType));
    } else {
      setSelectedLabourTypes([...selectedLabourTypes, workerType]);
    }
  };

  const handleAddMaterialRow = () => {
    setMaterials([
      ...materials,
      { id: Date.now(), material: 'M-Sand', quantity: '', unit: 'Loads' },
    ]);
  };

  const handleRemoveMaterialRow = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleMaterialChange = (id, field, value) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description) return;

    const siteParts = formData.site.split(' (');
    const siteName = siteParts[0] || 'Green Villa';
    const siteCode = siteParts[1] ? siteParts[1].replace(')', '') : 'KS-001';

    const materialsSummary = materials
      .filter((m) => m.material)
      .map((m) => m.material)
      .join(', ') || 'Materials';

    const newUpdate = {
      id: Date.now().toString(),
      date: '01 Nov 2026',
      siteName: siteName,
      siteCode: siteCode,
      activity: formData.activity,
      description: formData.description,
      labourCount: formData.totalLabour || '4',
      materialsUsed: materialsSummary,
      duration: '8 hrs',
      progress: formData.progress,
      status: formData.progress >= 100 ? 'Completed' : 'In Progress',
    };

    onAddUpdate(newUpdate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
              <CalendarCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add Daily Update</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record the day-to-day construction progress for a site.
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
          {/* Section 1: Basic Details */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <Building2 size={13} />
              <span>Basic Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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

              {/* Update Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Update Date <span className="text-rose-500">*</span>
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

              {/* Work / Activity */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work / Activity <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.activity}
                    onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Foundation Work">Foundation Work</option>
                    <option value="Brick Work">Brick Work</option>
                    <option value="Plastering Work">Plastering Work</option>
                    <option value="Painting Work">Painting Work</option>
                    <option value="Site Preparation">Site Preparation</option>
                    <option value="Electrical & Plumbing">Electrical & Plumbing</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Work Update */}
          <div className="space-y-3 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <ClipboardList size={13} />
              <span>Work Update</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Description */}
              <div className="md:col-span-7">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Column foundation reinforcement and formwork setup completed on the north side."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Progress Slider */}
              <div className="md:col-span-5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Work Progress <span className="text-rose-500">*</span></span>
                  <span className="font-extrabold text-emerald-700 text-sm">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="w-full accent-[#008744] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>0% Started</span>
                  <span>50%</span>
                  <span>100% Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Labour Details & Materials Used */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Labour Details */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                <Users size={13} />
                <span>Labour Details</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Total Labour <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="6"
                    value={formData.totalLabour}
                    onChange={(e) => setFormData({ ...formData, totalLabour: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Labour Types / Trades
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200/80">
                  {LABOUR_WORKER_TYPES.map((trade) => {
                    const isSelected = selectedLabourTypes.includes(trade);
                    return (
                      <button
                        key={trade}
                        type="button"
                        onClick={() => toggleLabourType(trade)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {trade}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Materials Used */}
            <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                <Layers size={13} />
                <span>Materials Used</span>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <select
                        value={m.material}
                        onChange={(e) => handleMaterialChange(m.id, 'material', e.target.value)}
                        className="w-full appearance-none px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 pr-6"
                      >
                        {CONSTRUCTION_MATERIALS.map((mat) => (
                          <option key={mat} value={mat}>
                            {mat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={m.quantity}
                      onChange={(e) => handleMaterialChange(m.id, 'quantity', e.target.value)}
                      className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
                    />

                    <div className="w-20 relative">
                      <select
                        value={m.unit}
                        onChange={(e) => handleMaterialChange(m.id, 'unit', e.target.value)}
                        className="w-full appearance-none px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 pr-5"
                      >
                        <option value="Kg">Kg</option>
                        <option value="Bags">Bags</option>
                        <option value="Loads">Loads</option>
                        <option value="Tons">Tons</option>
                        <option value="Liters">Liters</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMaterialRow(m.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Material</span>
              </button>
            </div>
          </div>

          {/* Section 4: Remarks (Optional) */}
          <div className="space-y-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <FileEdit size={13} />
              <span>Remarks (Optional)</span>
            </div>

            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Add any additional notes, issues or next plan..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
            />
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
              <span>Add Daily Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

