import React, { useState, useMemo, useEffect } from 'react';
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
import { INITIAL_MATERIALS } from '../constants/materialsData';
import { godownApi, siteApi, materialApi } from '../services/api';

export default function Godown({
  materials: externalMaterials,
  setMaterials: externalSetMaterials,
}) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'movements'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedMaterialForAction, setSelectedMaterialForAction] = useState(null);

  // Construction Sites (for Issue modal)
  const [sites, setSites] = useState([]);

  // Core Materials Inventory (Directly Connected with Master Data)
  const [internalMaterials, setInternalMaterials] = useState(INITIAL_MATERIALS);
  const rawMaterials = externalMaterials || internalMaterials;
  const setRawMaterials = externalSetMaterials || setInternalMaterials;

  // Live Recent Stock Movements History (Inward & Outward Site Dispatches)
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    loadGodownData();
  }, []);

  const loadGodownData = async () => {
    try {
      const [stocksRes, movementsRes, sitesRes] = await Promise.allSettled([
        godownApi.getStocks(),
        godownApi.getMovements(),
        siteApi.getAll(),
      ]);

      if (stocksRes.status === 'fulfilled' && stocksRes.value?.data?.length > 0) {
        const stocks = stocksRes.value.data.map((s) => ({
          id: s.materialId || s.stockId,
          _id: s.materialId,
          code: s.code,
          name: s.name,
          category: s.category,
          unit: s.unit,
          price: s.defaultPrice || 0,
          stock: s.currentStock,
          availableQuantity: s.currentStock,
          minStockLevel: s.reorderLevel || 10,
          minStock: s.reorderLevel || 10,
          status: s.status || 'Active',
          image: s.imageUrl || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        }));
        setRawMaterials(stocks);
      }

      if (movementsRes.status === 'fulfilled') {
        const moves = movementsRes.value?.data || movementsRes.value || [];
        if (moves.length > 0) {
          setRecentMovements(
            moves.map((m, idx) => ({
              id: m._id ? `MOV-${m._id.slice(-4)}` : `MOV-${idx + 1}`,
              type: m.movementType || 'INWARD',
              materialName: m.material?.name || m.materialName || 'Material',
              category: m.material?.category || m.category || 'General',
              quantity: m.quantity || 0,
              unit: m.unit || m.material?.unit || 'Units',
              siteName: m.site?.name ? `${m.site.name} (${m.site.code || ''})` : (m.movementType === 'INWARD' ? 'Main Yard Godown' : 'Site'),
              date: m.date ? new Date(m.date).toLocaleDateString('en-IN') : 'Recent',
              issuedTo: m.receivedBy || m.supplierName || 'Supervisor',
              remarks: m.notes || '-',
            }))
          );
        }
      }

      if (sitesRes.status === 'fulfilled') {
        const sList = sitesRes.value?.data || sitesRes.value || [];
        setSites(sList);
      }
    } catch (err) {
      console.warn('Could not fetch godown data from backend:', err.message);
    }
  };

  // Normalized inventory ensuring availableQuantity, stock, and minStockLevel are always synchronized
  const inventory = useMemo(() => {
    return rawMaterials.map((m) => ({
      ...m,
      availableQuantity: m.availableQuantity ?? m.stock ?? 0,
      stock: m.stock ?? m.availableQuantity ?? 0,
      minStockLevel: m.minStockLevel ?? m.minStock ?? 10,
      totalPurchased: m.totalPurchased ?? ((m.stock || 0) + 100),
      totalIssued: m.totalIssued ?? 50,
    }));
  }, [rawMaterials]);

  // Unique Categories
  const categories = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.category).filter(Boolean)));
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
    const query = searchQuery.toLowerCase();
    return inventory.filter((item) => {
      const name = String(item.name || '').toLowerCase();
      const cat = String(item.category || '').toLowerCase();
      const codeOrId = String(item.code || item.id || '').toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        cat.includes(query) ||
        codeOrId.includes(query);

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const currentStatus = getStockStatus(item.availableQuantity, item.minStockLevel);
      const matchesStatus =
        selectedStatus === 'All' || currentStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventory, searchQuery, selectedCategory, selectedStatus]);

  // Save Inward Stock (Updates Master Material Stock & Logs Movement)
  const handleSaveInward = async (inwardData) => {
    const existing = rawMaterials.find(
      (m) => m.name.toLowerCase() === inwardData.materialName.toLowerCase()
    );

    const addQty = parseFloat(inwardData.quantity) || 0;

    try {
      let materialId = existing?._id || existing?.id;
      if (!materialId || String(materialId).startsWith('MAT-')) {
        // Create material in master catalog first if not already saved in MongoDB
        const newMatRes = await materialApi.create({
          name: inwardData.materialName,
          category: inwardData.category || 'General',
          unit: inwardData.unit || 'Bags',
          defaultPrice: inwardData.price || 0,
        }).catch(() => null);
        if (newMatRes?.data?._id) {
          materialId = newMatRes.data._id;
        }
      }

      if (materialId && !String(materialId).startsWith('MAT-')) {
        await godownApi.recordInward({
          materialId,
          quantity: addQty,
          unit: inwardData.unit,
          unitPrice: inwardData.price || 0,
          supplierName: 'Godown Inward Desk',
          notes: inwardData.remarks || 'Stock received in godown',
          date: inwardData.date,
        });
        await loadGodownData();
        return;
      }
    } catch (err) {
      console.warn('API godown inward fallback:', err.message);
    }

    // Fallback local update
    const existingIndex = rawMaterials.findIndex(
      (m) => m.name.toLowerCase() === inwardData.materialName.toLowerCase()
    );

    if (existingIndex >= 0) {
      setRawMaterials((prev) => {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const currentQty = existing.availableQuantity ?? existing.stock ?? 0;
        const newPurchased = (existing.totalPurchased || 0) + addQty;
        const newAvailable = currentQty + addQty;

        updated[existingIndex] = {
          ...existing,
          totalPurchased: newPurchased,
          availableQuantity: newAvailable,
          stock: newAvailable,
        };
        return updated;
      });
    } else {
      const newMat = {
        id: `MAT-${Date.now().toString().slice(-4)}`,
        name: inwardData.materialName,
        category: inwardData.category || 'General',
        unit: inwardData.unit || 'Bags',
        price: inwardData.price || 0,
        totalPurchased: addQty,
        totalIssued: 0,
        availableQuantity: addQty,
        stock: addQty,
        minStockLevel: inwardData.minStockLevel || 10,
        minStock: inwardData.minStockLevel || 10,
        status: 'Active',
        image:
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        description: 'New stock added directly via Godown inward.',
      };
      setRawMaterials((prev) => [newMat, ...prev]);
    }

    const newMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      type: 'INWARD',
      materialName: inwardData.materialName,
      category: inwardData.category || 'General',
      quantity: addQty,
      unit: inwardData.unit || 'Units',
      siteName: 'Main Yard Godown',
      date: inwardData.date || new Date().toISOString().split('T')[0],
      issuedTo: 'Godown Inward Desk',
      remarks: inwardData.remarks || 'Stock added to warehouse',
    };
    setRecentMovements((prev) => [newMovement, ...prev]);
  };

  // Issue Stock to Site (Reduces Godown Stock & Logs Outward Movement)
  const handleIssueStock = async (issueData) => {
    const existing = rawMaterials.find(
      (m) => m.name.toLowerCase() === issueData.materialName.toLowerCase()
    );

    const issueQty = parseFloat(issueData.quantity) || 0;
    const materialId = existing?._id || existing?.id;
    const targetSite = sites.find((s) => s.code === issueData.siteCode || s.name === issueData.siteName) || sites[0];

    try {
      if (materialId && !String(materialId).startsWith('MAT-') && targetSite?._id) {
        await godownApi.recordOutward({
          materialId,
          siteId: targetSite._id,
          quantity: issueQty,
          receivedBy: issueData.issuedTo || 'Site Incharge',
          notes: issueData.remarks || `Dispatched to ${targetSite.name}`,
          date: issueData.date,
        });
        await loadGodownData();
        return;
      }
    } catch (err) {
      console.warn('API godown outward fallback:', err.message);
    }

    // Fallback local update
    const existingIndex = rawMaterials.findIndex(
      (m) => m.name.toLowerCase() === issueData.materialName.toLowerCase()
    );

    if (existingIndex >= 0) {
      setRawMaterials((prev) => {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const currentQty = existing.availableQuantity ?? existing.stock ?? 0;
        const newIssued = (existing.totalIssued || 0) + issueQty;
        const newAvailable = Math.max(0, currentQty - issueQty);

        updated[existingIndex] = {
          ...existing,
          totalIssued: newIssued,
          availableQuantity: newAvailable,
          stock: newAvailable,
        };
        return updated;
      });
    }

    const newMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      type: 'OUTWARD',
      materialName: issueData.materialName,
      category: issueData.category || 'General',
      quantity: issueQty,
      unit: issueData.unit || 'Units',
      siteName: issueData.siteName || issueData.projectLabel || 'Site',
      date: issueData.date || new Date().toISOString().split('T')[0],
      issuedTo: issueData.issuedTo || 'Site Incharge',
      remarks: issueData.remarks || 'Dispatched to project',
    };
    setRecentMovements((prev) => [newMovement, ...prev]);
  };

  // Render individual card: Full background image + hover reveals Inward & Outward buttons
  const renderStockCard = (item) => {
    const currentQty = item.availableQuantity ?? item.stock ?? 0;
    const minLevel = item.minStockLevel ?? item.minStock ?? 10;
    const status = getStockStatus(currentQty, minLevel);

    return (
      <div
        key={item.id}
        className="relative overflow-hidden rounded-2xl min-h-[155px] flex flex-col justify-between p-4 group border border-slate-700/40 shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-900"
      >
        {/* Full Image Background */}
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Gradient Overlay for high-contrast text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/45 group-hover:from-slate-950/98 group-hover:via-slate-950/80 transition-all duration-300 pointer-events-none" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20 shadow-xs">
            {item.category}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-md shadow-xs ${
              item.status === 'Inactive'
                ? 'bg-rose-950/85 text-rose-300 border border-rose-500/40'
                : status === 'In Stock'
                ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-500/40'
                : status === 'Low Stock'
                ? 'bg-amber-950/85 text-amber-300 border border-amber-500/40'
                : 'bg-rose-950/85 text-rose-300 border border-rose-500/40'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.status === 'Inactive'
                  ? 'bg-rose-400'
                  : status === 'In Stock'
                  ? 'bg-emerald-400'
                  : status === 'Low Stock'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            {item.status === 'Inactive' ? 'Inactive' : status === 'In Stock' ? 'Available' : status}
          </span>
        </div>

        {/* Bottom Info: Material Name & Current Stock ONLY */}
        <div className="relative z-10 pt-4">
          <h3
            className="text-white font-extrabold text-sm md:text-base tracking-tight truncate drop-shadow-sm"
            title={item.name}
          >
            {item.name}
          </h3>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Current Stock
            </span>
            <span
              className={`text-sm md:text-base font-black ${
                currentQty > 0 ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              {currentQty.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-bold text-slate-200">{item.unit}</span>
            </span>
          </div>
        </div>

        {/* Hover Action Overlay: Inward & Outward Buttons */}
        <div className="absolute inset-0 z-20 bg-slate-950/88 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2 p-3">
          <span className="text-xs font-extrabold text-white text-center truncate max-w-full px-1">
            {item.name}
          </span>
          <div className="flex items-center gap-2 w-full justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMaterialForAction(item);
                setIsInwardModalOpen(true);
              }}
              disabled={item.status === 'Inactive'}
              className="flex-1 max-w-[110px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-[11px] font-extrabold shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Stock Inward"
            >
              <ArrowDownLeft size={14} />
              <span>+ Inward</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMaterialForAction(item);
                setIsIssueModalOpen(true);
              }}
              disabled={item.status === 'Inactive' || currentQty <= 0}
              className="flex-1 max-w-[110px] flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white text-[11px] font-extrabold shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Issue Stock (Outward)"
            >
              <ArrowUpRight size={14} />
              <span>→ Issue</span>
            </button>
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

                          {/* Material Name with Photo */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src =
                                        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600">
                                    {renderMaterialIcon(item.category, item.iconType)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-900 text-xs md:text-sm block">
                                  {item.name}
                                </span>
                                {item.status === 'Inactive' && (
                                  <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1 rounded border border-rose-200 inline-block mt-0.5">
                                    Discontinued
                                  </span>
                                )}
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

      {/* Modals - Passing only Active materials for new stock operations */}
      <AddStockInwardModal
        isOpen={isInwardModalOpen}
        onClose={() => {
          setIsInwardModalOpen(false);
          setSelectedMaterialForAction(null);
        }}
        onSaveInward={handleSaveInward}
        initialMaterial={selectedMaterialForAction}
        materials={inventory.filter((m) => m.status !== 'Inactive')}
        categories={categories}
      />

      <IssueStockModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedMaterialForAction(null);
        }}
        onIssueStock={handleIssueStock}
        initialMaterial={selectedMaterialForAction}
        materials={inventory.filter((m) => m.status !== 'Inactive')}
        sites={sites}
      />
    </div>
  );
}
