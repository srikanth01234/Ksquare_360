import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Download,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Eye,
  Edit2,
  ArrowUpDown,
  Truck,
  RotateCw,
} from 'lucide-react';
import AddStockInwardModal from '../components/AddStockInwardModal';
import IssueStockModal from '../components/IssueStockModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import AddGodownMaterialModal from '../components/AddGodownMaterialModal';

export default function Godown() {
  const [activeTab, setActiveTab] = useState('Stock Overview'); // 'Stock Overview' | 'Movement History' | 'Low Stock Alerts'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [historyTypeFilter, setHistoryTypeFilter] = useState('All');

  // Modals
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);

  // Material Categories
  const [categories, setCategories] = useState([
    'Cement',
    'M-Sand',
    'P-Sand',
    'River Sand',
    'Steel',
    'Bricks',
    'Aggregate',
    'Gravel',
    'Concrete',
    'Pipes',
    'Other Materials',
  ]);

  // Construction Sites (Integrated with existing active sites)
  const sites = [
    { code: 'KS-001', name: 'Green Villa', location: 'Chennai' },
    { code: 'KS-002', name: 'Office Renovation', location: 'Madurai' },
    { code: 'KS-004', name: 'RK Residence', location: 'Tirunelveli' },
    { code: 'KS-005', name: 'Metro Apartment', location: 'Chennai' },
  ];

  // Core Inventory Data
  const [inventory, setInventory] = useState([
    {
      id: 'GD-MAT-001',
      name: 'Cement (OPC 53)',
      category: 'Cement',
      unit: 'Bags',
      openingStock: 0,
      totalPurchased: 500,
      totalIssued: 150,
      adjustments: 0,
      availableQuantity: 350,
      minStockLevel: 100,
      rate: 420,
      godownLocation: 'Bay A - Main Yard',
      lastUpdated: '02 Nov 2026',
    },
    {
      id: 'GD-MAT-002',
      name: 'M-Sand',
      category: 'M-Sand',
      unit: 'Loads',
      openingStock: 2,
      totalPurchased: 15,
      totalIssued: 5,
      adjustments: 0,
      availableQuantity: 12,
      minStockLevel: 5,
      rate: 5500,
      godownLocation: 'Yard B - Sand Pit',
      lastUpdated: '01 Nov 2026',
    },
    {
      id: 'GD-MAT-003',
      name: 'P-Sand',
      category: 'P-Sand',
      unit: 'Loads',
      openingStock: 1,
      totalPurchased: 10,
      totalIssued: 3,
      adjustments: 0,
      availableQuantity: 8,
      minStockLevel: 4,
      rate: 6500,
      godownLocation: 'Yard B - Sand Pit',
      lastUpdated: '31 Oct 2026',
    },
    {
      id: 'GD-MAT-004',
      name: 'River Sand',
      category: 'River Sand',
      unit: 'Loads',
      openingStock: 0,
      totalPurchased: 5,
      totalIssued: 3,
      adjustments: 0,
      availableQuantity: 2,
      minStockLevel: 5,
      rate: 8000,
      godownLocation: 'Yard B - Sand Pit',
      lastUpdated: '28 Oct 2026',
    },
    {
      id: 'GD-MAT-005',
      name: '20mm Blue Metal',
      category: 'Aggregate',
      unit: 'Loads',
      openingStock: 3,
      totalPurchased: 20,
      totalIssued: 8,
      adjustments: 0,
      availableQuantity: 15,
      minStockLevel: 5,
      rate: 6000,
      godownLocation: 'Yard C - Blue Metal',
      lastUpdated: '01 Nov 2026',
    },
    {
      id: 'GD-MAT-006',
      name: '40mm Blue Metal',
      category: 'Aggregate',
      unit: 'Loads',
      openingStock: 1,
      totalPurchased: 12,
      totalIssued: 4,
      adjustments: 0,
      availableQuantity: 9,
      minStockLevel: 4,
      rate: 5800,
      godownLocation: 'Yard C - Blue Metal',
      lastUpdated: '30 Oct 2026',
    },
    {
      id: 'GD-MAT-007',
      name: 'TMT Steel (12mm)',
      category: 'Steel',
      unit: 'Kg',
      openingStock: 200,
      totalPurchased: 2000,
      totalIssued: 1000,
      adjustments: 0,
      availableQuantity: 1200,
      minStockLevel: 500,
      rate: 75,
      godownLocation: 'Shed 1 - Steel Yard',
      lastUpdated: '02 Nov 2026',
    },
    {
      id: 'GD-MAT-008',
      name: 'TMT Steel (16mm)',
      category: 'Steel',
      unit: 'Kg',
      openingStock: 50,
      totalPurchased: 800,
      totalIssued: 600,
      adjustments: 0,
      availableQuantity: 250,
      minStockLevel: 300,
      rate: 76,
      godownLocation: 'Shed 1 - Steel Yard',
      lastUpdated: '31 Oct 2026',
    },
    {
      id: 'GD-MAT-009',
      name: 'Chengal Brick (Red Brick)',
      category: 'Bricks',
      unit: 'Pieces',
      openingStock: 500,
      totalPurchased: 6000,
      totalIssued: 2000,
      adjustments: 0,
      availableQuantity: 4500,
      minStockLevel: 1000,
      rate: 8.5,
      godownLocation: 'Yard D - Brick Stacks',
      lastUpdated: '01 Nov 2026',
    },
    {
      id: 'GD-MAT-010',
      name: 'AAC Block (6 inch)',
      category: 'Bricks',
      unit: 'Pieces',
      openingStock: 0,
      totalPurchased: 300,
      totalIssued: 300,
      adjustments: 0,
      availableQuantity: 0,
      minStockLevel: 150,
      rate: 65,
      godownLocation: 'Yard D - Brick Stacks',
      lastUpdated: '29 Oct 2026',
    },
    {
      id: 'GD-MAT-011',
      name: 'PVC Conduit Pipes (25mm)',
      category: 'Pipes',
      unit: 'Bundles',
      openingStock: 10,
      totalPurchased: 50,
      totalIssued: 15,
      adjustments: 0,
      availableQuantity: 45,
      minStockLevel: 15,
      rate: 450,
      godownLocation: 'Rack 2 - Electricals',
      lastUpdated: '30 Oct 2026',
    },
    {
      id: 'GD-MAT-012',
      name: 'Gravel Fill Soil',
      category: 'Gravel',
      unit: 'Loads',
      openingStock: 0,
      totalPurchased: 25,
      totalIssued: 7,
      adjustments: 0,
      availableQuantity: 18,
      minStockLevel: 5,
      rate: 3200,
      godownLocation: 'Yard E - Soil Area',
      lastUpdated: '28 Oct 2026',
    },
  ]);

  // Stock Movement History (Auditable Transaction Ledger)
  const [transactions, setTransactions] = useState([
    {
      id: 'TXN-OUT-2002',
      date: '02 Nov 2026',
      materialName: 'Cement (OPC 53)',
      category: 'Cement',
      type: 'Outward',
      quantity: 50,
      unit: 'Bags',
      partyOrProject: 'Office Renovation (KS-002)',
      partyType: 'Site',
      refNo: 'DC-OR-012',
      recordedBy: 'Admin (K Square)',
      remarks: 'Plastering batch dispatch',
    },
    {
      id: 'TXN-OUT-2001',
      date: '02 Nov 2026',
      materialName: 'Cement (OPC 53)',
      category: 'Cement',
      type: 'Outward',
      quantity: 100,
      unit: 'Bags',
      partyOrProject: 'Green Villa (KS-001)',
      partyType: 'Site',
      refNo: 'DC-GV-045',
      recordedBy: 'Admin (K Square)',
      remarks: 'Foundation slab pour dispatch',
    },
    {
      id: 'TXN-IN-1002',
      date: '01 Nov 2026',
      materialName: 'TMT Steel (12mm)',
      category: 'Steel',
      type: 'Inward',
      quantity: 2000,
      unit: 'Kg',
      partyOrProject: 'Steel Master Suppliers',
      partyType: 'Supplier',
      refNo: 'INV-ST-4491',
      recordedBy: 'Admin (K Square)',
      remarks: 'Direct factory consignment',
    },
    {
      id: 'TXN-IN-1001',
      date: '01 Nov 2026',
      materialName: 'Cement (OPC 53)',
      category: 'Cement',
      type: 'Inward',
      quantity: 500,
      unit: 'Bags',
      partyOrProject: 'SM Traders',
      partyType: 'Supplier',
      refNo: 'INV-2026-894',
      recordedBy: 'Admin (K Square)',
      remarks: 'Purchased and received in Main Yard Bay A',
    },
    {
      id: 'TXN-OUT-1999',
      date: '31 Oct 2026',
      materialName: 'TMT Steel (16mm)',
      category: 'Steel',
      type: 'Outward',
      quantity: 600,
      unit: 'Kg',
      partyOrProject: 'RK Residence (KS-004)',
      partyType: 'Site',
      refNo: 'DC-RK-008',
      recordedBy: 'Storekeeper',
      remarks: 'Column reinforcement steel dispatch',
    },
    {
      id: 'TXN-ADJ-3001',
      date: '30 Oct 2026',
      materialName: 'PVC Conduit Pipes (25mm)',
      category: 'Pipes',
      type: 'Adjustment',
      quantity: -2,
      unit: 'Bundles',
      partyOrProject: 'Godown Bay Audit',
      partyType: 'Internal',
      refNo: 'ADJ-8812',
      recordedBy: 'Store Manager',
      remarks: 'Transit breakage reported during audit',
    },
    {
      id: 'TXN-IN-1000',
      date: '29 Oct 2026',
      materialName: 'M-Sand',
      category: 'M-Sand',
      type: 'Inward',
      quantity: 15,
      unit: 'Loads',
      partyOrProject: 'Salem Quarry Minerals',
      partyType: 'Supplier',
      refNo: 'DC-SQ-9102',
      recordedBy: 'Admin (K Square)',
      remarks: 'Unloaded in Yard B',
    },
  ]);

  // Helper: compute Stock Status based on Available vs Min Stock Level
  const getStockStatus = (available, minLevel) => {
    if (available <= 0) return 'Out of Stock';
    if (available <= minLevel) return 'Low Stock';
    return 'In Stock';
  };

  // Handler: Stock Inward (Purchase / Receive)
  const handleSaveInward = (inwardData) => {
    const existingIndex = inventory.findIndex(
      (m) => m.name.toLowerCase() === inwardData.materialName.toLowerCase()
    );

    let updatedInventory = [...inventory];
    let targetMaterialId = '';

    if (existingIndex >= 0) {
      const existing = updatedInventory[existingIndex];
      targetMaterialId = existing.id;
      const newPurchased = existing.totalPurchased + inwardData.quantity;
      const newAvailable =
        existing.openingStock + newPurchased - existing.totalIssued + existing.adjustments;

      updatedInventory[existingIndex] = {
        ...existing,
        totalPurchased: newPurchased,
        availableQuantity: newAvailable,
        rate: inwardData.rate || existing.rate,
        godownLocation: inwardData.godownLocation || existing.godownLocation,
        lastUpdated: inwardData.date,
      };
    } else {
      targetMaterialId = `GD-MAT-${String(inventory.length + 1).padStart(3, '0')}`;
      const newMat = {
        id: targetMaterialId,
        name: inwardData.materialName,
        category: inwardData.category,
        unit: inwardData.unit,
        openingStock: 0,
        totalPurchased: inwardData.quantity,
        totalIssued: 0,
        adjustments: 0,
        availableQuantity: inwardData.quantity,
        minStockLevel: inwardData.minStockLevel || 20,
        rate: inwardData.rate,
        godownLocation: inwardData.godownLocation || 'Main Yard',
        lastUpdated: inwardData.date,
      };
      updatedInventory.unshift(newMat);

      if (!categories.includes(inwardData.category)) {
        setCategories([...categories, inwardData.category]);
      }
    }

    setInventory(updatedInventory);

    // Record Inward Transaction
    const newTxn = {
      id: `TXN-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: inwardData.date,
      materialName: inwardData.materialName,
      category: inwardData.category,
      type: 'Inward',
      quantity: inwardData.quantity,
      unit: inwardData.unit,
      partyOrProject: inwardData.supplier,
      partyType: 'Supplier',
      refNo: inwardData.invoiceNo,
      recordedBy: 'Admin (K Square)',
      remarks: inwardData.remarks || `Purchased from ${inwardData.supplier}`,
    };

    setTransactions([newTxn, ...transactions]);
  };

  // Handler: Stock Outward (Issue to Site)
  const handleIssueStock = (issueData) => {
    const existingIndex = inventory.findIndex(
      (m) => m.name.toLowerCase() === issueData.materialName.toLowerCase()
    );

    if (existingIndex < 0) return;

    let updatedInventory = [...inventory];
    const existing = updatedInventory[existingIndex];

    const newIssued = existing.totalIssued + issueData.quantity;
    const newAvailable =
      existing.openingStock + existing.totalPurchased - newIssued + existing.adjustments;

    updatedInventory[existingIndex] = {
      ...existing,
      totalIssued: newIssued,
      availableQuantity: Math.max(0, newAvailable),
      lastUpdated: issueData.date,
    };

    setInventory(updatedInventory);

    // Record Outward Transaction
    const newTxn = {
      id: `TXN-OUT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: issueData.date,
      materialName: issueData.materialName,
      category: issueData.category,
      type: 'Outward',
      quantity: issueData.quantity,
      unit: issueData.unit,
      partyOrProject: issueData.projectLabel,
      partyType: 'Site',
      refNo: issueData.refNo,
      recordedBy: `${issueData.issuedTo}`,
      remarks: `${issueData.remarks}${issueData.vehicleNo && issueData.vehicleNo !== '-' ? ` • Vehicle: ${issueData.vehicleNo}` : ''}`,
    };

    setTransactions([newTxn, ...transactions]);
  };

  // Handler: Stock Adjustment
  const handleSaveAdjustment = (adjData) => {
    const existingIndex = inventory.findIndex(
      (m) => m.name.toLowerCase() === adjData.materialName.toLowerCase()
    );

    if (existingIndex < 0) return;

    let updatedInventory = [...inventory];
    const existing = updatedInventory[existingIndex];

    const newAdjustments = existing.adjustments + adjData.adjustmentQuantity;
    const newAvailable =
      existing.openingStock + existing.totalPurchased - existing.totalIssued + newAdjustments;

    updatedInventory[existingIndex] = {
      ...existing,
      adjustments: newAdjustments,
      availableQuantity: Math.max(0, newAvailable),
      lastUpdated: adjData.date,
    };

    setInventory(updatedInventory);

    const newTxn = {
      id: `TXN-ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: adjData.date,
      materialName: adjData.materialName,
      category: adjData.category,
      type: 'Adjustment',
      quantity: adjData.adjustmentQuantity,
      unit: adjData.unit,
      partyOrProject: adjData.reason,
      partyType: 'Internal',
      refNo: adjData.refNo,
      recordedBy: 'Admin (K Square)',
      remarks: adjData.remarks,
    };

    setTransactions([newTxn, ...transactions]);
  };

  // Handler: Add New Material Master
  const handleAddNewMaterial = (newMatData) => {
    const existingIndex = inventory.findIndex(
      (m) => m.name.toLowerCase() === newMatData.name.toLowerCase()
    );
    if (existingIndex >= 0) return; // avoid duplicate

    setInventory([newMatData, ...inventory]);

    if (!categories.includes(newMatData.category)) {
      setCategories([...categories, newMatData.category]);
    }
  };

  // Filtered & Sorted Inventory
  const filteredInventory = useMemo(() => {
    return inventory
      .filter((mat) => {
        const matchesSearch =
          mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mat.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mat.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mat.godownLocation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All Categories' || mat.category === selectedCategory;

        const currentStatus = getStockStatus(mat.availableQuantity, mat.minStockLevel);
        const matchesStatus =
          selectedStatus === 'All Status' || currentStatus === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortField === 'availableQuantity') {
          return sortOrder === 'asc'
            ? a.availableQuantity - b.availableQuantity
            : b.availableQuantity - a.availableQuantity;
        }
        return 0;
      });
  }, [inventory, searchQuery, selectedCategory, selectedStatus, sortField, sortOrder]);

  // Low Stock Items Count
  const lowStockItems = useMemo(() => {
    return inventory.filter(
      (mat) => mat.availableQuantity > 0 && mat.availableQuantity <= mat.minStockLevel
    );
  }, [inventory]);

  const outOfStockItems = useMemo(() => {
    return inventory.filter((mat) => mat.availableQuantity <= 0);
  }, [inventory]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.partyOrProject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        historyTypeFilter === 'All' || t.type === historyTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, historyTypeFilter]);

  // Export Inventory CSV
  const handleExportCSV = () => {
    const headers = [
      'Material ID',
      'Material Name',
      'Category',
      'Unit',
      'Total Purchased',
      'Total Issued',
      'Available Stock',
      'Min Stock Level',
      'Stock Status',
      'Location',
      'Rate',
    ];
    const rows = inventory.map((m) => [
      m.id,
      `"${m.name}"`,
      m.category,
      m.unit,
      m.totalPurchased,
      m.totalIssued,
      m.availableQuantity,
      m.minStockLevel,
      getStockStatus(m.availableQuantity, m.minStockLevel),
      `"${m.godownLocation}"`,
      m.rate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `K_Square_Godown_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Warehouse size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Central Inventory
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Stock Engine
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Godown Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 max-w-xl">
              Track warehouse material purchases, transfers to construction sites, stock balances and real-time alerts.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 self-stretch md:self-auto">
          {/* Stock Inward Button */}
          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowDownLeft size={16} />
            <span>Stock Inward</span>
          </button>

          {/* Issue Stock Button */}
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0072ff] hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowUpRight size={16} />
            <span>Issue to Site</span>
          </button>

          {/* Stock Adjustment Button */}
          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Stock Adjustment / Audit"
          >
            <Sliders size={15} />
            <span className="hidden lg:inline">Adjust</span>
          </button>

          {/* Add Material Master */}
          <button
            onClick={() => setIsAddMaterialModalOpen(true)}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            title="Register New Material"
          >
            <Plus size={15} />
            <span className="hidden lg:inline">Material</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Export Inventory CSV"
          >
            <Download size={15} />
          </button>
        </div>

        {/* Decorative Grid Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none opacity-20 hidden md:flex items-end justify-end pr-6 pb-2">
          <svg width="220" height="110" viewBox="0 0 220 110" fill="none">
            <rect x="20" y="35" width="75" height="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="20" y1="60" x2="95" y2="60" stroke="#10b981" strokeWidth="1" />
            <line x1="20" y1="85" x2="95" y2="85" stroke="#10b981" strokeWidth="1" />
            <line x1="45" y1="35" x2="45" y2="110" stroke="#10b981" strokeWidth="1" />
            <line x1="70" y1="35" x2="70" y2="110" stroke="#10b981" strokeWidth="1" />
            <line x1="140" y1="10" x2="140" y2="110" stroke="#10b981" strokeWidth="2" />
            <line x1="100" y1="20" x2="200" y2="20" stroke="#10b981" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* 2. Godown Dashboard KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Material Types */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
              <Package size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Material Types</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {inventory.length}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
            {categories.length} Categories
          </span>
        </div>

        {/* Total Available Stock */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0">
              <Warehouse size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">In-Stock Materials</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {inventory.filter((m) => m.availableQuantity > m.minStockLevel).length}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} />
            <span>Healthy</span>
          </div>
        </div>

        {/* Total Stock Issued */}
        <div className="bg-[#fff7ee] rounded-2xl p-5 border border-amber-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Dispatched to Sites</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {transactions.filter((t) => t.type === 'Outward').length}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">
            Across 4 Sites
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div
          onClick={() => {
            setActiveTab('Stock Overview');
            setSelectedStatus(selectedStatus === 'Low Stock' ? 'All Status' : 'Low Stock');
          }}
          className={`rounded-2xl p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            lowStockItems.length > 0 || outOfStockItems.length > 0
              ? 'bg-[#fef2f2] border-rose-200/80 hover:border-rose-300'
              : 'bg-[#edf9f3] border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                lowStockItems.length > 0 || outOfStockItems.length > 0
                  ? 'bg-rose-500/10 text-rose-700'
                  : 'bg-emerald-500/10 text-emerald-700'
              }`}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Stock Alerts</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {lowStockItems.length + outOfStockItems.length}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-block ${
                outOfStockItems.length > 0
                  ? 'bg-rose-100 text-rose-800'
                  : lowStockItems.length > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {outOfStockItems.length > 0
                ? `${outOfStockItems.length} Out of Stock`
                : lowStockItems.length > 0
                ? `${lowStockItems.length} Low Stock`
                : 'All Sufficient'}
            </span>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">Click to filter</div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('Stock Overview');
              setSelectedStatus('All Status');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'Stock Overview'
                ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Package size={15} />
            <span>Material Stock Overview ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('Movement History')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'Movement History'
                ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Clock size={15} />
            <span>Movement History ({transactions.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('Low Stock Alerts');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'Low Stock Alerts'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <AlertTriangle size={15} />
            <span>
              Low Stock Alerts ({lowStockItems.length + outOfStockItems.length})
            </span>
          </button>
        </div>
      </div>

      {/* 4. Tab Content 1: Material Stock Overview Table */}
      {activeTab === 'Stock Overview' && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search material name, ID, category or godown bay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <div className="relative">
                <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="All Status">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Sort Order */}
              <button
                onClick={() => {
                  if (sortField === 'name') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortField('name');
                    setSortOrder('asc');
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                title="Sort A-Z"
              >
                <ArrowUpDown size={13} className="text-slate-400" />
                <span>Sort Name</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Material ID & Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4 text-right">Total Purchased</th>
                    <th className="py-3.5 px-4 text-right">Total Issued</th>
                    <th className="py-3.5 px-4 text-right">Available Stock</th>
                    <th className="py-3.5 px-4 text-right">Min Level</th>
                    <th className="py-3.5 px-4 text-center">Stock Status</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-12 text-center text-slate-400">
                        <Package size={36} className="mx-auto mb-2 text-slate-300" />
                        <div className="font-bold text-slate-600">No materials found</div>
                        <div className="text-xs text-slate-400">Try adjusting your filters or search keyword</div>
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item, idx) => {
                      const status = getStockStatus(item.availableQuantity, item.minStockLevel);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                            {idx + 1}
                          </td>

                          {/* Name & ID */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="font-bold text-slate-900">{item.name}</div>
                              <span className="font-mono text-[10px] text-slate-400">{item.id}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {item.category}
                            </span>
                          </td>

                          {/* Unit */}
                          <td className="py-3.5 px-4 font-medium text-slate-600">{item.unit}</td>

                          {/* Total Purchased */}
                          <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                            {item.totalPurchased}
                          </td>

                          {/* Total Issued */}
                          <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                            {item.totalIssued}
                          </td>

                          {/* Available Stock */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="font-extrabold text-sm text-slate-900">
                              {item.availableQuantity}
                            </div>
                            <span className="text-[10px] text-slate-400">{item.unit}</span>
                          </td>

                          {/* Min Level */}
                          <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                            {item.minStockLevel}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {status === 'In Stock' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>In Stock</span>
                              </span>
                            )}
                            {status === 'Low Stock' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Low Stock</span>
                              </span>
                            )}
                            {status === 'Out of Stock' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span>Out of Stock</span>
                              </span>
                            )}
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                            <span className="text-[11px]">{item.godownLocation}</span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setIsInwardModalOpen(true)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                                title="Inward Purchase"
                              >
                                <ArrowDownLeft size={13} />
                              </button>
                              <button
                                onClick={() => setIsIssueModalOpen(true)}
                                disabled={item.availableQuantity <= 0}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  item.availableQuantity <= 0
                                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'border-slate-200 text-slate-500 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50/50'
                                }`}
                                title="Issue to Site"
                              >
                                <ArrowUpRight size={13} />
                              </button>
                              <button
                                onClick={() => setIsAdjustmentModalOpen(true)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50/50 transition-colors"
                                title="Adjust Stock"
                              >
                                <Sliders size={13} />
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
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 text-xs text-slate-500 font-medium gap-3">
              <span>
                Showing {filteredInventory.length} of {inventory.length} materials in godown
              </span>
              <div className="flex items-center gap-1.5">
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                  <ChevronLeft size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#008744] text-white font-bold text-xs shadow-xs">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab Content 2: Movement History (Ledger) */}
      {activeTab === 'Movement History' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Transaction Type:</span>
              <div className="flex items-center gap-1.5 border border-slate-200 bg-white p-1 rounded-xl">
                {['All', 'Inward', 'Outward', 'Adjustment'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setHistoryTypeFilter(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      historyTypeFilter === type
                        ? 'bg-[#008744] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search transaction, DC or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              />
            </div>
          </div>

          {/* History Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Txn ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Material</th>
                    <th className="py-3.5 px-4 text-center">Type</th>
                    <th className="py-3.5 px-4 text-right">Quantity</th>
                    <th className="py-3.5 px-4">Supplier / Project</th>
                    <th className="py-3.5 px-4">Ref / DC No.</th>
                    <th className="py-3.5 px-4">Recorded By</th>
                    <th className="py-3.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((txn, idx) => (
                    <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      {/* Txn ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-[11px]">
                        {txn.id}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {txn.date}
                      </td>

                      {/* Material */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{txn.materialName}</div>
                        <span className="text-[10px] text-slate-400">{txn.category}</span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 text-center">
                        {txn.type === 'Inward' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ArrowDownLeft size={11} />
                            <span>Inward</span>
                          </span>
                        )}
                        {txn.type === 'Outward' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <ArrowUpRight size={11} />
                            <span>Outward</span>
                          </span>
                        )}
                        {txn.type === 'Adjustment' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                            <Sliders size={11} />
                            <span>Adjust</span>
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black text-xs ${
                            txn.type === 'Inward' || txn.quantity > 0
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {txn.type === 'Inward' ? `+${txn.quantity}` : `${txn.quantity}`}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400 font-medium">{txn.unit}</span>
                      </td>

                      {/* Party / Project */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{txn.partyOrProject}</div>
                        <span className="text-[10px] text-slate-400">{txn.partyType}</span>
                      </td>

                      {/* Ref No. */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {txn.refNo}
                        </span>
                      </td>

                      {/* Recorded By */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {txn.recordedBy}
                      </td>

                      {/* Remarks */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {txn.remarks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Content 3: Low Stock Alerts */}
      {activeTab === 'Low Stock Alerts' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">Low Stock Reordering Priority</h3>
                <p className="text-xs text-amber-700">
                  Materials below minimum safety stock levels. Issue inward purchases immediately to prevent site work stoppages.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsInwardModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-700/20 cursor-pointer"
            >
              + Create Bulk Inward
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...outOfStockItems, ...lowStockItems].map((mat) => {
              const isOut = mat.availableQuantity <= 0;
              return (
                <div
                  key={mat.id}
                  className={`p-5 rounded-2xl border bg-white shadow-2xs space-y-3.5 ${
                    isOut ? 'border-rose-200 ring-2 ring-rose-500/10' : 'border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                        {mat.id}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{mat.name}</h4>
                      <span className="text-xs text-slate-500">{mat.category}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isOut ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isOut ? 'OUT OF STOCK' : 'LOW STOCK'}
                    </span>
                  </div>

                  {/* Stock Level Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Current Available:</span>
                      <span className={isOut ? 'text-rose-600' : 'text-amber-700'}>
                        {mat.availableQuantity} {mat.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOut ? 'bg-rose-500 w-0' : 'bg-amber-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (mat.availableQuantity / (mat.minStockLevel || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Threshold: {mat.minStockLevel} {mat.unit}</span>
                      <span>Bay: {mat.godownLocation}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsInwardModalOpen(true)}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft size={14} />
                    <span>Receive Inward Stock</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddStockInwardModal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        onSaveInward={handleSaveInward}
        materials={inventory}
        categories={categories}
      />

      <IssueStockModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onIssueStock={handleIssueStock}
        materials={inventory}
        sites={sites}
      />

      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSaveAdjustment={handleSaveAdjustment}
        materials={inventory}
      />

      <AddGodownMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        onAddMaterial={handleAddNewMaterial}
        categories={categories}
      />
    </div>
  );
}

