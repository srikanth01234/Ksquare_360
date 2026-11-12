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
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import { expenseApi, siteApi } from '../services/api';

export default function SiteExpenses({ onSelectSiteExpense = () => {}, sharedExpenses = null }) {
  const [activeTab, setActiveTab] = useState('All Expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Payment Status');
  const [viewMode, setViewMode] = useState('list');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

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
  const [expenses, setExpenses] = useState([]);
  const [sitesList, setSitesList] = useState([]);

  useEffect(() => {
    loadExpenses();
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await siteApi.getAll();
      setSitesList(res.data || res || []);
    } catch (err) {
      console.warn('Could not fetch sites in SiteExpenses:', err.message);
    }
  };

  const loadExpenses = async () => {
    try {
      const res = await expenseApi.getAll();
      const list = res.data || res || [];
      const formatted = list.map((e, idx) => ({
        ...e,
        id: e._id || e.id || String(idx + 1).padStart(2, '0'),
        date: e.date ? new Date(e.date).toLocaleDateString('en-IN') : 'Today',
        siteName: e.siteName || (e.site?.name) || 'Site',
        siteCode: e.siteCode || (e.site?.code) || '',
        category: e.category || 'Other',
        description: e.description || '-',
        supplier: e.supplierName || e.vendorName || e.supplier || '-',
        amount: typeof e.amount === 'number' ? `₹${e.amount.toLocaleString('en-IN')}` : (e.amount || '₹0'),
        paymentStatus: e.paymentStatus || 'Paid',
      }));
      setExpenses(formatted);
    } catch (err) {
      console.warn('Could not fetch expenses from backend:', err.message);
      setExpenses([]);
    }
  };

  const handleAddExpense = async (newExp) => {
    try {
      const rawAmt = typeof newExp.totalExpenseAmount === 'number'
        ? newExp.totalExpenseAmount
        : parseFloat(String(newExp.amount || '').replace(/[^\d.]/g, '')) || 0;

      await expenseApi.create({
        siteId: newExp.siteId || (sitesList[0]?._id),
        siteName: newExp.siteName,
        siteCode: newExp.siteCode,
        category: newExp.category,
        description: newExp.description,
        supplierName: newExp.supplierName || newExp.supplier || '-',
        amount: rawAmt,
        paymentStatus: newExp.paymentStatus || 'Paid',
        paymentMode: newExp.paymentMethod === 'UPI' ? 'UPI (GPay)' : 'Cash',
        date: newExp.date || new Date().toISOString(),
        items: newExp.materialItems || [],
        notes: newExp.notes || '',
      });
      await loadExpenses();
    } catch (err) {
      console.warn('API expense create fallback:', err.message);
      const formatted = {
        ...newExp,
        id: String(expenses.length + 1).padStart(2, '0'),
      };
      setExpenses([formatted, ...expenses]);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseApi.delete(id);
      await loadExpenses();
    } catch (err) {
      console.warn('API expense delete fallback:', err.message);
      setExpenses(expenses.filter((item) => item.id !== id && item._id !== id));
    }
  };

  const currentExpenses = sharedExpenses || expenses;

  // Filter logic
  const filteredExpenses = currentExpenses.filter((exp) => {
    const matchesTab =
      activeTab === 'All Expenses' ||
      (activeTab === 'Other Expenses' && exp.category === 'Other') ||
      exp.category === activeTab;

    const matchesSearch =
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.siteName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSite =
      selectedSite === 'All Sites' || exp.siteName === selectedSite;

    const matchesCategory =
      selectedCategory === 'All Categories' || exp.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All Payment Status' || exp.paymentStatus === selectedStatus;

    return matchesTab && matchesSearch && matchesSite && matchesCategory && matchesStatus;
  });

  const totalExpensesAmt = currentExpenses.reduce((sum, e) => {
    const raw = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount).replace(/[^\d.]/g, '')) || 0;
    return sum + raw;
  }, 0);

  const paidExpensesAmt = currentExpenses.reduce((sum, e) => {
    if (e.paymentStatus === 'Paid') {
      const raw = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount).replace(/[^\d.]/g, '')) || 0;
      return sum + raw;
    }
    return sum;
  }, 0);

  const pendingExpensesAmt = Math.max(0, totalExpensesAmt - paidExpensesAmt);

  const additionalWorkAmt = currentExpenses.reduce((sum, e) => {
    if (e.category === 'Additional Work') {
      const raw = typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount).replace(/[^\d.]/g, '')) || 0;
      return sum + raw;
    }
    return sum;
  }, 0);

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  return (
    <div className="p-5 md:p-8 space-y-5 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
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
              {sitesList.map((s) => (
                <option key={s._id || s.id} value={s.name}>
                  {s.name}
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

          {/* Select Date Range */}
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300">
            <Calendar size={13} className="text-slate-400" />
            <span>Select Date Range</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>
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
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors">
              <Download size={13} className="text-slate-500" />
              <span>Export</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {/* View Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#008744] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
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

        {/* Table */}
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
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p className="font-bold text-slate-700 text-sm">No site expenses recorded</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click "Add Expense" to log your first material, labour or rental cost.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                const CatIcon = exp.categoryIcon || Layers;
                return (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Number */}
                    <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                      {exp.id}
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
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {exp.amount}
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
                        <button
                          title="View Details"
                          onClick={() => onSelectSiteExpense(exp)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          title="Edit Expense"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          title="Delete Expense"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing 1 – {filteredExpenses.length} of {currentExpenses.length} expenses
          </div>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#008744] text-white font-bold text-xs shadow-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              3
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              4
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              5
            </button>
            <span className="text-xs text-slate-400 px-1 font-bold">...</span>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              26
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

