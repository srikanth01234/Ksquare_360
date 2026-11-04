import React, { useState } from 'react';
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
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';

export default function SiteExpenseDetails({
  site = null,
  onBack = () => {},
}) {
  const [activeTab, setActiveTab] = useState('Material'); // 'Material' | 'Labour' | 'Rental'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Active site data
  const currentSite = site || {
    name: 'Green Villa',
    code: 'KS-001',
    location: 'Chennai, TN',
    client: 'Arun Kumar',
    startDate: '12 Jan 2026',
    status: 'Active',
  };

  // Material entries
  const [materialEntries, setMaterialEntries] = useState([
    {
      id: 1,
      date: '01 Oct 2026',
      material: 'Cement (50 kg Bag)',
      supplier: 'Sri Cement Traders',
      qty: '50',
      unit: 'Bag',
      rate: '420.00',
      amount: '21,000.00',
      payment: 'Paid',
    },
    {
      id: 2,
      date: '02 Oct 2026',
      material: 'Sand (M-Sand)',
      supplier: 'Velan Materials',
      qty: '2',
      unit: 'Load',
      rate: '5,500.00',
      amount: '11,000.00',
      payment: 'Paid',
    },
    {
      id: 3,
      date: '05 Oct 2026',
      material: 'Bricks (Red)',
      supplier: 'Chola Bricks',
      qty: '5,000',
      unit: 'Nos',
      rate: '8.00',
      amount: '40,000.00',
      payment: 'Paid',
    },
    {
      id: 4,
      date: '07 Oct 2026',
      material: 'Steel Rod (12 mm)',
      supplier: 'VS Steel',
      qty: '1,000',
      unit: 'Kg',
      rate: '75.00',
      amount: '75,000.00',
      payment: 'Pending',
    },
    {
      id: 5,
      date: '10 Oct 2026',
      material: 'Gravel (20 mm)',
      supplier: 'Velan Materials',
      qty: '1',
      unit: 'Load',
      rate: '6,000.00',
      amount: '6,000.00',
      payment: 'Paid',
    },
  ]);

  // Labour entries
  const [labourEntries, setLabourEntries] = useState([
    {
      id: 1,
      date: '01 Oct 2026',
      material: 'Mason wages (4 Workers)',
      supplier: 'Direct Labour',
      qty: '4',
      unit: 'Days',
      rate: '1,000.00',
      amount: '4,000.00',
      payment: 'Paid',
    },
    {
      id: 2,
      date: '02 Oct 2026',
      material: 'Helper wages (6 Workers)',
      supplier: 'Direct Labour',
      qty: '6',
      unit: 'Days',
      rate: '700.00',
      amount: '4,200.00',
      payment: 'Paid',
    },
    {
      id: 3,
      date: '05 Oct 2026',
      material: 'Bar Bender contractor',
      supplier: 'Ravi & Co',
      qty: '1',
      unit: 'Lot',
      rate: '25,000.00',
      amount: '25,000.00',
      payment: 'Pending',
    },
  ]);

  // Rental entries
  const [rentalEntries, setRentalEntries] = useState([
    {
      id: 1,
      date: '03 Oct 2026',
      material: 'Concrete Mixer machine',
      supplier: 'BuildEquip Rentals',
      qty: '3',
      unit: 'Days',
      rate: '1,200.00',
      amount: '3,600.00',
      payment: 'Paid',
    },
    {
      id: 2,
      date: '06 Oct 2026',
      material: 'Lorry Transport (Steel)',
      supplier: 'City Lorry Service',
      qty: '1',
      unit: 'Trip',
      rate: '4,500.00',
      amount: '4,500.00',
      payment: 'Paid',
    },
  ]);

  const activeEntries =
    activeTab === 'Material'
      ? materialEntries
      : activeTab === 'Labour'
      ? labourEntries
      : rentalEntries;

  const currentTabTotal =
    activeTab === 'Material'
      ? '₹ 4,50,000'
      : activeTab === 'Labour'
      ? '₹ 2,75,000'
      : '₹ 1,20,000';

  const filteredEntries = activeEntries.filter(
    (item) =>
      item.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onBack}
          className="hover:text-slate-900 transition-colors cursor-pointer"
        >
          Site Expenses
        </button>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-emerald-700 font-bold">Expense Details</span>
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

        {/* Right: Date Range */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-colors">
            <Calendar size={14} className="text-slate-400" />
            <span>01 Oct 2026 – 31 Oct 2026</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* 3. 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Expenses */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Expenses</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              ₹ 8,45,000
            </div>
          </div>
        </div>

        {/* Material */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Package size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Material</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                ₹ 4,50,000
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            (53%)
          </span>
        </div>

        {/* Labour */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <HardHat size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Labour</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                ₹ 2,75,000
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            (33%)
          </span>
        </div>

        {/* Rental */}
        <div className="bg-[#fff7ee] rounded-2xl p-5 border border-amber-100/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Rental</div>
              <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                ₹ 1,20,000
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            (14%)
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
          <span>Material Expenses (32)</span>
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
          <span>Labour Expenses (18)</span>
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
          <span>Rental Expenses (9)</span>
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
                placeholder={`Search ${activeTab.toLowerCase()}, supplier...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <button className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-2xs">
              <Filter size={15} />
            </button>
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
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Qty</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-right">Rate (₹)</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                    {row.id}
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
                      <button className="text-slate-400 hover:text-slate-700 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3 text-xs">
          <span className="text-slate-500 font-medium">
            Showing 1 – {filteredEntries.length} of 32 entries
          </span>
          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronLeft size={13} />
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#008744] text-white font-bold text-xs">
              1
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs hover:bg-slate-50">
              2
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs hover:bg-slate-50">
              3
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs hover:bg-slate-50">
              4
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs hover:bg-slate-50">
              5
            </button>
            <span className="text-xs text-slate-400 px-1 font-bold">...</span>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs hover:bg-slate-50">
              7
            </button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Bottom Helpful Tip Notice */}
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs text-slate-600">
        <Info size={16} className="text-emerald-600 shrink-0" />
        <span>
          <strong>Tip:</strong> Use the tabs above to view Labour Expenses and Rental Expenses for this site.
        </span>
      </div>
    </div>
  );
}

