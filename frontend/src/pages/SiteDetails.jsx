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
} from 'lucide-react';

export default function SiteDetails({ site = null, onBack = () => {} }) {
  const [activeTab, setActiveTab] = useState('Overview');

  // Active site data (defaults to Green Villa if none passed)
  const currentSite = site || {
    name: 'Green Villa',
    code: 'KS-001',
    type: 'New Building',
    status: 'Active',
    client: 'Arun Kumar',
    contact: '+91 98765 43210',
    location: 'Chennai',
    startDate: '10 Jun 2026',
    expectedDate: '30 Apr 2027',
    estimatedBudget: '₹25,00,000',
    totalSpent: '₹15,00,000',
    balance: '₹10,00,000',
    utilization: 60,
  };

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

      {/* 2. Top Card (Reduced Length & Compact Height) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch justify-between">
        {/* Left Information */}
        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <Building2 size={22} />
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
              <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                <span>{currentSite.code}</span>
                <span className="text-slate-300">•</span>
                <span>{currentSite.type}</span>
              </div>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
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
        <div className="relative w-full md:w-80 h-32 md:h-auto bg-slate-100 shrink-0 overflow-hidden">
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
          {/* Row 1: 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Total Materials */}
            <div className="bg-[#edf9f3] rounded-xl p-3.5 border border-emerald-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Total Materials</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">18</div>
              </div>
            </div>

            {/* Assigned Labour */}
            <div className="bg-[#fff7ee] rounded-xl p-3.5 border border-amber-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Assigned Labour</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">12</div>
              </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-[#edf5ff] rounded-xl p-3.5 border border-blue-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Total Expenses</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">₹4.50 L</div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="bg-[#fef2f2] rounded-xl p-3.5 border border-rose-100/80 shadow-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Receipt size={18} />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Pending Payments</div>
                <div className="text-xl font-bold text-slate-900 tracking-tight">₹1.20 L</div>
              </div>
            </div>
          </div>

          {/* Row 2: Project Budget (Neat, Simple, Modern UI - No Chart Diagram) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Coins size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Project Budget</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                60% Spent • On Track
              </span>
            </div>

            {/* 3 Clean Stat Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Estimated Budget */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 transition-all hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Estimated Budget</span>
                  <div className="w-6 h-6 rounded-md bg-slate-200/60 text-slate-600 flex items-center justify-center">
                    <IndianRupee size={12} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                  ₹25,00,000
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Total sanctioned budget
                </div>
              </div>

              {/* Total Spent */}
              <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100/70 transition-all hover:bg-emerald-50/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700">Total Spent</span>
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ArrowUpRight size={13} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-2 tracking-tight">
                  ₹15,00,000
                </div>
                <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
                  60% of estimated budget
                </div>
              </div>

              {/* Balance */}
              <div className="bg-sky-50/40 rounded-xl p-4 border border-sky-100/70 transition-all hover:bg-sky-50/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-700">Balance</span>
                  <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center">
                    <ShieldCheck size={13} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-sky-800 mt-2 tracking-tight">
                  ₹10,00,000
                </div>
                <div className="text-[11px] text-sky-600/80 font-medium mt-0.5">
                  40% remaining funds
                </div>
              </div>
            </div>

            {/* Sleek Budget Progress Meter */}
            <div className="pt-2">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full rounded-l-full transition-all duration-500"
                  style={{ width: '60%' }}
                />
                <div
                  className="bg-sky-400 h-full rounded-r-full transition-all duration-500"
                  style={{ width: '40%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1.5 px-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>Spent: ₹15,00,000 (60%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  <span>Available: ₹10,00,000 (40%)</span>
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
                <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                  <span>₹</span>
                  <span>25,00,000</span>
                </div>
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
