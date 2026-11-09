import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Plus,
  Building2,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  ChevronDown,
  Layers,
  Banknote,
  Send,
  X,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';

export default function Payments() {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'outgoing'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All Sites');
  const [selectedModeFilter, setSelectedModeFilter] = useState('All Modes');

  // Modals state
  const [isReceivedModalOpen, setIsReceivedModalOpen] = useState(false);
  const [isOutgoingModalOpen, setIsOutgoingModalOpen] = useState(false);

  // 1. Client Payments Received (Client -> Company)
  const [receivedPayments, setReceivedPayments] = useState([
    {
      id: 'RCP-2026-001',
      date: '04 Nov 2026',
      clientName: 'Arun Kumar',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      invoiceRef: 'INV-2026-001 (Milestone 2)',
      amount: 450000,
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: 'UTR92837481928',
      status: 'Cleared',
      notes: 'Received for 1st floor roof slab casting milestone',
    },
    {
      id: 'RCP-2026-002',
      date: '02 Nov 2026',
      clientName: 'Kumar',
      siteName: 'Office Renovation',
      siteCode: 'KS-002',
      invoiceRef: 'INV-2026-003 (Advance)',
      amount: 200000,
      paymentMode: 'UPI (GPay)',
      referenceNo: 'UPI-43091823901',
      status: 'Cleared',
      notes: 'Interior false ceiling & electrical advance',
    },
    {
      id: 'RCP-2026-003',
      date: '31 Oct 2026',
      clientName: 'Suresh',
      siteName: 'RK Residence',
      siteCode: 'KS-004',
      invoiceRef: 'INV-2026-005 (Foundation)',
      amount: 600000,
      paymentMode: 'Cheque',
      referenceNo: 'CHQ-882910',
      status: 'Cleared',
      notes: 'Basement foundation completion clearance',
    },
    {
      id: 'RCP-2026-004',
      date: '28 Oct 2026',
      clientName: 'Manikandan',
      siteName: 'Metro Apartment',
      siteCode: 'KS-005',
      invoiceRef: 'INV-2026-007 (Structure)',
      amount: 500000,
      paymentMode: 'Bank Transfer (RTGS)',
      referenceNo: 'RTGS992102938',
      status: 'Cleared',
      notes: 'Column shuttering and slab reinforcement',
    },
    {
      id: 'RCP-2026-005',
      date: '26 Oct 2026',
      clientName: 'Arun Kumar',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      invoiceRef: 'INV-2026-002 (Brickwork)',
      amount: 150000,
      paymentMode: 'UPI (PhonePe)',
      referenceNo: 'UPI-98402918293',
      status: 'Cleared',
      notes: 'Ground floor brick masonry stage',
    },
  ]);

  // 2. Outgoing Payments Made (Company -> Supplier / Contractor / Rental)
  const [outgoingPayments, setOutgoingPayments] = useState([
    {
      id: 'PV-2026-101',
      date: '03 Nov 2026',
      beneficiary: 'SM Traders (Cement Supplier)',
      category: 'Materials',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      billRef: 'INV-SM-4412',
      amount: 84000,
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: 'NEFT-88491029',
      status: 'Paid',
      notes: '200 Bags Cement delivery settlement',
    },
    {
      id: 'PV-2026-102',
      date: '02 Nov 2026',
      beneficiary: 'Murugan Masonry Team',
      category: 'Labour Wages',
      siteName: 'Office Renovation',
      siteCode: 'KS-002',
      billRef: 'LAB-W5-OCT',
      amount: 32000,
      paymentMode: 'Cash',
      referenceNo: 'VOUCHER-552',
      status: 'Paid',
      notes: 'Weekly wage settlement for 6 masons & helpers',
    },
    {
      id: 'PV-2026-103',
      date: '01 Nov 2026',
      beneficiary: 'City Lorry Transport',
      category: 'Vehicle Rental',
      siteName: 'RK Residence',
      siteCode: 'KS-004',
      billRef: 'LR-9921',
      amount: 14500,
      paymentMode: 'UPI (GPay)',
      referenceNo: 'UPI-77291039',
      status: 'Paid',
      notes: 'Sand & gravel transport trips',
    },
    {
      id: 'PV-2026-104',
      date: '30 Oct 2026',
      beneficiary: 'Balaji Steels & TMT',
      category: 'Materials',
      siteName: 'Metro Apartment',
      siteCode: 'KS-005',
      billRef: 'BL-8849',
      amount: 195000,
      paymentMode: 'Bank Transfer (RTGS)',
      referenceNo: 'RTGS-1102948',
      status: 'Paid',
      notes: '2.5 Tons 16mm & 12mm TMT steel batch',
    },
    {
      id: 'PV-2026-105',
      date: '29 Oct 2026',
      beneficiary: 'BuildEquip Rentals',
      category: 'Machinery Rental',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      billRef: 'EQ-0419',
      amount: 18000,
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: 'NEFT-77192039',
      status: 'Paid',
      notes: 'Concrete mixture machine 15-day rental',
    },
  ]);

  // Form state for Record Received Payment Modal
  const [receivedForm, setReceivedForm] = useState({
    clientName: 'Arun Kumar',
    siteName: 'Green Villa (KS-001)',
    invoiceRef: 'INV-2026-008',
    amount: '',
    paymentMode: 'Bank Transfer (NEFT)',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Form state for Record Outgoing Payment Modal
  const [outgoingForm, setOutgoingForm] = useState({
    beneficiary: '',
    category: 'Materials',
    siteName: 'Green Villa (KS-001)',
    billRef: '',
    amount: '',
    paymentMode: 'Bank Transfer (NEFT)',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // KPI Calculations
  const totalReceived = useMemo(() => {
    return receivedPayments.reduce((sum, item) => sum + item.amount, 0);
  }, [receivedPayments]);

  const totalOutgoing = useMemo(() => {
    return outgoingPayments.reduce((sum, item) => sum + item.amount, 0);
  }, [outgoingPayments]);

  const netBalance = totalReceived - totalOutgoing;

  // Filtered lists
  const filteredReceived = useMemo(() => {
    return receivedPayments.filter((p) => {
      const matchesSearch =
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.referenceNo.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSite =
        selectedSiteFilter === 'All Sites' || p.siteName === selectedSiteFilter;
      const matchesMode =
        selectedModeFilter === 'All Modes' || p.paymentMode.includes(selectedModeFilter);
      return matchesSearch && matchesSite && matchesMode;
    });
  }, [receivedPayments, searchQuery, selectedSiteFilter, selectedModeFilter]);

  const filteredOutgoing = useMemo(() => {
    return outgoingPayments.filter((p) => {
      const matchesSearch =
        p.beneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSite =
        selectedSiteFilter === 'All Sites' || p.siteName === selectedSiteFilter;
      const matchesMode =
        selectedModeFilter === 'All Modes' || p.paymentMode.includes(selectedModeFilter);
      return matchesSearch && matchesSite && matchesMode;
    });
  }, [outgoingPayments, searchQuery, selectedSiteFilter, selectedModeFilter]);

  const handleSaveReceived = (e) => {
    e.preventDefault();
    if (!receivedForm.amount || parseFloat(receivedForm.amount) <= 0) return;

    const siteParts = receivedForm.siteName.split(' (');
    const siteName = siteParts[0] || 'Green Villa';
    const siteCode = siteParts[1] ? siteParts[1].replace(')', '') : 'KS-001';

    const newRecord = {
      id: `RCP-2026-${String(receivedPayments.length + 1).padStart(3, '0')}`,
      date: receivedForm.date,
      clientName: receivedForm.clientName,
      siteName: siteName,
      siteCode: siteCode,
      invoiceRef: receivedForm.invoiceRef || 'Direct Advance',
      amount: parseFloat(receivedForm.amount),
      paymentMode: receivedForm.paymentMode,
      referenceNo: receivedForm.referenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Cleared',
      notes: receivedForm.notes || 'Client stage payment received',
    };

    setReceivedPayments([newRecord, ...receivedPayments]);
    setIsReceivedModalOpen(false);
    setReceivedForm({
      clientName: 'Arun Kumar',
      siteName: 'Green Villa (KS-001)',
      invoiceRef: '',
      amount: '',
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSaveOutgoing = (e) => {
    e.preventDefault();
    if (!outgoingForm.amount || parseFloat(outgoingForm.amount) <= 0) return;

    const siteParts = outgoingForm.siteName.split(' (');
    const siteName = siteParts[0] || 'Green Villa';
    const siteCode = siteParts[1] ? siteParts[1].replace(')', '') : 'KS-001';

    const newRecord = {
      id: `PV-2026-${String(outgoingPayments.length + 100).padStart(3, '0')}`,
      date: outgoingForm.date,
      beneficiary: outgoingForm.beneficiary || 'Supplier',
      category: outgoingForm.category,
      siteName: siteName,
      siteCode: siteCode,
      billRef: outgoingForm.billRef || 'Direct Voucher',
      amount: parseFloat(outgoingForm.amount),
      paymentMode: outgoingForm.paymentMode,
      referenceNo: outgoingForm.referenceNo || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Paid',
      notes: outgoingForm.notes || 'Vendor disbursement recorded',
    };

    setOutgoingPayments([newRecord, ...outgoingPayments]);
    setIsOutgoingModalOpen(false);
    setOutgoingForm({
      beneficiary: '',
      category: 'Materials',
      siteName: 'Green Villa (KS-001)',
      billRef: '',
      amount: '',
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <div className="p-4 md:p-7 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Payments Management
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 rounded-full uppercase">
                Dual Cash Flow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Distinguish between client inflows (received) and vendor outflows (expenses).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsReceivedModalOpen(true)}
            className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowDownLeft size={16} />
            <span>+ Receive Client Payment</span>
          </button>

          <button
            onClick={() => setIsOutgoingModalOpen(true)}
            className="flex items-center gap-2 bg-[#0072ff] hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowUpRight size={16} />
            <span>+ Pay Supplier / Vendor</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow (Client Received) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Client Inflow (Money Received)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ₹ {totalReceived.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="font-bold text-emerald-800">{receivedPayments.length} transactions</span>
            <span>across active sites</span>
          </div>
        </div>

        {/* Total Outflow (Paid to Suppliers) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Supplier Outflow (Money Paid)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹ {totalOutgoing.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="font-bold text-slate-800">{outgoingPayments.length} payments</span>
            <span>materials, labour & rentals</span>
          </div>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Net Operating Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${netBalance >= 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
            ₹ {netBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">Positive balance</span>
            <span>retained in treasury</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Two-Tab Switcher: Received vs Outgoing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {/* Tab 1: Received Payments */}
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/25'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ArrowDownLeft size={16} />
            <span>1. Received Payments (Client → Company)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'received' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {receivedPayments.length}
            </span>
          </button>

          {/* Tab 2: Outgoing Payments */}
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-[#0072ff] text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ArrowUpRight size={16} />
            <span>2. Outgoing Payments (Company → Supplier)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'outgoing' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {outgoingPayments.length}
            </span>
          </button>
        </div>

        {/* Active Tab Explanation Pill */}
        <div className="text-[11px] font-semibold text-slate-500">
          {activeTab === 'received'
            ? 'Payments received from clients against their sites or invoices'
            : 'Payments made to material suppliers, contractors and rental providers'}
        </div>
      </div>

      {/* 4. Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder={
              activeTab === 'received'
                ? 'Search client name, site, receipt ID...'
                : 'Search supplier/vendor, category, payment ID...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="All Sites">All Sites</option>
              <option value="Green Villa">Green Villa</option>
              <option value="Office Renovation">Office Renovation</option>
              <option value="RK Residence">RK Residence</option>
              <option value="Metro Apartment">Metro Apartment</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="All Modes">All Modes</option>
              <option value="Bank">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 5. Payments Data Tables */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-xs overflow-hidden">
        {activeTab === 'received' ? (
          /* Table: Received Payments */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Receipt No.</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Site / Project</th>
                  <th className="py-3.5 px-4">Invoice / Milestone Ref</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Received Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceived.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      No client payments match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredReceived.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.date}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{item.clientName}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.siteName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{item.invoiceRef}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.paymentMode}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-sm text-emerald-700">
                          ₹ {item.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Table: Outgoing Payments */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Voucher No.</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Paid To / Beneficiary</th>
                  <th className="py-3.5 px-4">Expense Category</th>
                  <th className="py-3.5 px-4">Site / Project</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOutgoing.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-400">
                      No outgoing payments match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredOutgoing.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.date}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{item.beneficiary}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.siteName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{item.paymentMode}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-sm text-slate-950">
                          ₹ {item.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-300">
                          <CheckCircle2 size={12} className="text-blue-600" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Record Received Client Payment */}
      {isReceivedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
                  <ArrowDownLeft size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Record Received Payment</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Money received from client against a construction site.</p>
                </div>
              </div>
              <button
                onClick={() => setIsReceivedModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveReceived} className="px-6 py-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arun Kumar"
                  value={receivedForm.clientName}
                  onChange={(e) => setReceivedForm({ ...receivedForm, clientName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Construction Site <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={receivedForm.siteName}
                      onChange={(e) => setReceivedForm({ ...receivedForm, siteName: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                    >
                      <option value="Green Villa (KS-001)">Green Villa (KS-001)</option>
                      <option value="Office Renovation (KS-002)">Office Renovation (KS-002)</option>
                      <option value="RK Residence (KS-004)">RK Residence (KS-004)</option>
                      <option value="Metro Apartment (KS-005)">Metro Apartment (KS-005)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Receipt Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={receivedForm.date}
                    onChange={(e) => setReceivedForm({ ...receivedForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Received Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 50000"
                    value={receivedForm.amount}
                    onChange={(e) => setReceivedForm({ ...receivedForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={receivedForm.paymentMode}
                      onChange={(e) => setReceivedForm({ ...receivedForm, paymentMode: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                    >
                      <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                      <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
                      <option value="UPI (GPay/PhonePe)">UPI (GPay / PhonePe)</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Invoice / Milestone Reference <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-008 / Slab casting milestone"
                  value={receivedForm.invoiceRef}
                  onChange={(e) => setReceivedForm({ ...receivedForm, invoiceRef: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReceivedModalOpen(false)}
                  className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
                >
                  <ArrowDownLeft size={15} />
                  <span>Save Received Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Outgoing Vendor Payment */}
      {isOutgoingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shadow-xs shrink-0">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Record Outgoing Payment</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Money paid to material supplier, labour or equipment rental.</p>
                </div>
              </div>
              <button
                onClick={() => setIsOutgoingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveOutgoing} className="px-6 py-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Paid To / Beneficiary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SM Traders / Murugan Labour Group"
                  value={outgoingForm.beneficiary}
                  onChange={(e) => setOutgoingForm({ ...outgoingForm, beneficiary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={outgoingForm.category}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, category: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                    >
                      <option value="Materials">Materials Purchase</option>
                      <option value="Labour Wages">Labour Wages</option>
                      <option value="Vehicle Rental">Vehicle Rental</option>
                      <option value="Machinery Rental">Machinery Rental</option>
                      <option value="Contractor">Sub-Contractor</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Construction Site <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={outgoingForm.siteName}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, siteName: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                    >
                      <option value="Green Villa (KS-001)">Green Villa (KS-001)</option>
                      <option value="Office Renovation (KS-002)">Office Renovation (KS-002)</option>
                      <option value="RK Residence (KS-004)">RK Residence (KS-004)</option>
                      <option value="Metro Apartment (KS-005)">Metro Apartment (KS-005)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Paid Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 25000"
                    value={outgoingForm.amount}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Payment Mode <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={outgoingForm.paymentMode}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, paymentMode: e.target.value })}
                      className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                    >
                      <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                      <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
                      <option value="UPI (GPay/PhonePe)">UPI (GPay / PhonePe)</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Bill / Voucher / DC Reference <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-SM-8841 / Trip sheet"
                  value={outgoingForm.billRef}
                  onChange={(e) => setOutgoingForm({ ...outgoingForm, billRef: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOutgoingModalOpen(false)}
                  className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0072ff] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <ArrowUpRight size={15} />
                  <span>Save Outgoing Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

