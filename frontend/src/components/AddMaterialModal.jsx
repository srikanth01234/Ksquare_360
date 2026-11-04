import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  IndianRupee,
  Upload,
  Save,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { CONSTRUCTION_MATERIALS } from '../constants/constructionData';

export default function AddMaterialModal({ isOpen, onClose, onSaveMaterial }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cement',
    unit: 'Bags',
    price: '420',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    onSaveMaterial(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header with Materials graphic banner */}
        <div className="relative flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-white overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Add Material</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add a new construction material with pricing.
              </p>
            </div>
          </div>

          <div className="w-28 h-16 rounded-xl overflow-hidden shadow-xs shrink-0 hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=300&q=80"
              alt="Construction Materials"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Material Information */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold">
              <Package size={13} />
              <span>Material Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Material Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 pr-8 font-medium"
                  >
                    <option value="">Select Material</option>
                    {CONSTRUCTION_MATERIALS.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Cement">Cement</option>
                  <option value="Steel">Steel</option>
                  <option value="Bricks">Bricks</option>
                  <option value="Aggregates">Aggregates / Sand</option>
                  <option value="Paint">Paint</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Bags">Bags</option>
                  <option value="Loads">Loads</option>
                  <option value="Tons">Tons</option>
                  <option value="Kg">Kg</option>
                  <option value="Piece">Piece</option>
                  <option value="Cu. ft">Cu. ft</option>
                  <option value="Liters">Liters</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Standard Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder="Enter price per unit"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Enter material description (e.g., 50 kg cement bag, M-Sand, etc.)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none"
              />
            </div>

            {/* Upload & Examples Side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Material Image (Optional)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-emerald-400 cursor-pointer transition-colors bg-slate-50/50">
                  <Upload size={18} className="text-slate-400 mb-1" />
                  <span className="font-bold text-slate-700">Upload Image</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG (Max 3 MB)</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Layers size={13} />
                  <span>Examples</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 font-medium">
                  <li>• M-Sand / P-Sand – Load – ₹5,500</li>
                  <li>• 20mm Blue Metal – Load – ₹6,000</li>
                  <li>• Cement – Bag – ₹420</li>
                  <li>• Steel – Kg – ₹75</li>
                  <li>• Chengal Brick – Piece – ₹8</li>
                  <li>• AAC Block – Piece – ₹65</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20"
            >
              <Save size={15} />
              <span>Save Material</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

