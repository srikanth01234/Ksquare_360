import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Package,
  Truck,
  Calculator,
  Coins,
} from 'lucide-react';
import { CONSTRUCTION_MATERIALS, LABOUR_WORKER_TYPES } from '../constants/constructionData';

// Material type classification helpers
const isSteelMaterial = (name) => name === 'Steel';
const isRingMaterial = (name) => name === 'Rings';
const isSandMaterial = (name) => ['M-Sand', 'P-Sand', 'River Sand'].includes(name);
const isBlueMetalMaterial = (name) =>
  ['20 mm Blue Metal', '40 mm Blue Metal', '20mm Blue Metal', '40mm Blue Metal'].includes(name);
const isBrickOrBlockMaterial = (name) =>
  [
    'Chamber Bricks',
    'Fly Ash Bricks',
    'Solid Block – 6 Inch',
    'Solid Block – 4 Inch',
    'Chengal Brick (Red Brick)',
    'Cement Brick',
    'AAC Block',
  ].includes(name);

const STEEL_TYPES = ['20 mm', '16 mm', '12 mm', '10 mm', '8 mm', '6 mm'];
const RING_TYPES = ['8 mm', '6 mm'];
const BRICK_BLOCK_TYPES = [
  'Chamber Bricks',
  'Fly Ash Bricks',
  'Solid Block – 6 Inch',
  'Solid Block – 4 Inch',
  'Chengal Brick (Red Brick)',
  'Cement Brick',
  'AAC Block',
];

const createDefaultRow = (materialName) => {
  const id = Date.now() + Math.random();
  if (isSteelMaterial(materialName)) {
    return { id, steelType: '12 mm', length: '', weight: '', amount: '' };
  }
  if (isRingMaterial(materialName)) {
    return { id, ringType: '8 mm', quantity: '', weight: '', amount: '' };
  }
  if (isSandMaterial(materialName)) {
    return { id, sandType: materialName || 'M-Sand', quantity: '', amount: '' };
  }
  if (isBlueMetalMaterial(materialName)) {
    return { id, materialType: materialName || '20 mm Blue Metal', quantity: '', amount: '' };
  }
  if (isBrickOrBlockMaterial(materialName)) {
    return { id, materialType: materialName || 'Chamber Bricks', quantity: '', amount: '' };
  }
  return {
    id,
    material: materialName || 'Cement',
    quantity: materialName === 'Cement' ? '50' : '',
    unit: materialName === 'Cement' ? 'Bags' : 'Bags',
    amount: materialName === 'Cement' ? '21000' : '',
  };
};

