import React, { useState } from 'react';
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
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';

export default function SiteExpenses({ onSelectSiteExpense = () => {}, sharedExpenses = null }) {
  const [activeTab, setActiveTab] = useState('All Expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Payment Status');
  const [viewMode, setViewMode] = useState('list');

  // Category Tabs
  const categoryTabs = [
    { id: 'All Expenses', label: 'All Expenses', icon: LayoutGrid },
    { id: 'Materials', label: 'Materials', icon: Layers },
    { id: 'Labour', label: 'Labour', icon: Users },
    { id: 'Rent', label: 'Rent', icon: Building2 },
    { id: 'Vehicle Rent', label: 'Vehicle Rent', icon: Truck },
    { id: 'Other Expenses', label: 'Other Expenses', icon: MoreHorizontal },
  ];

  // Initial Expenses List
  const [expenses, setExpenses] = useState([
    {
      id: '01',
      date: '01 Nov 2026',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      category: 'Materials',
      categoryColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      categoryIcon: Layers,
      description: 'Cement – 50 Bags',
      supplier: 'SM Traders',
      amount: '₹18,000',
      paymentStatus: 'Paid',
    },
    {
      id: '02',
      date: '01 Nov 2026',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      category: 'Labour',
      categoryColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
      categoryIcon: Users,
      description: 'Mason wages – 4 Workers',
      supplier: '-',
      amount: '₹4,000',
      paymentStatus: 'Paid',
    },
    {
      id: '03',
      date: '31 Oct 2026',
      siteName: 'RK Residence',
      siteCode: 'KS-004',
      category: 'Vehicle Rent',
      categoryColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
      categoryIcon: Truck,
      description: 'Lorry rent – Material transport',
      supplier: 'City Lorry Service',
      amount: '₹3,500',
      paymentStatus: 'Pending',
    },
    {
      id: '04',
      date: '31 Oct 2026',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      category: 'Rent',
      categoryColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
      categoryIcon: Building2,
      description: 'Equipment rent – Mixer',
      supplier: 'BuildEquip Rentals',
      amount: '₹2,000',
      paymentStatus: 'Paid',
    },
    {
      id: '05',
      date: '30 Oct 2026',
      siteName: 'Metro Apartment',
      siteCode: 'KS-005',
      category: 'Other',
      categoryColor: 'bg-slate-100 text-slate-700 border-slate-200',
      categoryIcon: MoreHorizontal,
      description: 'Site cleaning & waste removal',
      supplier: 'CleanWork Services',
      amount: '₹1,200',
      paymentStatus: 'Partial',
    },
  ]);

  const handleAddExpense = (newExp) => {
    const formatted = {
      ...newExp,
      id: String(expenses.length + 1).padStart(2, '0'),
      categoryColor:
        newExp.category === 'Materials'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          : newExp.category === 'Labour'
          ? 'bg-sky-50 text-sky-700 border-sky-200/80'
          : newExp.category === 'Vehicle Rent'
          ? 'bg-purple-50 text-purple-700 border-purple-200/80'
          : newExp.category === 'Rent'
          ? 'bg-amber-50 text-amber-800 border-amber-200/80'
          : 'bg-slate-100 text-slate-700 border-slate-200',
      categoryIcon: Layers,
    };
    setExpenses([formatted, ...expenses]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
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

  return (
    <div className="p-5 md:p-8 space-y-5 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
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
                ₹24,86,000
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-100/70 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <TrendingUp size={11} />
            <span>+12%</span>
          </div>
        </div>

        {/* Material Expenses */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Package size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Material Expenses</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ₹16,40,000
            </div>
          </div>
        </div>

        {/* Labour Expenses */}
        <div className="bg-[#fff7ee] rounded-2xl p-5 border border-amber-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Labour Expenses</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ₹5,20,000
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-[#fef2f2] rounded-2xl p-5 border border-rose-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <Hourglass size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Payments</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ₹1,36,000
            </div>
          </div>
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
              <option value="Green Villa">Green Villa</option>
              <option value="RK Residence">RK Residence</option>
              <option value="Metro Apartment">Metro Apartment</option>
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
              {filteredExpenses.map((exp) => {
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
              })}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing 1 – {filteredExpenses.length} of 128 expenses
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

