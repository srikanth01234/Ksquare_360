import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  User,
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
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';
import { expenseApi, paymentApi } from '../services/api';

export default function SiteExpenseDetails({
  site = null,
  onBack = () => {},
}) {
  const [activeTab, setActiveTab] = useState('Material'); // 'Material' | 'Labour' | 'Rental' | 'Additional Work'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active site data
  const currentSite = site || {
    name: 'Site Expenses',
    code: 'KS-001',
    location: 'Chennai, TN',
    client: 'Client',
    startDate: 'Recent',
    status: 'Active',
  };

  useEffect(() => {
    loadSiteExpenses();
  }, [currentSite]);

  const loadSiteExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseApi.getAll();
      const all = res.data || res || [];
      const sId = currentSite._id || currentSite.id;
      const sName = currentSite.name;
      const sCode = currentSite.code;

      const filtered = all.filter((e) => {
        const matchesId = sId && (e.siteId === sId || e.site?._id === sId || e.site === sId);
        const matchesName = sName && (e.siteName === sName || e.site?.name === sName);
        const matchesCode = sCode && (e.siteCode === sCode || e.site?.code === sCode);
        return matchesId || matchesName || matchesCode;
      });

      const formatted = filtered.map((e, idx) => ({
        ...e,
        id: e._id || e.id || String(idx + 1).padStart(2, '0'),
        date: e.date ? new Date(e.date).toLocaleDateString('en-IN') : 'Recent',
        material: e.description || e.materialName || e.category,
        supplier: e.supplierName || e.vendorName || e.supplier || '-',
        qty: e.quantity || 1,
        unit: e.unit || (e.category === 'Labour' ? 'Workers' : 'Units'),
        rate: typeof e.rate === 'number' ? `₹${e.rate.toLocaleString('en-IN')}` : (e.rate ? `₹${e.rate}` : '-'),
        amountNum: typeof e.amount === 'number' ? e.amount : parseFloat(String(e.amount || 0).replace(/[^\d.]/g, '')) || 0,
        amount: typeof e.amount === 'number' ? `₹${e.amount.toLocaleString('en-IN')}` : (e.amount || '₹0'),
        payment: e.paymentStatus || 'Paid',
      }));

      setSiteExpenses(formatted);
    } catch (err) {
      console.warn('Could not load site expenses from backend:', err.message);
      setSiteExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (newExp) => {
    try {
      const sId = currentSite._id || currentSite.id;
      const rawAmt = typeof newExp.totalExpenseAmount === 'number'
        ? newExp.totalExpenseAmount
        : parseFloat(String(newExp.amount || '').replace(/[^\d.]/g, '')) || 0;

      await expenseApi.create({
        siteId: sId,
        site: sId,
        siteName: currentSite.name,
        siteCode: currentSite.code,
        category: newExp.category,
        description: newExp.description,
        supplierName: newExp.supplierName || newExp.supplier || '-',
        amount: rawAmt,
        quantity: newExp.quantity,
        unit: newExp.unit,
        rate: newExp.rate,
        paymentStatus: newExp.paymentStatus || 'Paid',
        paymentMode: newExp.paymentMethod === 'UPI' ? 'UPI (GPay)' : 'Cash',
        date: newExp.date || new Date().toISOString(),
        items: newExp.materialItems || [],
        notes: newExp.notes || '',
      });
      await loadSiteExpenses();
    } catch (err) {
      console.warn('Could not save expense in backend:', err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expenseApi.delete(id);
      await loadSiteExpenses();
    } catch (err) {
      console.warn('Could not delete expense:', err.message);
    }
  };

  const handleClearPayment = async (row) => {
    if (!window.confirm(`Record outgoing payment and mark "${row.material}" as Paid?`)) return;
    try {
      const amt = row.amountNum || parseFloat(String(row.amount).replace(/[^0-9.]/g, '')) || 0;
      await paymentApi.create({
        flowType: 'OUTGOING',
        siteId: currentSite._id || currentSite.id,
        siteName: currentSite.name,
        siteCode: currentSite.code,
        expenseId: row._id || row.id,
        partyName: row.supplier && row.supplier !== '-' ? row.supplier : row.material,
        category:
          activeTab === 'Material'
            ? 'Materials'
            : activeTab === 'Labour'
            ? 'Labour Wages'
            : activeTab === 'Rental'
            ? 'Machinery Rental'
            : 'Other',
        amount: amt,
        paymentMode: 'Bank Transfer (NEFT)',
        referenceNo: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceRef: `Settlement for ${row.material}`,
      });
      await loadSiteExpenses();
    } catch (err) {
      console.warn('Error clearing payment for expense:', err.message);
    }
  };

  // Calculations from live site expenses
  const totalExpenses = siteExpenses.reduce((sum, e) => sum + (e.amountNum || 0), 0);
  const paidExpenses = siteExpenses.filter((e) => e.payment === 'Paid');
  const paidAmount = paidExpenses.reduce((sum, e) => sum + (e.amountNum || 0), 0);
  const pendingAmount = Math.max(0, totalExpenses - paidAmount);
  const paidPercentage = totalExpenses > 0 ? Math.round((paidAmount / totalExpenses) * 100) : 0;
  const pendingPercentage = totalExpenses > 0 ? 100 - paidPercentage : 0;
  const additionalWorkAmount = siteExpenses
    .filter((e) => e.category === 'Additional Work')
    .reduce((sum, e) => sum + (e.amountNum || 0), 0);

  // Filtered by tab
  const activeEntries = siteExpenses.filter((e) => {
    if (activeTab === 'Material') return e.category === 'Materials';
    if (activeTab === 'Labour') return e.category === 'Labour';
    if (activeTab === 'Rental') return e.category === 'Rental' || e.category === 'Vehicle Rent' || e.category === 'Rent';
    if (activeTab === 'Additional Work') return e.category === 'Additional Work';
    return true;
  });

  const tabSum = activeEntries.reduce((sum, e) => sum + (e.amountNum || 0), 0);
  const currentTabTotal = `₹ ${tabSum.toLocaleString('en-IN')}`;

  const filteredEntries = activeEntries.filter(
    (item) =>
      String(item.material || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.supplier || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 md:p-8 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
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
      <div className="flex items-center gap-3 overflow-x-auto pb-0.5 no-scrollbar">
        {/* Material Expenses */}
        <button
          onClick={() => setActiveTab('Material')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Material'
              ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <Package size={15} />
          <span>Material Expenses ({siteExpenses.filter((e) => e.category === 'Materials').length})</span>
        </button>

        {/* Labour Expenses */}
        <button
          onClick={() => setActiveTab('Labour')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Labour'
              ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <HardHat size={15} />
          <span>Labour Expenses ({siteExpenses.filter((e) => e.category === 'Labour').length})</span>
        </button>

        {/* Rental Expenses */}
        <button
          onClick={() => setActiveTab('Rental')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Rental'
              ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <Truck size={15} />
          <span>Rental Expenses ({siteExpenses.filter((e) => e.category === 'Rental' || e.category === 'Vehicle Rent' || e.category === 'Rent').length})</span>
        </button>

        {/* Additional Work Expenses */}
        <button
          onClick={() => setActiveTab('Additional Work')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'Additional Work'
              ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/20'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <Zap size={15} />
          <span>Additional Work ({siteExpenses.filter((e) => e.category === 'Additional Work').length})</span>
        </button>
      </div>

      {/* 5. Expenses Data Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {activeTab === 'Material' && <Package size={17} />}
              {activeTab === 'Labour' && <HardHat size={17} />}
              {activeTab === 'Rental' && <Truck size={17} />}
              {activeTab === 'Additional Work' && <Zap size={17} />}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {activeTab} Expenses
            </h3>
            <span className="text-xs text-slate-400 font-medium ml-1">Total:</span>
            <span className="text-sm font-extrabold text-emerald-700">
              {currentTabTotal}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64 md:w-72">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()} expenses...`}
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
                <th className="py-3.5 px-4">{activeTab === 'Material' ? 'Material' : 'Item / Work'}</th>
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
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <Clock size={24} className="mx-auto mb-2 text-slate-300 animate-spin" />
                    <div className="font-semibold text-slate-600">Loading site expenses...</div>
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <Package size={28} className="mx-auto mb-2 text-slate-300" />
                    <div className="font-bold text-slate-600">No {activeTab.toLowerCase()} expenses recorded for this site yet.</div>
                    <div className="text-xs text-slate-400 mt-1">Click "+ Add Expense" above to record a new expense.</div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((row, idx) => (
                  <tr key={row._id || row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
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
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {row.amount}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {row.payment === 'Paid' ? (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {row.payment !== 'Paid' && (
                          <button
                            title="Clear / Pay this bill"
                            onClick={() => handleClearPayment(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <CreditCard size={11} />
                            <span>Pay</span>
                          </button>
                        )}
                        <button
                          title="Delete expense"
                          onClick={() => handleDeleteExpense(row._id || row.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful Tip Notice */}
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-600">
        <Info size={16} className="text-emerald-600 shrink-0" />
        <span>
          <strong>Tip:</strong> Use the tabs above to filter Material, Labour, Rental, and Additional Work Expenses for <strong>{currentSite.name}</strong>.
        </span>
      </div>

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
