import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  Box,
  Layers,
  Wrench,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  CheckCircle,
  History,
  Building2,
  Calendar,
  Filter,
} from 'lucide-react';
import AddStockInwardModal from '../components/AddStockInwardModal';
import IssueStockModal from '../components/IssueStockModal';

export default function Godown() {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'movements'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedMaterialForAction, setSelectedMaterialForAction] = useState(null);

  // Construction Sites (for Issue modal)
  const sites = [
    { code: 'KS-001', name: 'Green Villa', location: 'Chennai' },
    { code: 'KS-002', name: 'Office Renovation', location: 'Madurai' },
    { code: 'KS-004', name: 'RK Residence', location: 'Tirunelveli' },
    { code: 'KS-005', name: 'Metro Apartment', location: 'Chennai' },
  ];

  // Core Materials Inventory (Construction Materials)
  const [inventory, setInventory] = useState([
    {
      id: 'GD-MAT-001',
      name: 'Cement',
      category: 'Cement',
      unit: 'Bags',
      totalPurchased: 500,
      totalIssued: 150,
      availableQuantity: 350,
      minStockLevel: 50,
      iconType: 'package',
    },
    {
      id: 'GD-MAT-002',
      name: 'M-Sand',
      category: 'Sand',
      unit: 'Tons',
      totalPurchased: 120,
      totalIssued: 85,
      availableQuantity: 35,
      minStockLevel: 10,
      iconType: 'layers',
    },
    {
      id: 'GD-MAT-003',
      name: 'P-Sand',
      category: 'Sand',
      unit: 'Tons',
      totalPurchased: 80,
      totalIssued: 52,
      availableQuantity: 28,
      minStockLevel: 10,
      iconType: 'layers',
    },
    {
      id: 'GD-MAT-004',
      name: '20 mm Blue Metal',
      category: 'Aggregates',
      unit: 'Tons',
      totalPurchased: 95,
      totalIssued: 60,
      availableQuantity: 35,
      minStockLevel: 15,
      iconType: 'box',
    },
    {
      id: 'GD-MAT-005',
      name: '40 mm Blue Metal',
      category: 'Aggregates',
      unit: 'Tons',
      totalPurchased: 60,
      totalIssued: 42,
      availableQuantity: 18,
      minStockLevel: 10,
      iconType: 'box',
    },
    {
      id: 'GD-MAT-006',
      name: 'Steel',
      category: 'Steel',
      unit: 'Kg',
      totalPurchased: 8500,
      totalIssued: 5200,
      availableQuantity: 3300,
      minStockLevel: 1000,
      iconType: 'wrench',
    },
    {
      id: 'GD-MAT-007',
      name: 'Rings',
      category: 'Steel',
      unit: 'Kg',
      totalPurchased: 1200,
      totalIssued: 750,
      availableQuantity: 450,
      minStockLevel: 150,
      iconType: 'wrench',
    },
    {
      id: 'GD-MAT-008',
      name: 'Chamber Bricks',
      category: 'Bricks',
      unit: 'Pieces',
      totalPurchased: 15000,
      totalIssued: 9500,
      availableQuantity: 5500,
      minStockLevel: 2000,
      iconType: 'grid',
    },
    {
      id: 'GD-MAT-009',
      name: 'Fly Ash Bricks',
      category: 'Bricks',
      unit: 'Pieces',
      totalPurchased: 10000,
      totalIssued: 6200,
      availableQuantity: 3800,
      minStockLevel: 1500,
      iconType: 'grid',
    },
    {
      id: 'GD-MAT-010',
      name: 'Solid Block – 6 Inch',
      category: 'Blocks',
      unit: 'Pieces',
      totalPurchased: 4500,
      totalIssued: 3100,
      availableQuantity: 1400,
      minStockLevel: 500,
      iconType: 'grid',
    },
    {
      id: 'GD-MAT-011',
      name: 'Solid Block – 4 Inch',
      category: 'Blocks',
      unit: 'Pieces',
      totalPurchased: 3000,
      totalIssued: 1800,
      availableQuantity: 1200,
      minStockLevel: 500,
      iconType: 'grid',
    },
    {
      id: 'GD-MAT-012',
      name: 'Chengal Brick (Red Brick)',
      category: 'Bricks',
      unit: 'Pieces',
      totalPurchased: 12000,
      totalIssued: 8000,
      availableQuantity: 4000,
      minStockLevel: 2000,
      iconType: 'grid',
    },
    {
      id: 'GD-MAT-013',
      name: 'Cement Brick',
      category: 'Bricks',
      unit: 'Pieces',
      totalPurchased: 5000,
      totalIssued: 3500,
      availableQuantity: 1500,
      minStockLevel: 800,
      iconType: 'grid',
    },
    {
      id: 'GD-MAT-014',
      name: 'AAC Block',
      category: 'Blocks',
      unit: 'Pieces',
      totalPurchased: 2500,
      totalIssued: 1600,
      availableQuantity: 900,
      minStockLevel: 300,
      iconType: 'grid',
    },
    {
      id: 'GD-MAT-015',
      name: 'AAC Paste',
      category: 'Paste',
      unit: 'Bags',
      totalPurchased: 150,
      totalIssued: 90,
      availableQuantity: 60,
      minStockLevel: 20,
      iconType: 'package',
    },
  ]);

  // Live Recent Stock Movements History (Inward & Outward Site Dispatches)
  const [recentMovements, setRecentMovements] = useState([
    {
      id: 'MOV-101',
      type: 'OUTWARD',
      materialName: 'Cement',
      category: 'Cement',
      quantity: 50,
      unit: 'Bags',
      siteName: 'Green Villa (KS-001)',
      date: '2026-11-04',
      issuedTo: 'Muthu (Supervisor)',
      remarks: 'Pillar concrete casting',
    },
    {
      id: 'MOV-102',
      type: 'INWARD',
      materialName: 'M-Sand',
      category: 'Sand',
      quantity: 20,
      unit: 'Tons',
      siteName: 'Main Yard Godown',
      date: '2026-11-03',
      issuedTo: 'Store Incharge',
      remarks: 'Fresh batch received',
    },
    {
      id: 'MOV-103',
      type: 'OUTWARD',
      materialName: 'Steel',
      category: 'Steel',
      quantity: 800,
      unit: 'Kg',
      siteName: 'Office Renovation (KS-002)',
      date: '2026-11-03',
      issuedTo: 'Ramesh (Site Engg)',
      remarks: 'Beam reinforcement bars',
    },
    {
      id: 'MOV-104',
      type: 'OUTWARD',
      materialName: 'Solid Block – 6 Inch',
      category: 'Blocks',
      quantity: 400,
      unit: 'Pieces',
      siteName: 'RK Residence (KS-004)',
      date: '2026-11-02',
      issuedTo: 'Suresh (Supervisor)',
      remarks: 'Ground floor brick work',
    },
    {
      id: 'MOV-105',
      type: 'INWARD',
      materialName: 'Cement',
      category: 'Cement',
      quantity: 100,
      unit: 'Bags',
      siteName: 'Main Yard Godown',
      date: '2026-11-01',
      issuedTo: 'Godown Manager',
      remarks: 'UltraTech direct inward',
    },
  ]);

  // Unique Categories
  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.category)));
  }, [inventory]);

  // Stock status helper
  const getStockStatus = (available, minLevel) => {
    if (available <= 0) return 'Out of Stock';
    if (available <= minLevel) return 'Low Stock';
    return 'In Stock';
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalMaterials = inventory.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    inventory.forEach((item) => {
      const status = getStockStatus(item.availableQuantity, item.minStockLevel);
      if (status === 'In Stock') inStockCount++;
      else if (status === 'Low Stock') lowStockCount++;
      else outOfStockCount++;
    });

    return { totalMaterials, inStockCount, lowStockCount, outOfStockCount };
  }, [inventory]);

  // Helper for material icon
  const renderMaterialIcon = (category, type) => {
    if (category === 'Cement' || category === 'Paste' || type === 'package') {
      return <Package size={17} />;
    }
    if (category === 'Sand' || type === 'layers') {
      return <Layers size={17} />;
    }
    if (category === 'Aggregates' || type === 'box') {
      return <Box size={17} />;
    }
    if (category === 'Steel' || type === 'wrench') {
      return <Wrench size={17} />;
    }
    if (category === 'Bricks' || category === 'Blocks' || type === 'grid') {
      return <LayoutGrid size={17} />;
    }
    return <Package size={17} />;
  };

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const currentStatus = getStockStatus(item.availableQuantity, item.minStockLevel);
      const matchesStatus =
        selectedStatus === 'All' || currentStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, searchQuery, selectedCategory, selectedStatus]);

  // Save Inward Stock
  const handleSaveInward = (inwardData) => {
    const existingIndex = inventory.findIndex(
      (m) => m.name.toLowerCase() === inwardData.materialName.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated = [...inventory];
      const existing = updated[existingIndex];
      const newPurchased = existing.totalPurchased + inwardData.quantity;
      const newAvailable = existing.availableQuantity + inwardData.quantity;

      updated[existingIndex] = {
        ...existing,
        totalPurchased: newPurchased,
        availableQuantity: newAvailable,
      };
      setInventory(updated);
    } else {
      const newMat = {
        id: `GD-MAT-${String(inventory.length + 1).padStart(3, '0')}`,
        name: inwardData.materialName,
        category: inwardData.category || 'General',
        unit: inwardData.unit || 'Nos',
        totalPurchased: inwardData.quantity,
        totalIssued: 0,
        availableQuantity: inwardData.quantity,
        minStockLevel: inwardData.minStockLevel || 10,
        iconType: 'package',
      };
      setInventory([newMat, ...inventory]);
    }

    // Append to live movements log
    const newMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      type: 'INWARD',
      materialName: inwardData.materialName,
      category: inwardData.category || 'General',
      quantity: inwardData.quantity,
      unit: inwardData.unit || 'Units',
      siteName: 'Main Yard Godown',
      date: inwardData.date || new Date().toISOString().split('T')[0],
      issuedTo: 'Godown Inward Desk',
      remarks: inwardData.remarks || 'Stock added to warehouse',
    };
    setRecentMovements((prev) => [newMovement, ...prev]);
  };

  // Issue Stock to Site
  const handleIssueStock = (issueData) => {
    const existingIndex = inventory.findIndex(
      (m) => m.name.toLowerCase() === issueData.materialName.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated = [...inventory];
      const existing = updated[existingIndex];
      const newIssued = existing.totalIssued + issueData.quantity;
      const newAvailable = Math.max(0, existing.availableQuantity - issueData.quantity);

      updated[existingIndex] = {
        ...existing,
        totalIssued: newIssued,
        availableQuantity: newAvailable,
      };
      setInventory(updated);
    }

    // Append to live movements log
    const newMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      type: 'OUTWARD',
      materialName: issueData.materialName,
      category: issueData.category || 'General',
      quantity: issueData.quantity,
      unit: issueData.unit || 'Units',
      siteName: issueData.siteName || issueData.projectLabel || 'Site',
      date: issueData.date || new Date().toISOString().split('T')[0],
      issuedTo: issueData.issuedTo || 'Site Incharge',
      remarks: issueData.remarks || 'Dispatched to project',
    };
    setRecentMovements((prev) => [newMovement, ...prev]);
  };

  // Render individual card (ONLY Material Name and Current Stock)
  const renderStockCard = (item) => {
    const status = getStockStatus(item.availableQuantity, item.minStockLevel);
    return (
      <div
        key={item.id}
        className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all group"
      >
        {/* Left: Material Icon & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {renderMaterialIcon(item.category, item.iconType)}
          </div>
          <div className="min-w-0">
            <h3
              className="font-bold text-slate-900 text-xs md:text-sm truncate"
              title={item.name}
            >
              {item.name}
            </h3>
            <span className="inline-block text-[10px] font-bold text-slate-600 mt-0.5">
              {item.category}
            </span>
          </div>
        </div>

        {/* Right: ONLY Current Stock Quantity */}
        <div className="text-right shrink-0">
          <div className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider leading-tight">
            STOCK
          </div>
          <div
            className={`text-sm md:text-base font-black leading-snug ${
              item.availableQuantity > 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {item.availableQuantity.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-bold text-slate-700">{item.unit}</span>
          </div>
          <div className="mt-0.5">
            {status === 'In Stock' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                Available
              </span>
            )}
            {status === 'Low Stock' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                Low Stock
              </span>
            )}
            {status === 'Out of Stock' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700" />
                Nil Stock
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-7 space-y-5 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Warehouse size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Godown Management
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 rounded-full uppercase">
                Central Warehouse
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live material stock count and site dispatch tracking.
            </p>
          </div>
        </div>

        {/* Action Buttons: Stock Inward & Issue Stock */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setSelectedMaterialForAction(null);
              setIsInwardModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowDownLeft size={16} />
            <span>Stock Inward</span>
          </button>

          <button
            onClick={() => {
              setSelectedMaterialForAction(null);
              setIsIssueModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#0072ff] hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowUpRight size={16} />
            <span>Issue Stock (Outward)</span>
          </button>
        </div>
      </div>

      {/* 2. Warehouse Overview KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Materials
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {stats.totalMaterials}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Active items tracked
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Sufficient Stock
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {stats.inStockCount}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Ready for dispatch
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'Low Stock' ? 'All' : 'Low Stock')}
          className={`bg-white rounded-2xl border p-4 shadow-2xs cursor-pointer transition-all ${
            selectedStatus === 'Low Stock'
              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {stats.lowStockCount}
          </div>
          <div className="text-[11px] text-amber-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>Needs replenishment</span>
            <span className="text-[10px] text-amber-900 font-bold underline">
              {selectedStatus === 'Low Stock' ? '(Reset)' : '(Filter)'}
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('movements')}
          className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-4 shadow-2xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Stock Movements
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {recentMovements.length}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-0.5 flex items-center gap-1">
            <span>Recent logs recorded</span>
            <span className="text-[10px] underline">View log &rarr;</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation View Switcher (Inventory vs Movements Log) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Package size={15} />
            <span>Stock Inventory</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'inventory' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {inventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'movements'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <History size={15} />
            <span>Recent Stock Movements</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'movements' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {recentMovements.length}
            </span>
          </button>
        </div>

        {/* Quick Category filter tabs for fast selection */}
        {activeTab === 'inventory' && (
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* 4. Top "Materials Stock" Visual Cards Grid (Shows ONLY Material Name & Current Stock) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                  Materials Stock
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  ({filteredInventory.length} items)
                </span>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Current available quantity for each material
              </span>
            </div>

            {/* Grid of Material Cards */}
            {filteredInventory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No materials match your search or filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {filteredInventory.map(renderStockCard)}
              </div>
            )}
          </div>

          {/* 5. Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search material name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5">
              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* 6. Simplified Essential Materials Stock Table (Total Purchased & Issued to Sites REMOVED) */}
          <div className="bg-white rounded-3xl border border-slate-300 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Material Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Current Stock</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        <Package size={32} className="mx-auto mb-2 text-slate-300" />
                        <div className="font-bold text-slate-700 text-sm">
                          No materials found
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Try adjusting your search query or filters
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item, idx) => {
                      const status = getStockStatus(item.availableQuantity, item.minStockLevel);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Row Number */}
                          <td className="py-3.5 px-4 text-center text-slate-500 font-bold">
                            {idx + 1}
                          </td>

                          {/* Material Name with Icon */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
                                {renderMaterialIcon(item.category, item.iconType)}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 text-xs md:text-sm">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {item.category}
                            </span>
                          </td>

                          {/* Current Stock */}
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`font-black text-sm md:text-base ${
                                item.availableQuantity > 0
                                  ? 'text-slate-950'
                                  : 'text-rose-600'
                              }`}
                            >
                              {item.availableQuantity.toLocaleString('en-IN')}
                            </span>{' '}
                            <span className="text-xs font-bold text-slate-600">
                              {item.unit}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            {status === 'In Stock' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                <span>In Stock</span>
                              </span>
                            )}
                            {status === 'Low Stock' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                <span>Low Stock</span>
                              </span>
                            )}
                            {status === 'Out of Stock' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-800 border border-rose-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                <span>Out of Stock</span>
                              </span>
                            )}
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMaterialForAction(item);
                                  setIsInwardModalOpen(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-xs font-bold cursor-pointer"
                                title="Inward Stock"
                              >
                                <ArrowDownLeft size={13} className="text-emerald-600" />
                                <span>Inward</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedMaterialForAction(item);
                                  setIsIssueModalOpen(true);
                                }}
                                disabled={item.availableQuantity <= 0}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                                  item.availableQuantity <= 0
                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50'
                                    : 'border-slate-300 text-slate-700 hover:text-blue-800 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                                title="Issue Stock to Site"
                              >
                                <ArrowUpRight size={13} className="text-blue-600" />
                                <span>Issue</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600 font-medium">
              <span>
                Showing {filteredInventory.length} of {inventory.length} materials in godown
              </span>
              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white cursor-pointer">
                  <ChevronLeft size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#008744] text-white font-bold text-xs shadow-xs">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white cursor-pointer">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 7. Recent Stock Movements Timeline View */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
                Recent Stock Movements Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of all incoming material deliveries and outgoing site dispatches.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Live Sync
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Material</th>
                  <th className="py-3.5 px-4 text-right">Quantity</th>
                  <th className="py-3.5 px-4">Destination / Source</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Handled By</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentMovements.map((mov, idx) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-500 font-bold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      {mov.type === 'INWARD' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ArrowDownLeft size={11} />
                          INWARD
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                          <ArrowUpRight size={11} />
                          OUTWARD
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {mov.materialName}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-black text-slate-950">
                        {mov.type === 'INWARD' ? `+${mov.quantity}` : `-${mov.quantity}`}
                      </span>{' '}
                      <span className="text-[11px] font-bold text-slate-600">{mov.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{mov.siteName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{mov.date}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {mov.issuedTo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                      {mov.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddStockInwardModal
        isOpen={isInwardModalOpen}
        onClose={() => {
          setIsInwardModalOpen(false);
          setSelectedMaterialForAction(null);
        }}
        onSaveInward={handleSaveInward}
        materials={inventory}
        categories={categories}
      />

      <IssueStockModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedMaterialForAction(null);
        }}
        onIssueStock={handleIssueStock}
        materials={inventory}
        sites={sites}
      />
    </div>
  );
}
