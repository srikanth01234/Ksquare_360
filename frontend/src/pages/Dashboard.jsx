import React from 'react';
import {
  Building2,
  HardHat,
  Layers,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronRight,
  Zap,
  ArrowRight,
  Clock,
  Box,
  Truck,
  Receipt,
  Wallet,
} from 'lucide-react';

export default function Dashboard() {
  // Expense Breakdown Data for Donut Chart
  const expenseCategories = [
    { label: 'Material', amount: '₹ 9.20 L', percent: '49.7%', color: '#004fc6' },
    { label: 'Labour Charge', amount: '₹ 4.60 L', percent: '24.9%', color: '#007aff' },
    { label: 'Rent', amount: '₹ 2.10 L', percent: '11.4%', color: '#06b6d4' },
    { label: 'Vehicle Rent', amount: '₹ 1.80 L', percent: '9.7%', color: '#67e8f9' },
    { label: 'Others', amount: '₹ 0.80 L', percent: '4.3%', color: '#cbd5e1' },
  ];

  // Project Progress Data
  const projects = [
    {
      name: 'Residential Building',
      code: 'KS-001',
      progress: 75,
      status: 'Active',
      statusType: 'active',
    },
    {
      name: 'Office Renovation',
      code: 'KS-002',
      progress: 48,
      status: 'Active',
      statusType: 'active',
    },
    {
      name: 'New Building',
      code: 'KS-003',
      progress: 32,
      status: 'Ongoing',
      statusType: 'ongoing',
    },
  ];

  // Quick Action Buttons
  const quickActions = [
    { label: 'Add New Site', icon: Building2 },
    { label: 'Add Labour', icon: HardHat },
    { label: 'Add Expense', icon: Wallet },
    { label: 'Create Invoice', icon: FileText },
  ];

  // Recent Activities
  const recentActivities = [
    {
      id: 1,
      title: 'Material expense added - Cement (₹65,000)',
      time: 'Today, 10:24 AM',
      icon: Box,
    },
    {
      id: 2,
      title: 'Labour wages updated - 12 Members',
      time: 'Today, 09:47 AM',
      icon: HardHat,
    },
    {
      id: 3,
      title: 'Vehicle rent added - KS-002',
      time: 'Today, 09:15 AM',
      icon: Truck,
    },
    {
      id: 4,
      title: 'Invoice created - INV-0023',
      time: 'Yesterday, 04:30 PM',
      icon: Receipt,
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Greeting & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Good Morning, Admin! <span className="inline-block">👋</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Here's your construction overview for this month.
            </p>
          </div>
        </div>

        {/* Date Filter Dropdown */}
        <button className="self-start sm:self-auto flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 transition-colors">
          <Calendar size={15} className="text-slate-500" />
          <span>Jan 01, 2025 – Jan 31, 2025</span>
          <ChevronDown size={14} className="text-slate-400 ml-1" />
        </button>
      </div>

      {/* 2. Top Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Sites */}
        <div className="bg-gradient-to-r from-[#0062e3] to-[#00b2fe] rounded-2xl p-5 text-white shadow-lg shadow-blue-500/15 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-medium text-emerald-200">
              <TrendingUp size={12} />
              <span>+2</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold tracking-tight">12</div>
            <div className="text-xs text-blue-100/90 font-medium mt-0.5">Total Sites</div>
          </div>
        </div>

        {/* Card 2: Total Labour */}
        <div className="bg-[#eef6ff] rounded-2xl p-5 border border-blue-100/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-full border border-blue-200/90 bg-white flex items-center justify-center shadow-xs">
              <HardHat size={22} className="text-[#0072ff]" />
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 text-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <TrendingUp size={12} />
              <span>+5</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">48</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Total Labour</div>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="bg-[#fff6ec] rounded-2xl p-5 border border-amber-100/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-full border border-amber-200/80 bg-white flex items-center justify-center shadow-xs">
              <Layers size={22} className="text-amber-500" />
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 text-emerald-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <TrendingUp size={12} />
              <span>+12%</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹18.50 L</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Total Expenses</div>
          </div>
        </div>

        {/* Card 4: Pending Bills */}
        <div className="bg-[#ecfaf3] rounded-2xl p-5 border border-emerald-100/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-full border border-emerald-200/80 bg-white flex items-center justify-center shadow-xs">
              <FileText size={22} className="text-emerald-500" />
            </div>
            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200/60 text-rose-500 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <TrendingDown size={12} />
              <span>-2</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">06</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Pending Bills</div>
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Expense Overview, Project Progress, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Expense Overview Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Layers size={17} className="text-blue-600" />
              <span>Expense Overview</span>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 hover:border-slate-300">
              <span>This Month</span>
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
            {/* Donut Chart */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* 1. Others: 4.3% (stroke-dasharray: 12 268) */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="16"
                  strokeDasharray="12 271"
                  strokeDashoffset="-271"
                />
                {/* 2. Vehicle Rent: 9.7% (stroke-dasharray: 27 256) */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#67e8f9"
                  strokeWidth="16"
                  strokeDasharray="27 256"
                  strokeDashoffset="-244"
                />
                {/* 3. Rent: 11.4% (stroke-dasharray: 32 251) */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="16"
                  strokeDasharray="32 251"
                  strokeDashoffset="-212"
                />
                {/* 4. Labour Charge: 24.9% (stroke-dasharray: 70 213) */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#007aff"
                  strokeWidth="16"
                  strokeDasharray="70 213"
                  strokeDashoffset="-142"
                />
                {/* 5. Material: 49.7% (stroke-dasharray: 140 143) */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#004fc6"
                  strokeWidth="16"
                  strokeDasharray="140 143"
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold text-slate-900 leading-tight">
                  ₹ 18.50 L
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Total Expenses</span>
              </div>
            </div>

            {/* Legend / Breakdown List */}
            <div className="w-full space-y-2 text-xs">
              {expenseCategories.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-900 font-semibold">{item.amount}</span>
                    <span className="text-slate-400 text-[11px]">({item.percent})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Progress (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <h3 className="text-slate-800 font-bold text-sm">Project Progress</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-4 my-auto py-2">
            {projects.map((proj) => (
              <div key={proj.code} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {proj.name}{' '}
                        <span className="text-slate-400 font-normal">({proj.code})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{proj.progress}%</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        proj.statusType === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                      }`}
                    >
                      {proj.statusType === 'active' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      )}
                      {proj.status}
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#0072ff] h-full rounded-full transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-[#0a2355] rounded-2xl p-5 text-white shadow-xl shadow-blue-950/20 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 text-white font-bold text-sm">
            <Zap size={16} className="text-amber-400 fill-amber-400" />
            <span>Quick Actions</span>
          </div>

          <div className="space-y-2.5 my-auto">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={action.label}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all text-xs font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-blue-200">
                      <ActionIcon size={15} />
                    </div>
                    <span>{action.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-white/60" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Expense Trend & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Expense Trend Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <span className="text-blue-600 font-bold">📊</span>
              <span>Expense Trend</span>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 hover:border-slate-300">
              <span>Last 6 Months</span>
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="pt-4 pb-2">
            {/* SVG Trend Line Chart */}
            <div className="relative h-44 w-full flex items-end">
              {/* Y-axis Labels */}
              <div className="flex flex-col justify-between h-full pr-3 text-[10px] text-slate-400 font-medium py-1">
                <span>25 L</span>
                <span>20 L</span>
                <span>15 L</span>
                <span>10 L</span>
                <span>5 L</span>
                <span>0</span>
              </div>

              {/* Chart SVG */}
              <div className="relative flex-1 h-full">
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40 py-1">
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-100 w-full" />
                  <div className="border-b border-slate-200 w-full" />
                </div>

                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 150"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0072ff" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#0072ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Shaded Area */}
                  <path
                    d="M 20 115 
                       C 70 115, 80 95, 115 95 
                       C 160 95, 170 70, 210 70 
                       C 250 70, 270 80, 310 80 
                       C 350 80, 370 65, 410 65 
                       C 450 65, 460 50, 485 50
                       L 485 150 L 20 150 Z"
                    fill="url(#areaGradient)"
                  />

                  {/* Curve Line */}
                  <path
                    d="M 20 115 
                       C 70 115, 80 95, 115 95 
                       C 160 95, 170 70, 210 70 
                       C 250 70, 270 80, 310 80 
                       C 350 80, 370 65, 410 65 
                       C 450 65, 460 50, 485 50"
                    fill="none"
                    stroke="#0072ff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Coordinate Data Dots */}
                  {[
                    { cx: 20, cy: 115 },
                    { cx: 115, cy: 95 },
                    { cx: 210, cy: 70 },
                    { cx: 310, cy: 80 },
                    { cx: 410, cy: 65 },
                    { cx: 485, cy: 50 },
                  ].map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={pt.cx}
                      cy={pt.cy}
                      r="4"
                      fill="#ffffff"
                      stroke="#0072ff"
                      strokeWidth="2.5"
                    />
                  ))}
                </svg>

                {/* Tooltip on last node (Jan) */}
                <div className="absolute right-0 top-3 -translate-y-1/2">
                  <div className="bg-[#0072ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md shadow-blue-500/30 flex items-center gap-1">
                    <span>₹ 18.50 L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* X-axis Labels */}
            <div className="flex justify-between pl-8 pr-2 pt-2 text-[11px] text-slate-400 font-medium">
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
            </div>
          </div>
        </div>

        {/* Recent Activities (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-50">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Clock size={16} className="text-blue-600" />
              <span>Recent Activities</span>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="py-2 space-y-4 relative">
            {/* Vertical timeline continuous line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-blue-100 pointer-events-none" />

            {recentActivities.map((act) => {
              const ActIcon = act.icon;
              return (
                <div key={act.id} className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                      <ActIcon size={15} />
                    </div>
                    <span className="text-xs font-semibold text-slate-800">{act.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

