import React, { useState, useEffect } from 'react';
import {
  FileText,
  Layers,
  Wallet,
  Hourglass,
  Plus,
  Search,
  Building2,
  Calendar,
  Tag,
  ChevronDown,
  Download,
  List,
  LayoutGrid,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { invoiceApi, siteApi } from '../services/api';

export default function BillingInvoices({ onCreateInvoiceClick = () => {} }) {
  const [activeTab, setActiveTab] = useState('Invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState('list');
  const [selectedRows, setSelectedRows] = useState([]);

  // Navigation Tabs
  const tabs = [
    { id: 'Invoices', label: 'Invoices', icon: null },
    { id: 'Payments', label: 'Payments', icon: null },
    { id: 'Clients', label: 'Clients', icon: null },
    { id: 'Invoice Settings', label: 'Invoice Settings', icon: Settings },
  ];

  // Live Invoices List from MongoDB Atlas
  const [invoices, setInvoices] = useState([]);
  const [sitesList, setSitesList] = useState([]);

  useEffect(() => {
    loadInvoices();
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await siteApi.getAll();
      setSitesList(res.data || res || []);
    } catch (err) {
      console.warn('Could not fetch sites in BillingInvoices:', err.message);
    }
  };

  const loadInvoices = async () => {
    try {
      const res = await invoiceApi.getAll();
      const list = res.data || res || [];
      const formatted = list.map((inv, idx) => {
        const total = typeof inv.totalAmount === 'number' ? inv.totalAmount : parseFloat(String(inv.totalAmount || inv.amount || 0).replace(/[^\d.]/g, '')) || 0;
        const paid = typeof inv.paidAmount === 'number' ? inv.paidAmount : (typeof inv.receivedAmount === 'number' ? inv.receivedAmount : 0);
        const balance = typeof inv.balanceDue === 'number' ? inv.balanceDue : (typeof inv.balanceAmount === 'number' ? inv.balanceAmount : Math.max(0, total - paid));
        const rawDate = inv.issueDate || inv.invoiceDate;

        return {
          ...inv,
          id: inv.invoiceNumber || inv._id || `INV-${String(idx + 1).padStart(4, '0')}`,
          client: inv.clientName || inv.client || 'Client',
          project: inv.siteName || (inv.site?.name) || 'Construction Project',
          siteName: inv.siteName || (inv.site?.name) || 'Site',
          siteCode: inv.siteCode || (inv.site?.code) || '',
          date: rawDate ? new Date(rawDate).toLocaleDateString('en-IN') : 'Recent',
          totalNum: total,
          paidNum: paid,
          balanceNum: balance,
          amount: `₹ ${total.toLocaleString('en-IN')}`,
          received: `₹ ${paid.toLocaleString('en-IN')}`,
          balance: `₹ ${balance.toLocaleString('en-IN')}`,
          status: inv.status || 'Draft',
        };
      });
      setInvoices(formatted);
    } catch (err) {
      console.warn('Could not fetch invoices from backend:', err.message);
      setInvoices([]);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(invoices.map((inv) => inv.id));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await invoiceApi.delete(id);
      await loadInvoices();
    } catch (err) {
      console.warn('API invoice delete error:', err.message);
      setInvoices(invoices.filter((inv) => inv.id !== id && inv._id !== id));
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.siteName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSite =
      selectedSite === 'All Sites' || inv.siteName === selectedSite;

    const matchesStatus =
      selectedStatus === 'All Status' || inv.status === selectedStatus;

    return matchesSearch && matchesSite && matchesStatus;
  });

  return (
    <div className="p-5 md:p-8 space-y-5 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <span className="font-extrabold text-2xl">₹</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Billing &amp; Invoices
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Create, manage and track invoices, payments and balances for all construction projects.
            </p>
          </div>
        </div>

        {/* Create Invoice Button */}
        <button
          onClick={onCreateInvoiceClick}
          className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs md:text-sm font-bold shadow-lg shadow-emerald-800/25 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Invoiced */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Invoiced</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ₹ {invoices.reduce((sum, inv) => sum + (inv.totalNum || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Total Received */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Received</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ₹ {invoices.reduce((sum, inv) => sum + (inv.paidNum || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Pending Amount */}
        <div className="bg-[#fff7ee] rounded-2xl p-5 border border-amber-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Hourglass size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pending Amount</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ₹ {invoices.reduce((sum, inv) => sum + (inv.balanceNum || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-[#fef2f2] rounded-2xl p-5 border border-rose-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Invoices</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {invoices.length}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#15803d] text-white shadow-sm shadow-emerald-800/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {TabIcon && <TabIcon size={14} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by invoice no., client or site..."
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

          {/* Status */}
          <div className="relative">
            <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Dates */}
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300">
            <Calendar size={13} className="text-slate-400" />
            <span>All Dates</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {/* View Switcher */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 ml-1">
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

      {/* 5. Invoices Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <List size={17} />
            </div>
            <span>Invoices ({filteredInvoices.length})</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors">
            <Download size={13} className="text-slate-500" />
            <span>Export</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={selectedRows.length === invoices.length && invoices.length > 0}
                    className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Invoice No.</th>
                <th className="py-3 px-4">Client / Project</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4">Invoice Date</th>
                <th className="py-3 px-3">Amount (₹)</th>
                <th className="py-3 px-3">Received (₹)</th>
                <th className="py-3 px-3">Balance (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Checkbox */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(inv.id)}
                      onChange={() => toggleSelectRow(inv.id)}
                      className="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer"
                    />
                  </td>

                  {/* Invoice No. */}
                  <td className="py-3.5 px-3 font-bold text-emerald-700 whitespace-nowrap">
                    {inv.id}
                  </td>

                  {/* Client / Project */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-bold text-slate-900">{inv.client}</div>
                      <div className="text-[11px] text-slate-400">{inv.project}</div>
                    </div>
                  </td>

                  {/* Site */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{inv.siteName}</div>
                        <div className="text-[10px] text-slate-400">{inv.siteCode}</div>
                      </div>
                    </div>
                  </td>

                  {/* Invoice Date */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-slate-400" />
                      <span>{inv.date}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {inv.amount}
                  </td>

                  {/* Received */}
                  <td className="py-3.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                    {inv.received}
                  </td>

                  {/* Balance */}
                  <td className="py-3.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                    {inv.balance}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center">
                    {inv.status === 'Paid' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
                        <CheckCircle2 size={12} />
                        <span>Paid</span>
                      </span>
                    )}
                    {inv.status === 'Partial' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
                        <Clock size={12} />
                        <span>Partial</span>
                      </span>
                    )}
                    {inv.status === 'Pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60 whitespace-nowrap">
                        <AlertCircle size={12} />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="View Invoice"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        title="Edit Invoice"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        title="Download PDF"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        title="Delete Invoice"
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing 1 – {filteredInvoices.length} of 24 invoices
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
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

