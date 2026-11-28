import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Package,
  Users,
  Hourglass,
  Plus,
  Search,
  Building2,
  Tag,
  CreditCard,
  Calendar,
  ChevronDown,
  Download,
  List,
  LayoutGrid,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Layers,
  Truck,
  MoreHorizontal,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Zap,
  X,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import { getAllPages, expenseApi, siteApi, paymentApi } from '../services/api';
import { buildExpensePayload } from '../utils/expensePayload';

export default function SiteExpenses({ onSelectSiteExpense = () => {} }) {
  const [activeTab, setActiveTab] = useState('All Expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Payment Status');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [customDate, setCustomDate] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
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

  // Category Tabs
  const categoryTabs = [
    { id: 'All Expenses', label: 'All Expenses', icon: LayoutGrid },
    { id: 'Materials', label: 'Materials', icon: Layers },
    { id: 'Labour', label: 'Labour', icon: Users },
    { id: 'Rent', label: 'Rent', icon: Building2 },
    { id: 'Vehicle Rent', label: 'Vehicle Rent', icon: Truck },
    { id: 'Additional Work', label: 'Additional Work', icon: Zap },
    { id: 'Other Expenses', label: 'Other Expenses', icon: MoreHorizontal },
  ];

  // Live Expenses List from MongoDB Atlas
  const [summary, setSummary] = useState({});
  const [loadError, setLoadError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [sitesList, setSitesList] = useState([]);

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    const request = new AbortController();
    loadExpenses(request.signal);
    return () => request.abort();
  }, [selectedSite]);

  const getCategoryStyle = (cat) => {
    switch (cat) {
      case 'Materials':
        return { icon: Layers, color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'Labour':
        return { icon: Users, color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'Rental':
      case 'Rent':
      case 'Vehicle Rent':
        return { icon: Truck, color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'Additional Work':
        return { icon: Zap, color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { icon: MoreHorizontal, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const loadSites = async () => {
    try {
      const res = await siteApi.getAll();
      setSitesList(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Could not fetch sites in SiteExpenses:', err.message);
      setSitesList([]);
    }
  };

  const loadExpenses = async (signal) => {
    const siteId = selectedSite === 'All Sites' ? undefined : selectedSite;
    try {
      const [list, totals] = await Promise.all([
        getAllPages(expenseApi.getAll, { siteId }),
        expenseApi.getSummary(siteId),
      ]);
      if (signal?.aborted) return;
      setSummary(totals.data);
      setLoadError('');
      const formatted = list.map((e, idx) => {
        const cat = e.category || 'Other';
        const style = getCategoryStyle(cat);
        return {
          ...e,
          id: e._id || e.id || String(idx + 1).padStart(2, '0'),
          date: e.date ? new Date(e.date).toLocaleDateString('en-IN') : 'Today',
          siteName: e.siteName || (e.site?.name) || 'Site',
          siteCode: e.siteCode || (e.site?.code) || '',
          category: cat,
          categoryIcon: style.icon,
          categoryColor: style.color,
          expenseType: e.expenseType || (e.isAdditionalWork || cat === 'Additional Work' ? 'ADDITIONAL_WORK' : 'NORMAL'),
          isAdditionalWork: Boolean(e.isAdditionalWork || cat === 'Additional Work'),
          billableToClient: Boolean(e.billableToClient),
          description: e.description || '-',
          supplier: e.supplierName || e.vendorName || e.supplier || '-',
          rawAmount: typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount || 0).replace(/[^\d.]/g, '')) || 0,
          calculatedAmount: e.calculatedAmount || e.amount || 0,
          billingAmount: e.billingAmount ?? null,
          paidAmount: e.paidAmount !== undefined ? e.paidAmount : (e.paymentStatus === 'Paid' ? (e.amount || 0) : 0),
          pendingAmount: e.pendingAmount !== undefined ? e.pendingAmount : (e.paymentStatus === 'Pending' ? (e.amount || 0) : 0),
          amount: typeof e.amount === 'number' ? `₹${e.amount.toLocaleString('en-IN')}` : (e.amount || '₹0'),
          paymentStatus: e.paymentStatus || 'Paid',
        };
      });
      setExpenses(formatted);
    } catch (err) {
      if (!signal?.aborted) setLoadError(err.message);
    }
  };

  const handleAddExpense = async (newExp) => {
    const payload = buildExpensePayload(newExp, null);
    await expenseApi.create(payload);
    await loadExpenses();
  };

  const handleOpenPayModal = (exp) => {
    const outstanding =
      exp.pendingAmount !== undefined && exp.pendingAmount > 0
        ? exp.pendingAmount
        : Math.max(0, (exp.rawAmount || 0) - (exp.paidAmount || 0));
    setPayingExpense({ ...exp, outstanding });
    setPayForm({ amount: String(outstanding), paymentMode: 'Cash', referenceNo: '', notes: '' });
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
        siteId: payingExpense.siteId || payingExpense.site?._id || payingExpense.site,
        siteName: payingExpense.siteName,
        siteCode: payingExpense.siteCode,
        expenseId: payingExpense._id || payingExpense.id,
        partyName: payingExpense.supplier && payingExpense.supplier !== '-' ? payingExpense.supplier : payingExpense.description,
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
        invoiceRef: `Settlement for ${payingExpense.description}`,
        notes: payForm.notes || '',
      });
      setPayingExpense(null);
      await loadExpenses();
    } catch (err) {
      setPayError(err?.message || 'Could not record payment.');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseApi.delete(id);
      await loadExpenses();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleOpenEdit = (exp) => {
    setEditingExpense(exp);
    setEditForm({
      description: exp.description || '',
      supplierName: exp.supplier || exp.supplierName || '',
      amount: exp.rawAmount !== undefined ? String(exp.rawAmount) : String(exp.amount || '').replace(/[^\d.]/g, ''),
      paymentStatus: exp.paymentStatus || 'Paid',
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
      await loadExpenses();
      setEditingExpense(null);
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleExportCSV = () => {
    if (!filteredExpenses || filteredExpenses.length === 0) {
      alert('No expense records to export.');
      return;
    }
    const headers = ['#', 'Date', 'Site Name', 'Site Code', 'Category', 'Description', 'Supplier / Worker', 'Amount', 'Payment Status', 'Payment Mode'];
    const rows = filteredExpenses.map((exp, idx) => [
      idx + 1,
      `"${exp.date || ''}"`,
      `"${(exp.siteName || '').replace(/"/g, '""')}"`,
      `"${exp.siteCode || ''}"`,
      `"${exp.category || ''}"`,
      `"${(exp.description || '').replace(/"/g, '""')}"`,
      `"${(exp.supplier || exp.supplierName || '').replace(/"/g, '""')}"`,
      `"${String(exp.rawAmount || exp.amount || '').replace(/[^\d.]/g, '')}"`,
      `"${exp.paymentStatus || 'Paid'}"`,
      `"${exp.paymentMode || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Site_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentExpenses = Array.isArray(expenses) ? expenses : [];

  // Filter logic
  const filteredExpenses = currentExpenses.filter((exp) => {
    // 1. Tab filter
    let matchesTab = true;
    if (activeTab === 'All Expenses') {
      matchesTab = true;
    } else if (activeTab === 'Materials') {
      matchesTab = (exp.category === 'Materials' || exp.subCategory === 'Materials') && !exp.isAdditionalWork && exp.expenseType !== 'ADDITIONAL_WORK';
    } else if (activeTab === 'Labour') {
      matchesTab = (exp.category === 'Labour' || exp.subCategory === 'Labour') && !exp.isAdditionalWork && exp.expenseType !== 'ADDITIONAL_WORK';
    } else if (activeTab === 'Rent' || activeTab === 'Rental' || activeTab === 'Vehicle Rent') {
      matchesTab = (exp.category === 'Rental' || exp.category === 'Rent' || exp.category === 'Vehicle Rent' || exp.subCategory === 'Rental') && !exp.isAdditionalWork && exp.expenseType !== 'ADDITIONAL_WORK';
    } else if (activeTab === 'Additional Work') {
      matchesTab = exp.category === 'Additional Work' || exp.isAdditionalWork || exp.expenseType === 'ADDITIONAL_WORK';
    } else if (activeTab === 'Other Expenses' || activeTab === 'Other') {
      matchesTab = (exp.category === 'Other' || exp.category === 'Other Expenses' || exp.subCategory === 'Other') && !exp.isAdditionalWork && exp.expenseType !== 'ADDITIONAL_WORK';
    } else {
      matchesTab = exp.category === activeTab;
    }

    // 2. Search query
    const desc = String(exp.description || '').toLowerCase();
    const supp = String(exp.supplier || exp.supplierName || '').toLowerCase();
    const siteN = String(exp.siteName || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const matchesSearch = !query || desc.includes(query) || supp.includes(query) || siteN.includes(query);

    // 3. Site filter
    const matchesSite = selectedSite === 'All Sites' || (exp.site?._id || exp.siteId || exp.site) === selectedSite;

    // 4. Category dropdown
    let matchesCategory = true;
    if (selectedCategory !== 'All Categories') {
      if (selectedCategory === 'Additional Work') {
        matchesCategory = exp.category === 'Additional Work' || exp.isAdditionalWork || exp.expenseType === 'ADDITIONAL_WORK';
      } else if (selectedCategory === 'Other') {
        matchesCategory = exp.category === 'Other' || exp.subCategory === 'Other';
      } else if (selectedCategory === 'Rent' || selectedCategory === 'Rental' || selectedCategory === 'Vehicle Rent') {
        matchesCategory = exp.category === 'Rental' || exp.category === 'Rent' || exp.category === 'Vehicle Rent' || exp.subCategory === 'Rental';
      } else {
        matchesCategory = exp.category === selectedCategory || exp.subCategory === selectedCategory;
      }
    }

    // 5. Payment status
    const matchesStatus = selectedStatus === 'All Payment Status' || exp.paymentStatus === selectedStatus;

    // 6. Date filter
    let matchesDate = true;
    if (dateFilter === 'Today') {
      const todayStr = new Date().toLocaleDateString('en-IN');
      matchesDate = exp.date === todayStr;
    } else if (dateFilter === 'This Month') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const expD = new Date(exp.rawDate || exp.date);
      if (!isNaN(expD.getTime())) {
        matchesDate = expD.getMonth() === currentMonth && expD.getFullYear() === currentYear;
      }
    } else if (dateFilter === 'Custom' && customDate) {
      const customFormatted = new Date(customDate).toLocaleDateString('en-IN');
      matchesDate = exp.date === customFormatted;
    }

    return matchesTab && matchesSearch && matchesSite && matchesCategory && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const { totalExpenses: totalExpensesAmt = 0, paidAmount: paidExpensesAmt = 0,
    pendingAmount: pendingExpensesAmt = 0, additionalWorkExpenses: additionalWorkAmt = 0 } = summary;
  const formatCurrency = (value) => '₹' + Number(value || 0).toLocaleString('en-IN');

  return (
    <div className="p-5 md:p-8 space-y-5 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {loadError && <p role="alert" className="text-sm text-rose-700">{loadError}</p>}
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Home size={13} className="text-slate-400" />
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-emerald-700 font-bold">Site Expenses</span>
      </nav>

      {/* 2. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between relative">
        <div className="p-6 md:p-7 flex-1 flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Wallet size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Site Expenses
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Track and manage all construction site expenses in one place.
            </p>
          </div>
        </div>

        {/* Crane & Building Visual */}
        <div className="relative w-full md:w-96 h-28 md:h-36 overflow-hidden flex items-center justify-end px-6 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80"
            alt="Construction crane building"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent md:from-white md:via-white/30 md:to-transparent" />
        </div>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Expenses */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Expenses</div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {formatCurrency(totalExpensesAmt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-100/70 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <TrendingUp size={11} />
            <span>{currentExpenses.length} Records</span>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Paid Amount</div>
              <div className="text-2xl font-extrabold text-emerald-700 tracking-tight mt-0.5">
                {formatCurrency(paidExpensesAmt)}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {totalExpensesAmt > 0 ? Math.round((paidExpensesAmt / totalExpensesAmt) * 100) : 0}%
          </span>
        </div>

        {/* Pending Amount */}
        <div className="bg-[#fef2f2] rounded-2xl p-5 border border-rose-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <Hourglass size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Pending Amount</div>
              <div className="text-2xl font-extrabold text-rose-600 tracking-tight mt-0.5">
                {formatCurrency(pendingExpensesAmt)}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            {totalExpensesAmt > 0 ? Math.round((pendingExpensesAmt / totalExpensesAmt) * 100) : 0}%
          </span>
        </div>

        {/* Additional Work Expenses */}
        <div className="bg-[#f5f2ff] rounded-2xl p-5 border border-purple-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Additional Work Expenses</div>
              <div className="text-2xl font-extrabold text-purple-700 tracking-tight mt-0.5">
                {formatCurrency(additionalWorkAmt)}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            Scope +
          </span>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {categoryTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#15803d] text-white shadow-sm shadow-emerald-800/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <TabIcon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by description or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sites */}
          <div className="relative">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Sites">All Sites</option>
              {Array.isArray(sitesList) && sitesList.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Categories */}
          <div className="relative">
            <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              <option value="Materials">Materials</option>
              <option value="Labour">Labour</option>
              <option value="Vehicle Rent">Vehicle Rent</option>
              <option value="Rent">Rent</option>
              <option value="Additional Work">Additional Work</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Payment Status */}
          <div className="relative">
            <CreditCard size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Payment Status">All Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Dates">All Dates</option>
              <option value="Today">Today</option>
              <option value="This Month">This Month</option>
              <option value="Custom">Custom Date</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {dateFilter === 'Custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          )}
        </div>
      </div>

      {/* 6. Expense List Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet size={17} />
            </div>
            <span>Expense List ({filteredExpenses.length})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              title="Export expenses to CSV spreadsheet"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 shadow-xs transition-colors cursor-pointer"
            >
              <Download size={13} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>

            {/* View Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#008744] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid Cards View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#008744] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode: List Table or Grid Cards */}
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Supplier / Worker</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-300 opacity-60" />
                      <p className="font-bold text-slate-700 text-sm">No site expenses recorded</p>
                      <p className="text-xs text-slate-400 mt-0.5">Click "+ Add Expense" to log your first material, labour or rental cost.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedExpenses.map((exp, idx) => {
                    const CatIcon = exp.categoryIcon || Layers;
                    const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    return (
                      <tr key={exp._id || exp.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Number */}
                        <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                          {rowNumber}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                          {exp.date}
                        </td>

                        {/* Site */}
                        <td className="py-3.5 px-4 cursor-pointer" onClick={() => onSelectSiteExpense(exp)}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 hover:text-emerald-700 transition-colors">{exp.siteName}</div>
                              <div className="text-[10px] text-slate-400">{exp.siteCode}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${exp.categoryColor}`}
                          >
                            <CatIcon size={12} />
                            <span>{exp.category}</span>
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {exp.description}
                        </td>

                        {/* Supplier / Worker */}
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {exp.supplier}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{exp.amount}</div>
                          {exp.paymentStatus === 'Partial' && (
                            <div className="text-[10px] font-semibold mt-0.5 space-x-1.5 whitespace-nowrap">
                              <span className="text-emerald-700">Paid: ₹{(exp.paidAmount || 0).toLocaleString('en-IN')}</span>
                              <span className="text-amber-700">Due: ₹{(exp.pendingAmount || 0).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4 text-center">
                          {exp.paymentStatus === 'Paid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                              <CheckCircle2 size={12} />
                              <span>Paid</span>
                            </span>
                          )}
                          {exp.paymentStatus === 'Pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                              <Hourglass size={12} />
                              <span>Pending</span>
                            </span>
                          )}
                          {exp.paymentStatus === 'Partial' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                              <Clock size={12} />
                              <span>Partial</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {exp.paymentStatus !== 'Paid' && (
                              <button
                                title="Record payment for this bill"
                                onClick={() => handleOpenPayModal(exp)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                              >
                                <CreditCard size={11} />
                                <span>Pay</span>
                              </button>
                            )}
                            <button
                              title="View Expense Details"
                              onClick={() => setViewingExpense(exp)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              title="Edit Expense"
                              onClick={() => handleOpenEdit(exp)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors cursor-pointer"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              title="Delete Expense"
                              onClick={() => handleDeleteExpense(exp._id || exp.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
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
        ) : (
          /* Grid View */
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50">
            {paginatedExpenses.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400">
                <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-300 opacity-60" />
                <p className="font-bold text-slate-700 text-sm">No site expenses recorded</p>
                <p className="text-xs text-slate-400 mt-0.5">Click "+ Add Expense" to log your first material, labour or rental cost.</p>
              </div>
            ) : (
              paginatedExpenses.map((exp) => {
                const CatIcon = exp.categoryIcon || Layers;
                return (
                  <div
                    key={exp._id || exp.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${exp.categoryColor}`}>
                          <CatIcon size={11} />
                          <span>{exp.category}</span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {exp.date}
                        </span>
                      </div>

                      <div
                        onClick={() => onSelectSiteExpense(exp)}
                        className="flex items-center gap-2 cursor-pointer hover:text-emerald-700 transition-colors"
                      >
                        <Building2 size={14} className="text-emerald-600 shrink-0" />
                        <span className="font-extrabold text-xs text-slate-800 truncate">{exp.siteName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({exp.siteCode})</span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 line-clamp-2">
                        {exp.description}
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium">
                        Supplier / Payee: <strong className="text-slate-700">{exp.supplier}</strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Amount</div>
                        <div className="text-base font-black text-slate-900">{exp.amount}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          title="View Details"
                          onClick={() => setViewingExpense(exp)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          title="Edit Expense"
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          title="Delete Expense"
                          onClick={() => handleDeleteExpense(exp._id || exp.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 7. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredExpenses.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} – {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center transition-colors ${
                currentPage === 1 ? 'opacity-40 cursor-not-allowed text-slate-300' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#008744] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center transition-colors ${
                currentPage === totalPages ? 'opacity-40 cursor-not-allowed text-slate-300' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* View Expense Details Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Expense Details</h3>
                  <p className="text-xs text-slate-400">Record reference #{viewingExpense.id || viewingExpense._id?.slice(-6)}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingExpense(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Site & Amount Hero Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-200/90 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Site Name</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{viewingExpense.siteName} ({viewingExpense.siteCode})</div>
                  <div className="text-[11px] text-slate-500 mt-1">Recorded on {viewingExpense.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Expense</div>
                  <div className="text-xl font-black text-emerald-950 mt-0.5">{viewingExpense.amount}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${viewingExpense.categoryColor || 'bg-slate-100 text-slate-700'}`}>
                    {viewingExpense.category}
                  </span>
                </div>
              </div>

              {/* Details Key-Value Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-medium">Description:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{viewingExpense.description}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Supplier / Vendor:</span>
                  <div className="font-bold text-slate-800 mt-0.5">{viewingExpense.supplier}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Payment Status:</span>
                  <div className="font-bold mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${
                      viewingExpense.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : viewingExpense.paymentStatus === 'Partial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {viewingExpense.paymentStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Payment Mode:</span>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {viewingExpense.paymentStatus === 'Pending' ? 'Not Paid Yet' : (viewingExpense.paymentMode || 'Cash')}
                  </div>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold">Paid Amount:</span>
                  <div className="font-black text-emerald-900 mt-0.5">
                    ₹ {(viewingExpense.paidAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-amber-700 font-bold">Outstanding Amount:</span>
                  <div className="font-black text-amber-900 mt-0.5">
                    ₹ {(viewingExpense.pendingAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                {viewingExpense.billingAmount && (
                  <div>
                    <span className="text-slate-400 font-medium">Billing Amount:</span>
                    <div className="font-extrabold text-blue-700 mt-0.5">₹ {Number(viewingExpense.billingAmount).toLocaleString('en-IN')}</div>
                  </div>
                )}
                {viewingExpense.isAdditionalWork && (
                  <div>
                    <span className="text-purple-700 font-bold">Scope Type:</span>
                    <div className="font-bold text-purple-900 mt-0.5">Additional Work (Extra)</div>
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

              {/* Receipt screenshot preview if available */}
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
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  onSelectSiteExpense(viewingExpense);
                  setViewingExpense(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Open Site Expenses Details</span>
              </button>
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
                  <p className="text-xs text-slate-500">{editingExpense.siteName}</p>
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
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">{payingExpense.description}</p>
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

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}

