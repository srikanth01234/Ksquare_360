import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  User,
  Users,
  Plus,
  Package,
  HardHat,
  Truck,
  Layers,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  CheckCircle2,
  Clock,
  Zap,
  Coins,
  Hourglass,
  CreditCard,
  Download,
  Eye,
  X,
  FileSpreadsheet,
  LayoutGrid,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import { getAllPages, expenseApi, paymentApi } from '../services/api';
import { buildExpensePayload } from '../utils/expensePayload';

export default function SiteExpenseDetails({
  site = null,
  onBack = () => {},
}) {
  const [activeTab, setActiveTab] = useState('All Expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'Paid' | 'Pending'
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expensePage, setExpensePage] = useState(1);
  const [summary, setSummary] = useState({});
  const [loadError, setLoadError] = useState('');
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [payingExpense, setPayingExpense] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', paymentMode: 'Cash', referenceNo: '', notes: '' });
  const [payError, setPayError] = useState('');
  const [editForm, setEditForm] = useState({
    description: '',
    supplierName: '',
    amount: '',
    paymentStatus: 'Paid',
    paymentMode: 'Cash',
    date: '',
  });

  // Active site data
  const currentSite = site || {
    name: 'Site Expenses',
    code: 'KS-001',
    location: 'Chennai, TN',
    client: 'Client',
    startDate: 'Recent',
    status: 'Active',
  };

  const categoryTabs = [
    { id: 'All Expenses', label: 'All Expenses', icon: LayoutGrid },
    { id: 'Materials', label: 'Materials', icon: Package },
    { id: 'Labour', label: 'Labour', icon: HardHat },
    { id: 'Rental', label: 'Rental', icon: Truck },
    { id: 'Other Expenses', label: 'Other Expenses', icon: MoreHorizontal },
    { id: 'Additional Work', label: 'Additional Work', icon: Zap },
  ];

  useEffect(() => {
    loadSiteExpenses();
  }, [currentSite]);

  const loadSiteExpenses = async () => {
    setLoading(true);
    try {
      const siteId = currentSite._id || currentSite.id;
      if (!siteId) throw new Error('The construction site could not be identified.');
      const [filtered, totals] = await Promise.all([
        getAllPages(expenseApi.getAll, { siteId }),
        expenseApi.getSummary(siteId),
      ]);
      setSummary(totals.data);
      setLoadError('');

      const formatted = filtered.map((e, idx) => {
        const isAddWork = Boolean(
          e.isAdditionalWork ||
          e.expenseType === 'ADDITIONAL_WORK' ||
          e.category === 'Additional Work'
        );
        const rawAmt = typeof e.amount === 'number'
          ? e.amount
          : parseFloat(String(e.amount || 0).replace(/[^\d.]/g, '')) || 0;

        return {
          ...e,
          id: e._id || e.id || String(idx + 1).padStart(2, '0'),
          date: e.date ? new Date(e.date).toLocaleDateString('en-IN') : 'Recent',
          rawDate: e.date,
          material: e.description || e.materialName || e.category,
          supplier: e.supplierName || e.vendorName || e.supplier || '-',
          qty: e.quantity || 1,
          unit: e.unit || (e.category === 'Labour' ? 'Workers' : 'Units'),
          rate: typeof e.rate === 'number' ? `₹${e.rate.toLocaleString('en-IN')}` : (e.rate ? `₹${e.rate}` : '-'),
          amountNum: rawAmt,
          calculatedAmount: e.calculatedAmount || rawAmt,
          billingAmount: e.billingAmount ?? null,
          paidAmount: e.paidAmount !== undefined ? e.paidAmount : (e.paymentStatus === 'Paid' ? rawAmt : 0),
          pendingAmount: e.pendingAmount !== undefined ? e.pendingAmount : (e.paymentStatus === 'Pending' ? rawAmt : 0),
          amount: `₹ ${rawAmt.toLocaleString('en-IN')}`,
          payment: e.paymentStatus || 'Paid',
          paymentMode: e.paymentMode || '',
          isAdditionalWork: isAddWork,
          expenseType: isAddWork ? 'ADDITIONAL_WORK' : 'NORMAL',
          subCategory: e.subCategory || '',
          billableToClient: Boolean(e.billableToClient),
          items: e.items || [],
        };
      });

      setSiteExpenses(formatted);
    } catch (err) {
      console.warn('Could not load site expenses from backend:', err.message);
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (newExp) => {
    const payload = buildExpensePayload({ ...newExp, siteId: currentSite._id || currentSite.id }, currentSite);
    await expenseApi.create(payload);
    await loadSiteExpenses();
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expenseApi.delete(id);
      await loadSiteExpenses();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleClearPayment = (row) => {
    const outstanding = row.pendingAmount !== undefined && row.pendingAmount > 0
      ? row.pendingAmount
      : Math.max(0, (row.amountNum || 0) - (row.paidAmount || 0));
    setPayingExpense({ ...row, outstanding });
    setPayForm({
      amount: String(outstanding),
      paymentMode: 'Cash',
      referenceNo: '',
      notes: '',
    });
    setPayError('');
  };

  const handleConfirmRecordPayment = async (e) => {
    e.preventDefault();
    if (!payingExpense) return;
    const payAmt = parseFloat(payForm.amount);
    const maxAllowed = payingExpense.outstanding || 0;
    if (isNaN(payAmt) || payAmt <= 0) {
      setPayError('Payment amount must be greater than ₹0.');
      return;
    }
    if (payAmt > maxAllowed) {
      setPayError(`Payment amount cannot exceed remaining outstanding amount (₹${maxAllowed.toLocaleString('en-IN')}).`);
      return;
    }
    try {
      await paymentApi.create({
        flowType: 'OUTGOING',
        siteId: currentSite._id || currentSite.id,
        siteName: currentSite.name,
        siteCode: currentSite.code,
        expenseId: payingExpense._id || payingExpense.id,
        partyName: payingExpense.supplier && payingExpense.supplier !== '-' ? payingExpense.supplier : payingExpense.material,
        category:
          payingExpense.category === 'Materials'
            ? 'Materials'
            : payingExpense.category === 'Labour'
            ? 'Labour Wages'
            : payingExpense.category === 'Rental'
            ? 'Machinery Rental'
            : 'Other',
        amount: payAmt,
        paymentMode: payForm.paymentMode || 'Cash',
        referenceNo: payForm.referenceNo || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceRef: `Settlement for ${payingExpense.material}`,
        notes: payForm.notes || '',
      });
      setPayingExpense(null);
      await loadSiteExpenses();
    } catch (err) {
      setPayError(err?.message || 'Could not record payment.');
    }
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setEditForm({
      description: exp.description || exp.material || '',
      supplierName: exp.supplierName || exp.supplier || '',
      amount: exp.amountNum !== undefined ? String(exp.amountNum) : String(exp.amount || '').replace(/[^\d.]/g, ''),
      paymentStatus: exp.payment || exp.paymentStatus || 'Paid',
      paymentMode: exp.paymentMode || 'Cash',
      date: exp.rawDate ? new Date(exp.rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      const id = editingExpense._id || editingExpense.id;
      const parsedAmt = parseFloat(editForm.amount) || 0;
      await expenseApi.update(id, {
        description: editForm.description,
        supplierName: editForm.supplierName,
        amount: parsedAmt,
        ...(editForm.paymentStatus !== (editingExpense.paymentStatus || editingExpense.payment)
          ? { paymentStatus: editForm.paymentStatus } : {}),
        paymentMode: editForm.paymentMode,
        date: editForm.date,
      });
      await loadSiteExpenses();
      setEditingExpense(null);
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleExportCSV = () => {
    if (!filteredEntries || filteredEntries.length === 0) {
      alert('No expense records to export.');
      return;
    }
    const headers = ['#', 'Date', 'Category', 'Expense Type', 'Description', 'Supplier / Worker', 'Quantity', 'Unit', 'Rate', 'Amount (₹)', 'Payment Status', 'Payment Mode'];
    const rows = filteredEntries.map((exp, idx) => [
      idx + 1,
      `"${exp.date}"`,
      `"${exp.category}"`,
      `"${exp.isAdditionalWork ? 'Additional Work' : 'Normal Contract'}"`,
      `"${(exp.material || exp.description || '').replace(/"/g, '""')}"`,
      `"${(exp.supplier || '').replace(/"/g, '""')}"`,
      exp.qty || 1,
      `"${exp.unit || ''}"`,
      `"${exp.rate || ''}"`,
      exp.amountNum || 0,
      `"${exp.payment || ''}"`,
      `"${exp.paymentMode || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(',')).join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(currentSite.name || 'Site').replace(/\s+/g, '_')}_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations from live site expenses (accurately counting Partial payments)
  const { totalExpenses = 0, paidAmount = 0, pendingAmount = 0, additionalWorkExpenses: additionalWorkAmount = 0 } = summary;
  const paidPercentage = totalExpenses > 0 ? Math.round((paidAmount / totalExpenses) * 100) : 0;
  const pendingPercentage = totalExpenses > 0 ? 100 - paidPercentage : 0;

  const matchesTab = (exp, tabId) => {
    if (tabId === 'All Expenses') return true;
    if (tabId === 'Additional Work') return Boolean(exp.isAdditionalWork);
    if (exp.isAdditionalWork) return false;

    const cat = String(exp.category || '').toLowerCase();
    const sub = String(exp.subCategory || '').toLowerCase();

    if (tabId === 'Materials') {
      return cat === 'materials' || cat === 'material' || sub === 'materials';
    }
    if (tabId === 'Labour') {
      return cat === 'labour' || cat === 'labor' || sub === 'labour';
    }
    if (tabId === 'Rental') {
      return cat === 'rental' || cat === 'rent' || cat === 'vehicle rent' || sub === 'rental';
    }
    if (tabId === 'Other Expenses') {
      return cat === 'other' || cat === 'other expenses' || sub === 'other expenses';
    }
    return false;
  };

  const getTabCount = (tabId) => {
    return siteExpenses.filter((e) => matchesTab(e, tabId)).length;
  };

  // Filtered by tab
  const activeEntries = siteExpenses.filter((e) => matchesTab(e, activeTab));
  const tabSum = activeEntries.reduce((sum, e) => sum + (e.amountNum || 0), 0);
  const currentTabTotal = `₹ ${tabSum.toLocaleString('en-IN')}`;

  const filteredEntries = activeEntries.filter((item) => {
    const matchesSearch =
      String(item.material || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.invoiceNo || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      paymentFilter === 'ALL' ||
      (paymentFilter === 'Paid' && item.payment === 'Paid') ||
      (paymentFilter === 'Pending' && item.payment !== 'Paid');

    return matchesSearch && matchesStatus;
  });

  const getCategoryBadge = (exp) => {
    if (exp.isAdditionalWork) {
      return {
        label: 'Additional Work',
        color: 'bg-purple-50 text-purple-700 border-purple-200/80',
        sub: exp.subCategory ? ` (${exp.subCategory})` : '',
      };
    }
    const cat = exp.category || 'Other';
    switch (cat) {
      case 'Materials':
        return { label: 'Materials', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', sub: '' };
      case 'Labour':
        return { label: 'Labour', color: 'bg-blue-50 text-blue-700 border-blue-200/80', sub: '' };
      case 'Rental':
      case 'Rent':
      case 'Vehicle Rent':
        return { label: 'Rental', color: 'bg-amber-50 text-amber-700 border-amber-200/80', sub: '' };
      default:
        return { label: cat, color: 'bg-slate-100 text-slate-700 border-slate-200', sub: '' };
    }
  };

  const pageSize = 20;
  const lastPage = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const page = Math.min(expensePage, lastPage);
  const firstRow = (page - 1) * pageSize;
  const pageEntries = filteredEntries.slice(firstRow, firstRow + pageSize);

  useEffect(() => {
    setExpensePage(1);
  }, [activeTab, searchQuery, paymentFilter]);

  return (
    <div className="p-5 md:p-8 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {loadError && <p role="alert" className="text-sm text-rose-700">{loadError}</p>}
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onBack}
          className="hover:text-slate-900 transition-colors cursor-pointer"
        >
          Site Expenses
        </button>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-emerald-700 font-bold">{currentSite.name} Expenses</span>
      </nav>

      {/* 2. Page Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Back button & Site Details */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-2xs cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentSite.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {currentSite.code}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium mt-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <span>{currentSite.location}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                <span>Client: <strong className="text-slate-700">{currentSite.client}</strong></span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span>Start: <strong className="text-slate-700">{currentSite.startDate}</strong></span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1.5">
                <span>Status:</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {currentSite.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* 3. 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Expenses */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Expenses</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                ₹ {totalExpenses.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {siteExpenses.length} Records
          </span>
        </div>

        {/* Paid Amount */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Paid Amount</div>
              <div className="text-2xl font-black text-emerald-700 tracking-tight mt-0.5">
                ₹ {paidAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {paidPercentage}%
          </span>
        </div>

        {/* Pending Amount */}
        <div className="bg-[#fef2f2] rounded-2xl p-5 border border-rose-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <Hourglass size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Pending Amount</div>
              <div className="text-2xl font-black text-rose-600 tracking-tight mt-0.5">
                ₹ {pendingAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            {pendingPercentage}%
          </span>
        </div>

        {/* Additional Work Expenses */}
        <div className="bg-[#f5f2ff] rounded-2xl p-5 border border-purple-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Additional Work</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                ₹ {additionalWorkAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            Extras
          </span>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5 no-scrollbar">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const count = getTabCount(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. Expenses Data Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {activeTab === 'Materials' && <Package size={17} />}
              {activeTab === 'Labour' && <HardHat size={17} />}
              {activeTab === 'Rental' && <Truck size={17} />}
              {activeTab === 'Additional Work' && <Zap size={17} />}
              {activeTab === 'Other Expenses' && <MoreHorizontal size={17} />}
              {activeTab === 'All Expenses' && <LayoutGrid size={17} />}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {activeTab}
            </h3>
            <span className="text-xs text-slate-400 font-medium ml-1">Total:</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {currentTabTotal}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Status</option>
              <option value="Paid">Paid Only</option>
              <option value="Pending">Pending Only</option>
            </select>

            {/* Search Box */}
            <div className="relative w-64 md:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-emerald-50/40">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Description / Item</th>
                <th className="py-3.5 px-4">Supplier / Worker</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-right">Rate</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    <Clock size={24} className="mx-auto mb-2 text-slate-300 animate-spin" />
                    <div className="font-semibold text-slate-600">Loading site expenses...</div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    <Package size={28} className="mx-auto mb-2 text-slate-300" />
                    <div className="font-bold text-slate-600">No {activeTab.toLowerCase()} recorded for this site yet.</div>
                    <div className="text-xs text-slate-400 mt-1">Click "+ Add Expense" above to record a new expense.</div>
                  </td>
                </tr>
              ) : (
                pageEntries.map((row, index) => {
                  const idx = firstRow + index;
                  const badge = getCategoryBadge(row);
                  return (
                    <tr key={row._id || row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}{badge.sub}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate" title={row.material}>
                        {row.material}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {row.supplier}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {row.qty}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500">
                        {row.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {row.rate}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900">{row.amount}</div>
                        {row.payment === 'Partial' && (
                          <div className="text-[10px] font-semibold mt-0.5 space-x-1.5">
                            <span className="text-emerald-700">Paid: ₹{(row.paidAmount || 0).toLocaleString('en-IN')}</span>
                            <span className="text-amber-700">Due: ₹{(row.pendingAmount || 0).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {row.payment === 'Paid' ? (
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Paid
                          </span>
                        ) : row.payment === 'Partial' ? (
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                            Partial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details */}
                          <button
                            title="View full expense details"
                            onClick={() => setViewingExpense(row)}
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Expense */}
                          <button
                            title="Edit this expense"
                            onClick={() => handleOpenEdit(row)}
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Quick Pay */}
                          {row.payment !== 'Paid' && (
                            <button
                              title="Clear / Pay this bill"
                              onClick={() => handleClearPayment(row)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <CreditCard size={10} />
                              <span>Pay</span>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            title="Delete expense"
                            onClick={() => handleDeleteExpense(row._id || row.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                          >
                            <Trash2 size={14} />
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
      </div>

      {lastPage > 1 && (
        <nav aria-label="Site expense pages" className="flex items-center justify-end gap-3 text-xs font-semibold">
          <button type="button" disabled={page === 1} onClick={() => setExpensePage(page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>
          <span>Page {page} of {lastPage}</span>
          <button type="button" disabled={page === lastPage} onClick={() => setExpensePage(page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button>
        </nav>
      )}

      {/* Helpful Tip Notice */}
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-600">
        <Info size={16} className="text-emerald-600 shrink-0" />
        <span>
          <strong>Tip:</strong> Use the tabs above to filter Material, Labour, Rental, Other, and Additional Work Expenses for <strong>{currentSite.name}</strong>.
        </span>
      </div>

      {/* View Expense Details Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Expense Details</h3>
                  <p className="text-xs text-slate-500">{currentSite.name} ({currentSite.code})</p>
                </div>
              </div>
              <button
                onClick={() => setViewingExpense(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Hero Amount Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Final Billing / Expense Amount</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">
                      {viewingExpense.amount}
                    </div>
                    {viewingExpense.calculatedAmount > 0 && viewingExpense.calculatedAmount !== viewingExpense.amountNum && (
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Calculated Ref: ₹ {Number(viewingExpense.calculatedAmount).toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      viewingExpense.payment === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingExpense.payment === 'Partial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {viewingExpense.payment}
                    </span>
                    {viewingExpense.payment !== 'Pending' && viewingExpense.paymentMode && (
                      <div className="text-[11px] text-slate-500 mt-1 font-medium">Mode: {viewingExpense.paymentMode}</div>
                    )}
                  </div>
                </div>

                {/* Paid vs Outstanding Breakdown */}
                <div className="grid grid-cols-2 gap-2.5 pt-2.5 border-t border-slate-200">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">Paid Amount</div>
                    <div className="text-sm font-black text-emerald-900 mt-0.5">
                      ₹ {(viewingExpense.paidAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="text-[10px] font-bold text-amber-700 uppercase">Outstanding Amount</div>
                    <div className="text-sm font-black text-amber-900 mt-0.5">
                      ₹ {(viewingExpense.pendingAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Category</span>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingExpense.category}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Expense Date</span>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingExpense.date}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Supplier / Worker</span>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingExpense.supplier}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Quantity / Rate</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {viewingExpense.qty} {viewingExpense.unit} @ {viewingExpense.rate}
                  </div>
                </div>
                {viewingExpense.isAdditionalWork && (
                  <div className="col-span-2 p-3 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-purple-700 font-bold uppercase tracking-wider text-[10px]">Additional Work (Client Extra)</span>
                    <div className="font-bold text-purple-900 mt-0.5">
                      {viewingExpense.billableToClient ? 'Billable to Client (Approved)' : 'Internal Extra Expense'}
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Item Breakdown Table if exists */}
              {Array.isArray(viewingExpense.items) && viewingExpense.items.length > 0 && (
                <div className="space-y-2">
                  <div className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">Material Breakdown Items:</div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                        <tr>
                          <th className="py-2 px-3">Material</th>
                          <th className="py-2 px-3 text-center">Quantity</th>
                          <th className="py-2 px-3 text-center">Unit</th>
                          <th className="py-2 px-3 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewingExpense.items.map((it, i) => (
                          <tr key={i}>
                            <td className="py-2 px-3 font-semibold text-slate-800">{it.material || it.materialName || 'Item'}</td>
                            <td className="py-2 px-3 text-center text-slate-600">{it.quantity || 1}</td>
                            <td className="py-2 px-3 text-center text-slate-500">{it.unit || 'Units'}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">₹ {(Number(it.amount) || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingExpense.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-slate-700">
                  <strong className="text-amber-900">Notes:</strong> {viewingExpense.notes}
                </div>
              )}

              {/* Receipt screenshot preview */}
              {viewingExpense.receiptUrl && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-medium">Receipt Photo / Screenshot:</span>
                  <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center justify-center">
                    <img
                      src={viewingExpense.receiptUrl}
                      alt="Receipt Preview"
                      className="max-h-48 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setViewingExpense(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Expense</h3>
                  <p className="text-xs text-slate-500">{currentSite.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingExpense(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Item *</label>
                <input
                  type="text"
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier / Worker Name</label>
                <input
                  type="text"
                  value={editForm.supplierName}
                  onChange={(e) => setEditForm({ ...editForm, supplierName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status *</label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={editForm.paymentMode}
                    onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI (GPay)">UPI (GPay)</option>
                    <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Partial / Remaining Payment Modal */}
      {payingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Record Expense Payment</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">{payingExpense.material}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayingExpense(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleConfirmRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Total Bill</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">{payingExpense.amount}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Paid</div>
                  <div className="text-xs font-black text-emerald-800 mt-0.5">
                    ₹{(payingExpense.paidAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-700 uppercase">Outstanding</div>
                  <div className="text-xs font-black text-amber-800 mt-0.5">
                    ₹{(payingExpense.outstanding || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Payment Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={payingExpense.outstanding}
                  required
                  value={payForm.amount}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    setPayError('');
                    setPayForm({ ...payForm, amount: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter partial or full amount up to ₹{(payingExpense.outstanding || 0).toLocaleString('en-IN')}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Payment Method *</label>
                  <select
                    value={payForm.paymentMode}
                    onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI (GPay)">UPI</option>
                    <option value="Bank Transfer (NEFT)">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Reference No.</label>
                  <input
                    type="text"
                    placeholder="Optional UTR / Ref"
                    value={payForm.referenceNo}
                    onChange={(e) => setPayForm({ ...payForm, referenceNo: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {payError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                  {payError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingExpense(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal with Locked Site */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        lockedSite={`${currentSite.name} (${currentSite.code})`}
      />
    </div>
  );
}