export default function AddExpenseModal({ isOpen, onClose, onAddExpense }) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    category: 'Materials',
    materialName: 'Cement',
    site: 'Green Villa (KS-001)',
    date: '2026-11-01',
    description: 'Cement - 50 Bags',
    supplier: 'SM Traders',
    invoiceNo: '',
    quantity: '50',
    unit: 'Bags',
    rate: '420',
    vehicleType: 'Tata Ace / Mini Truck',
    rentalAmount: '',
    tipsAmount: '',
    billingAmount: '', // Empty by default and editable
    paymentMethod: 'Cash', // 'Cash' | 'UPI'
    paymentStatus: 'Paid',
    transactionId: '',
    notes: '',
  });

  // Dynamic Material Details Table rows
  const [materialItems, setMaterialItems] = useState([
    { id: 1, material: 'Cement', quantity: '50', unit: 'Bags', amount: '21000' },
  ]);

  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [totalAmount, setTotalAmount] = useState(21000);

  // Overall Expense Calculations
  const materialCost = useMemo(() => {
    if (formData.category === 'Materials') {
      return materialItems.reduce(
        (sum, it) => sum + (parseFloat(it.amount) || 0),
        0
      );
    }
    const qty = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return qty * rate;
  }, [formData.category, formData.quantity, formData.rate, materialItems]);

  const vehicleRental = parseFloat(formData.rentalAmount) || 0;
  const tips = parseFloat(formData.tipsAmount) || 0;
  const totalExpenseAmount = materialCost + vehicleRental + tips;

  useEffect(() => {
    setTotalAmount(totalExpenseAmount);
  }, [totalExpenseAmount]);

  // Synchronize Material Items with Purchase Details (Quantity & Rate)
  useEffect(() => {
    if (formData.category !== 'Materials') {
      return;
    }

    // Sum of amounts from all rows
    const sumAmount = materialItems.reduce(
      (acc, item) => acc + (parseFloat(item.amount) || 0),
      0
    );

    // Sum of quantities / weight based on material type
    let totalQty = 0;
    let targetUnit = formData.unit;

    if (isSteelMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.weight) || 0),
        0
      );
      targetUnit = 'Kg';
    } else if (isRingMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Pieces';
    } else if (isSandMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Tons';
    } else if (isBlueMetalMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Tons';
    } else if (isBrickOrBlockMaterial(formData.materialName)) {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = 'Pieces';
    } else {
      totalQty = materialItems.reduce(
        (acc, item) => acc + (parseFloat(item.quantity) || 0),
        0
      );
      targetUnit = materialItems[0]?.unit || 'Bags';
    }

    setFormData((prev) => {
      const nextQty = totalQty > 0 ? String(totalQty) : prev.quantity;
      const nextRate =
        totalQty > 0 && sumAmount > 0
          ? (sumAmount / totalQty).toFixed(2)
          : prev.rate;

      if (
        prev.quantity === nextQty &&
        prev.unit === targetUnit &&
        prev.rate === nextRate
      ) {
        return prev;
      }
      return {
        ...prev,
        quantity: nextQty,
        unit: targetUnit,
        rate: nextRate,
      };
    });
  }, [materialItems, formData.category, formData.materialName]);

  const handleMaterialChange = (selectedMat) => {
    const newRow = createDefaultRow(selectedMat);
    setMaterialItems([newRow]);

    let newUnit = 'Bags';
    if (isSteelMaterial(selectedMat)) newUnit = 'Kg';
    else if (isRingMaterial(selectedMat)) newUnit = 'Pieces';
    else if (isSandMaterial(selectedMat)) newUnit = 'Tons';
    else if (isBlueMetalMaterial(selectedMat)) newUnit = 'Tons';
    else if (isBrickOrBlockMaterial(selectedMat)) newUnit = 'Pieces';

    setFormData((prev) => ({
      ...prev,
      materialName: selectedMat,
      unit: newUnit,
      description: `${selectedMat} Purchase`,
    }));
  };

  const handleAddRow = () => {
    setMaterialItems([
      ...materialItems,
      createDefaultRow(formData.materialName),
    ]);
  };

  const handleRemoveRow = (rowId) => {
    if (materialItems.length === 1) {
      // Keep at least one row, just reset fields
      setMaterialItems([createDefaultRow(formData.materialName)]);
    } else {
      setMaterialItems(materialItems.filter((item) => item.id !== rowId));
    }
  };

  const handleRowChange = (rowId, field, value) => {
    setMaterialItems(
      materialItems.map((item) =>
        item.id === rowId ? { ...item, [field]: value } : item
      )
    );
  };

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

    const formattedAmount = `₹${totalExpenseAmount.toLocaleString('en-IN')}`;

    const newExpense = {
      id: Date.now().toString(),
      date: '01 Nov 2026',
      siteName: siteName,
      siteCode: siteCode,
      category: formData.category,
      materialName: formData.materialName,
      description: formData.description,
      supplier: formData.supplier || '-',
      invoiceNo: formData.invoiceNo || '-',
      amount: formattedAmount,
      materialCost,
      vehicleType: formData.vehicleType,
      rentalAmount: vehicleRental,
      tipsAmount: tips,
      totalExpenseAmount,
      billingAmount: formData.billingAmount ? parseFloat(formData.billingAmount) : null,
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId ? formData.transactionId.trim() : null,
      paymentScreenshot: screenshotPreview || null,
      notes: formData.notes || '',
      materialItems: formData.category === 'Materials' ? materialItems : [],
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
              <Layers size={13} />
              <span>Expense Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Expense Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labour">Labour</option>
                    <option value="Rental">Rental</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Construction Site */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Construction Site <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <select
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                  >
                    <option value="Green Villa (KS-001)">Green Villa (KS-001)</option>
                    <option value="Office Renovation (KS-002)">Office Renovation (KS-002)</option>
                    <option value="RK Residence (KS-004)">RK Residence (KS-004)</option>
                    <option value="Metro Apartment (KS-005)">Metro Apartment (KS-005)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Expense Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Description & Item Quick Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {formData.category === 'Materials' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Construction Material <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.materialName || 'Cement'}
                      onChange={(e) => handleMaterialChange(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                    >
                      {CONSTRUCTION_MATERIALS.map((mat) => (
                        <option key={mat} value={mat}>
                          {mat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {formData.category === 'Labour' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
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
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                    >
                      {LABOUR_WORKER_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className={formData.category === 'Materials' || formData.category === 'Labour' ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={1}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Cement - 50 Bags"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Material Details Table (Only shown for Materials category) */}
          {formData.category === 'Materials' && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                  <Package size={13} />
                  <span>
                    {isSteelMaterial(formData.materialName)
                      ? 'Steel Specifications & Rod Breakdown'
                      : isRingMaterial(formData.materialName)
                      ? 'Steel Ring Breakdown'
                      : isSandMaterial(formData.materialName)
                      ? `${formData.materialName} Breakdown`
                      : isBlueMetalMaterial(formData.materialName)
                      ? `${formData.materialName} Breakdown`
                      : isBrickOrBlockMaterial(formData.materialName)
                      ? 'Brick & Block Quantity Breakdown'
                      : 'Material Breakdown'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Table Container */}
              <div className="rounded-2xl border border-slate-300 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
                        {isSteelMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-36">Steel Type</th>
                            <th className="py-3 px-3">Length (ft)</th>
                            <th className="py-3 px-3">Weight (kg)</th>
                            <th className="py-3 px-3">Amount (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isRingMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-36">Ring Type</th>
                            <th className="py-3 px-3">Quantity (Pcs)</th>
                            <th className="py-3 px-3">Weight (kg)</th>
                            <th className="py-3 px-3">Amount (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isSandMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-40">Sand Type</th>
                            <th className="py-3 px-3">Quantity (Tons)</th>
                            <th className="py-3 px-3">Amount (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isBlueMetalMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-44">Material Type</th>
                            <th className="py-3 px-3">Quantity (Tons)</th>
                            <th className="py-3 px-3">Amount (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {isBrickOrBlockMaterial(formData.materialName) && (
                          <>
                            <th className="py-3 px-3 w-48">Material Type</th>
                            <th className="py-3 px-3">Quantity (Pieces)</th>
                            <th className="py-3 px-3">Amount (₹)</th>
                            <th className="py-3 px-2 w-12 text-center">Action</th>
                          </>
                        )}

                        {!isSteelMaterial(formData.materialName) &&
                          !isRingMaterial(formData.materialName) &&
                          !isSandMaterial(formData.materialName) &&
                          !isBlueMetalMaterial(formData.materialName) &&
                          !isBrickOrBlockMaterial(formData.materialName) && (
                            <>
                              <th className="py-3 px-3 w-44">Material</th>
                              <th className="py-3 px-3">Quantity</th>
                              <th className="py-3 px-3 w-28">Unit</th>
                              <th className="py-3 px-3">Amount (₹)</th>
                              <th className="py-3 px-2 w-12 text-center">Action</th>
                            </>
                          )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {materialItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* STEEL ROW */}
                          {isSteelMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <select
                                    value={item.steelType || '12 mm'}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'steelType', e.target.value)
                                    }
                                    className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                  >
                                    {STEEL_TYPES.map((st) => (
                                      <option key={st} value={st}>
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Rod length (ft)"
                                  value={item.length || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'length', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Weight (kg)"
                                  value={item.weight || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'weight', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* RINGS ROW */}
                          {isRingMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <select
                                    value={item.ringType || '8 mm'}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'ringType', e.target.value)
                                    }
                                    className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                  >
                                    {RING_TYPES.map((rt) => (
                                      <option key={rt} value={rt}>
                                        {rt}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Quantity (Pcs)"
                                  value={item.quantity || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Weight (kg)"
                                  value={item.weight || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'weight', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* SAND ROW */}
                          {isSandMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg block truncate">
                                  {item.sandType || formData.materialName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Quantity (Tons)"
                                  value={item.quantity || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* BLUE METAL ROW */}
                          {isBlueMetalMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg block truncate">
                                  {item.materialType || formData.materialName}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Quantity (Tons)"
                                  value={item.quantity || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* BRICKS & BLOCKS ROW */}
                          {isBrickOrBlockMaterial(formData.materialName) && (
                            <>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <select
                                    value={item.materialType || formData.materialName}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'materialType', e.target.value)
                                    }
                                    className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                  >
                                    {BRICK_BLOCK_TYPES.map((bt) => (
                                      <option key={bt} value={bt}>
                                        {bt}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown
                                    size={12}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Pieces"
                                  value={item.quantity || ''}
                                  onChange={(e) =>
                                    handleRowChange(item.id, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Amount"
                                    value={item.amount || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'amount', e.target.value)
                                    }
                                    className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </>
                          )}

                          {/* OTHER / GENERAL ROW */}
                          {!isSteelMaterial(formData.materialName) &&
                            !isRingMaterial(formData.materialName) &&
                            !isSandMaterial(formData.materialName) &&
                            !isBlueMetalMaterial(formData.materialName) &&
                            !isBrickOrBlockMaterial(formData.materialName) && (
                              <>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="text"
                                    placeholder="Material"
                                    value={item.material || formData.materialName}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'material', e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder="Quantity"
                                    value={item.quantity || ''}
                                    onChange={(e) =>
                                      handleRowChange(item.id, 'quantity', e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="relative">
                                    <select
                                      value={item.unit || 'Bags'}
                                      onChange={(e) =>
                                        handleRowChange(item.id, 'unit', e.target.value)
                                      }
                                      className="w-full appearance-none px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 pr-7 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                                    >
                                      <option value="Bags">Bags</option>
                                      <option value="Loads">Loads</option>
                                      <option value="Tons">Tons</option>
                                      <option value="Kg">Kg</option>
                                      <option value="Pieces">Pieces</option>
                                      <option value="Cu. ft">Cu. ft</option>
                                      <option value="Liters">Liters</option>
                                      <option value="Boxes">Boxes</option>
                                    </select>
                                    <ChevronDown
                                      size={12}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      step="any"
                                      placeholder="Amount"
                                      value={item.amount || ''}
                                      onChange={(e) =>
                                        handleRowChange(item.id, 'amount', e.target.value)
                                      }
                                      className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                                    />
                                  </div>
                                </td>
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRow(item.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete item"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </>
                            )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Summary */}
                <div className="px-4 py-3 bg-slate-100/90 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-slate-700 font-semibold">
                    Total Items entered: <strong className="text-slate-900 font-extrabold">{materialItems.length}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 font-bold">Table Total:</span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs">
                      ₹{' '}
                      {materialItems
                        .reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0)
                        .toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Purchase Details */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
              <ShoppingCart size={13} />
              <span>Purchase Details</span>
            </div>

            {formData.category === 'Materials' ? (
              /* For Materials: Material Breakdown table already contains Material, Quantity, Unit & Amounts, so only Supplier & Invoice details are needed */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Supplier / Vendor */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Supplier / Vendor
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. SM Traders"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Invoice / Bill No. */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Invoice / Bill No. <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FileSpreadsheet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. INV-1042 / Cash Memo"
                      value={formData.invoiceNo || ''}
                      onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* For Non-Materials (Labour, Rental, Other): show Quantity, Unit, Rate per unit */
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                {/* Supplier / Vendor */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Supplier / Vendor
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="SM Traders"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 pr-8 shadow-2xs cursor-pointer"
                    >
                      <option value="Days">Days</option>
                      <option value="Hours">Hours</option>
                      <option value="Loads">Loads</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Bags">Bags</option>
                      <option value="Tons">Tons</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Rate per Unit */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Rate per Unit (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                    <input
                      type="number"
                      placeholder="420"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Additional Expenses */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
              <Truck size={13} />
              <span>Additional Expenses</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
              {/* Transportation / Vehicle Rental Header */}
              <div>
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Truck size={15} className="text-emerald-600" />
                  <span>Transportation / Vehicle Rental</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Vehicle used to carry and transport the materials to site
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Vehicle Type
                  </label>
                  <div className="relative">
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer shadow-2xs"
                    >
                      <option value="Tata Ace / Mini Truck">Tata Ace / Mini Truck</option>
                      <option value="Pickup / Bolero Truck">Pickup / Bolero Truck</option>
                      <option value="Tipper / Dumper">Tipper / Dumper</option>
                      <option value="Tractor">Tractor</option>
                      <option value="6-Wheeler Lorry">6-Wheeler Lorry</option>
                      <option value="10-Wheeler Lorry">10-Wheeler Lorry</option>
                      <option value="Auto / 3-Wheeler">Auto / 3-Wheeler</option>
                      <option value="Other Vehicle">Other Vehicle</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Rental Amount (₹) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Rental Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.rentalAmount}
                      onChange={(e) => setFormData({ ...formData, rentalAmount: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 mb-2.5">
                  <Coins size={15} className="text-amber-500" />
                  <span>Tips</span>
                </div>

                <div className="max-w-sm">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Tips Amount (₹) <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={formData.tipsAmount}
                      onChange={(e) => setFormData({ ...formData, tipsAmount: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Expense Calculation */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
              <Calculator size={13} />
              <span>Expense Calculation</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-300 shadow-xs space-y-4">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Expense Summary
              </div>

              {/* Summary Items */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold">Material Cost</span>
                  <span className="font-extrabold text-slate-900">
                    ₹ {materialCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold">Vehicle Rental</span>
                  <span className="font-extrabold text-slate-900">
                    ₹ {vehicleRental.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold">Tips</span>
                  <span className="font-extrabold text-slate-900">
                    ₹ {tips.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Total Expense Amount Prominent Highlight */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between px-4 py-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300">
                <div>
                  <div className="text-xs font-black text-emerald-950">Total Expense Amount</div>
                  <div className="text-[11px] text-emerald-800 font-semibold">Material Cost + Vehicle Rental + Tips</div>
                </div>
                <span className="text-xl font-black text-emerald-950 tracking-tight">
                  ₹ {totalExpenseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Billing Amount (Editable) */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Billing Amount (Editable)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-500">₹</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter billing amount..."
                    value={formData.billingAmount}
                    onChange={(e) => setFormData({ ...formData, billingAmount: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  Manually enter the amount to be billed. This field should remain empty by default and must not be automatically populated.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Information */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold">
              <CreditCard size={13} />
              <span>Payment Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method Radio Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  {/* Cash Option */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'Cash' })}
                    className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'Cash'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                        : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    {formData.paymentMethod === 'Cash' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-400 shrink-0" />
                    )}
                    <Banknote size={15} />
                    <span className="text-xs font-bold">Cash</span>
                  </div>

                  {/* UPI Option */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                    className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      formData.paymentMethod === 'UPI'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold'
                        : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium'
                    }`}
                  >
                    {formData.paymentMethod === 'UPI' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-600 text-white shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-400 shrink-0" />
                    )}
                    <Send size={14} className="rotate-45" />
                    <span className="text-xs font-bold">UPI</span>
                  </div>
                </div>
              </div>

              {/* Payment Status Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Payment Status <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CheckCircle2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="w-full appearance-none pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Transaction ID & Payment Screenshot (Both Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Transaction ID Text Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Transaction ID <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. UPI / Ref / TXN-2026110199"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">UPI reference or bank transaction number</p>
              </div>

              {/* Payment Screenshot Image Upload Field */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Payment Screenshot <span className="text-slate-500 font-normal">(Optional)</span>
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
                    className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl text-xs cursor-pointer transition-colors group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                      <Upload size={14} />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-bold text-slate-800 group-hover:text-emerald-700">Upload screenshot</div>
                      <div className="text-[11px] text-slate-500 truncate">PNG, JPG or receipt photo</div>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-emerald-50/70 border border-emerald-300 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={screenshotPreview}
                        alt="Screenshot Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-300 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{screenshotName || 'Screenshot uploaded'}</div>
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                          <CheckCircle2 size={12} />
                          <span>Ready</span>
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
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
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Notes (Optional)
              </label>
              <div className="relative">
                <FileEdit size={14} className="absolute left-3 top-3 text-slate-500" />
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes here..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none shadow-2xs"
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
