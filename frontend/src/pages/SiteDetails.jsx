import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  MapPin,
  User,
  Phone,
  IndianRupee,
  Edit,
  Plus,
  Home,
  Layers,
  Users,
  Wallet,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Receipt,
  Info,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Truck,
  TrendingUp,
} from 'lucide-react';

export default function SiteDetails({ site = null, onBack = () => {} }) {
  const [activeTab, setActiveTab] = useState('Overview');

  // Active site data (defaults to Green Villa if none passed)
  const currentSite = site || {
    name: 'Green Villa',
    code: 'CHN-11-2026-NB-01',
    type: 'New Building',
    status: 'Active',
    client: 'Arun Kumar',
    contact: '+91 98765 43210',
    location: 'Chennai, TN',
    startDate: '10 Jun 2026',
    expectedDate: '30 Apr 2027',
    projectBudget: 2500000,
    clientPaid: 1000000,
    materialsExpense: 450000,
    labourExpense: 275000,
    rentalExpense: 120000,
  };

  const materialsExpense = currentSite.materialsExpense ?? 450000;
  const labourExpense = currentSite.labourExpense ?? 275000;
  const rentalExpense = currentSite.rentalExpense ?? 120000;
  const totalExpenses = materialsExpense + labourExpense + rentalExpense; // 8,45,000

  const clientPaid = currentSite.clientPaid ?? 1000000; // 10,00,000
  const excessAmount = clientPaid - totalExpenses; // 1,55,000 (Excess advance in hand)
  const projectBudget = currentSite.projectBudget ?? 2500000;
  const clientPending = projectBudget - clientPaid; // 15,00,000

  const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN');

  const tabs = [
    { id: 'Overview', label: 'Overview', icon: Home },
    { id: 'Materials', label: 'Materials', icon: Layers },
    { id: 'Labour', label: 'Labour', icon: Users },
    { id: 'Expenses', label: 'Expenses', icon: Wallet },
    { id: 'Daily Updates', label: 'Daily Updates', icon: CalendarDays },
    { id: 'Billing', label: 'Billing', icon: FileSpreadsheet },
  ];

  // Recent Activities
  const recentActivities = [
    {
      id: 1,
      title: 'Materials added - Cement (50 Bags)',
      time: 'Today, 11:20 AM',
      color: 'bg-emerald-500',
    },
    {
      id: 2,
      title: 'Labour assigned - 2 workers',
      time: 'Today, 09:45 AM',
      color: 'bg-amber-500',
    },
    {
      id: 3,
      title: 'Expense recorded - Rental ₹3,500',
      time: 'Yesterday, 04:30 PM',
      color: 'bg-emerald-500',
    },
    {
      id: 4,
      title: 'Daily update added - Foundation work continued',
      time: 'Yesterday, 10:15 AM',
      color: 'bg-emerald-500',
    },
  ];

  // Recent Expenses
  const recentExpenses = [
    {
      id: '01',
      date: '21 Jun 2026',
      category: 'Materials',
      categoryColor: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      description: 'Cement (50 Bags)',
      amount: '₹18,000',
    },
    {
      id: '02',
      date: '20 Jun 2026',
      category: 'Labour',
      categoryColor: 'bg-amber-50 text-amber-600 border-amber-200/60',
      description: 'Mason & Helper (2)',
      amount: '₹4,000',
    },
    {
      id: '03',
      date: '18 Jun 2026',
      category: 'Rental',
      categoryColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
      description: 'Equipment Rental',
      amount: '₹3,500',
    },
  ];

  return (
    <div className="p-5 md:p-7 space-y-5 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <button
          onClick={onBack}
          className="hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Home size={14} className="text-slate-400" />
          <span>Sites</span>
        </button>
        <ChevronRight size={13} className="text-slate-400" />
        <span className="text-emerald-700 font-bold">{currentSite.name}</span>
      </nav>

      {/* 2. Top Banner Card (Clean, Spacious & Professional) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch justify-between">
        {/* Left Information */}
        <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  {currentSite.name}
                </h1>
                {currentSite.status === 'Active' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active</span>
                  </span>
                )}
                {currentSite.status === 'Completed' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-300">
                    <CheckCircle2 size={12} className="text-blue-600" />
                    <span>Completed</span>
                  </span>
                )}
                {currentSite.status === 'On Hold' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                    <Clock size={12} className="text-amber-600" />
                    <span>On Hold</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                <span className="font-semibold text-slate-700">{currentSite.code}</span>
                <span className="text-slate-300">•</span>
                <span>{currentSite.type}</span>
              </div>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 font-medium pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              <span>Client: <strong className="text-slate-800">{currentSite.client}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" />
              <span>{currentSite.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Start: <strong className="text-slate-800">{currentSite.startDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Expected: <strong className="text-slate-800">{currentSite.expectedDate}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Compact Image & Action Buttons */}
        <div className="relative w-full md:w-80 h-36 md:h-auto bg-slate-100 shrink-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
            alt="Modern Villa Architecture"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent md:bg-gradient-to-l md:from-slate-900/30 md:to-transparent" />

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-700 text-xs font-semibold shadow-sm border border-slate-200/80 backdrop-blur-sm transition-all cursor-pointer">
              <Edit size={12} />
              <span>Edit Site</span>
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold shadow-md shadow-emerald-800/30 transition-all cursor-pointer">
              <Plus size={13} />
              <span>Add Update</span>
            </button>
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

      {/* 4. Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Row 1: 4 Stat Cards - Materials, Labour, Rental, and Total Expenses */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Total Material Amount */}
            <div className="bg-[#edf9f3] rounded-xl p-3.5 border border-emerald-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Materials</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(materialsExpense)}</div>
              </div>
            </div>

            {/* Assigned Labour Amount */}
            <div className="bg-[#edf5ff] rounded-xl p-3.5 border border-blue-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Labour</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(labourExpense)}</div>
              </div>
            </div>

            {/* Rental Amount */}
            <div className="bg-[#fff7ee] rounded-xl p-3.5 border border-amber-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Truck size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Rental</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(rentalExpense)}</div>
              </div>
            </div>

            {/* Total Recorded Expenses */}
            <div className="bg-[#f5f2ff] rounded-xl p-3.5 border border-purple-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Wallet size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Total Expenses</div>
                <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(totalExpenses)}</div>
              </div>
            </div>
          </div>

          {/* Row 2: Client Payments & Cash Flow (Excess Amount in Hand) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                  <Coins size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Client Payments & Excess Balance</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Tracking advance received from client vs actual site expenditure
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${
                excessAmount >= 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${excessAmount >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>Excess in Hand: {formatCurrency(excessAmount)}</span>
              </span>
            </div>

            {/* 3 Clean Stat Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* 1. Client Paid Amount */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/80 transition-all hover:bg-blue-50/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">Client Paid Amount</span>
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CheckCircle2 size={13} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  {formatCurrency(clientPaid)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Advance received from client
                </div>
              </div>

              {/* 2. Total Site Expenses */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 transition-all hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Total Expenses Spent</span>
                  <div className="w-6 h-6 rounded-md bg-slate-200/60 text-slate-700 flex items-center justify-center">
                    <Wallet size={13} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  {formatCurrency(totalExpenses)}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Materials + Labour + Rental
                </div>
              </div>

              {/* 3. Excess Amount */}
              <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200/80 transition-all hover:bg-emerald-50 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Excess Amount (In Hand)</span>
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <TrendingUp size={13} />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2 tracking-tight">
                  {formatCurrency(excessAmount)}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Surplus cash available in hand
                </div>
              </div>
            </div>

            {/* Clean Progress Meter & Breakdown Formula */}
            <div className="pt-1 space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className="bg-purple-600 h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((totalExpenses / clientPaid) * 100))}%` }}
                />
                <div
                  className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${Math.max(0, 100 - Math.min(100, Math.round((totalExpenses / clientPaid) * 100)))}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium px-0.5 gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                  <span>Spent: <strong className="text-slate-800">{formatCurrency(totalExpenses)}</strong> ({Math.round((totalExpenses / clientPaid) * 100)}%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Excess in Hand: <strong className="text-emerald-700">{formatCurrency(excessAmount)}</strong> ({100 - Math.round((totalExpenses / clientPaid) * 100)}%)</span>
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-mono">
                  Excess = Client Paid ({formatCurrency(clientPaid)}) − Spent ({formatCurrency(totalExpenses)})
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Recent Activities & Recent Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Zap size={16} className="text-emerald-600" />
                  <span>Recent Activities</span>
                </div>
                <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="py-3 space-y-3.5 relative">
                {/* Continuous vertical track */}
                <div className="absolute left-2.5 top-5 bottom-5 w-0.5 bg-slate-100 pointer-events-none" />

                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 relative z-10 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${act.color} mt-1 shrink-0 ring-4 ring-white`} />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 leading-snug">{act.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  <span>Recent Expenses</span>
                </div>
                <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="overflow-x-auto py-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-1">#</th>
                      <th className="py-2 px-2">Date</th>
                      <th className="py-2 px-2">Category</th>
                      <th className="py-2 px-2">Description</th>
                      <th className="py-2 px-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-1 font-medium text-slate-400">{exp.id}</td>
                        <td className="py-2.5 px-2 font-medium text-slate-600 whitespace-nowrap">{exp.date}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${exp.categoryColor}`}>
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-medium text-slate-800">{exp.description}</td>
                        <td className="py-2.5 px-1 text-right font-bold text-slate-900 whitespace-nowrap">
                          {exp.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Site Information Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
              <Info size={16} className="text-emerald-600" />
              <span>Site Information</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Site Type</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-[11px]">
                  {currentSite.type}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Site Code</span>
                <span className="font-bold text-slate-900">{currentSite.code}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Client</span>
                <span className="font-bold text-slate-900">{currentSite.client}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Contact</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Phone size={13} className="text-slate-400" />
                  <span>{currentSite.contact}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Location</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{currentSite.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Estimated Budget</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(projectBudget)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Client Paid</span>
                <span className="font-bold text-blue-700 text-sm">
                  {formatCurrency(clientPaid)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Pending to Receive</span>
                <span className="font-bold text-rose-600 text-sm">
                  {formatCurrency(clientPending)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Start Date</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{currentSite.startDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Expected Completion</span>
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{currentSite.expectedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
