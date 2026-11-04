import React, { useState } from 'react';
import {
  BarChart3,
  Building2,
  Home,
  Coins,
  Users,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  X,
  Calendar,
  Layers,
  TrendingUp,
} from 'lucide-react';

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const siteReports = [
    {
      id: 1,
      title: 'Dream House',
      subtitle: 'New Residential Building',
      status: 'Completed',
      statusType: 'completed',
      progress: '100%',
      expenses: '₹ 18,00,000',
      labour: '8',
      completionDate: '15 Oct 2026',
      client: 'Ravi',
      location: 'Trichy',
      themeColor: 'emerald',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      bottomWave: 'from-emerald-400/20 to-transparent',
    },
    {
      id: 2,
      title: 'Office Renovation',
      subtitle: 'Commercial Renovation',
      status: 'Completed',
      statusType: 'completed',
      progress: '100%',
      expenses: '₹ 5,40,000',
      labour: '5',
      completionDate: '28 Sep 2026',
      client: 'Kumar',
      location: 'Madurai',
      themeColor: 'purple',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      bottomWave: 'from-purple-400/20 to-transparent',
    },
    {
      id: 3,
      title: 'Kannan Residency',
      subtitle: 'Individual Villa',
      status: 'Completed',
      statusType: 'completed',
      progress: '100%',
      expenses: '₹ 22,50,000',
      labour: '12',
      completionDate: '10 Aug 2026',
      client: 'Kannan M',
      location: 'Chennai',
      themeColor: 'teal',
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
      bottomWave: 'from-teal-400/20 to-transparent',
    },
    {
      id: 4,
      title: 'Royal Arcade',
      subtitle: 'Commercial Complex Handover',
      status: 'Completed',
      statusType: 'completed',
      progress: '100%',
      expenses: '₹ 38,00,000',
      labour: '15',
      completionDate: '01 Jul 2026',
      client: 'Arun Kumar',
      location: 'Coimbatore',
      themeColor: 'blue',
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100',
      bottomWave: 'from-sky-400/20 to-transparent',
    },
    {
      id: 5,
      title: 'Green Valley Rowhouses',
      subtitle: 'Residential Housing',
      status: 'Completed',
      statusType: 'completed',
      progress: '100%',
      expenses: '₹ 29,40,000',
      labour: '10',
      completionDate: '20 May 2026',
      client: 'Vignesh Group',
      location: 'Madurai',
      themeColor: 'amber',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      bottomWave: 'from-amber-400/20 to-transparent',
    },
    {
      id: 6,
      title: 'Palm Grove Duplex',
      subtitle: 'Luxury Duplex Handover',
      status: 'Completed',
      statusType: 'completed',
      progress: '100%',
      expenses: '₹ 16,80,000',
      labour: '6',
      completionDate: '12 Mar 2026',
      client: 'Sathish Kumar',
      location: 'Thoothukudi',
      themeColor: 'rose',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      bottomWave: 'from-rose-400/20 to-transparent',
    },
  ];

  const filteredReports = siteReports.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
            <span className="w-1.5 h-4 bg-emerald-600 rounded-full inline-block" />
            <span>Completed Sites</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Completed Sites
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl">
            Archive, final expenses and handover reports of all successfully finished construction sites.
          </p>
        </div>

        {/* Decorative Top-Right Background Landscape Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none opacity-25 flex items-end justify-end pr-6 pb-2">
          <svg width="240" height="130" viewBox="0 0 240 130" fill="none">
            {/* Skeletal building */}
            <rect x="20" y="45" width="85" height="85" stroke="#10b981" strokeWidth="1.5" />
            <line x1="20" y1="70" x2="105" y2="70" stroke="#10b981" strokeWidth="1" />
            <line x1="20" y1="95" x2="105" y2="95" stroke="#10b981" strokeWidth="1" />
            <line x1="48" y1="45" x2="48" y2="130" stroke="#10b981" strokeWidth="1" />
            <line x1="76" y1="45" x2="76" y2="130" stroke="#10b981" strokeWidth="1" />
            {/* Crane */}
            <line x1="160" y1="10" x2="160" y2="130" stroke="#10b981" strokeWidth="2" />
            <line x1="110" y1="20" x2="220" y2="20" stroke="#10b981" strokeWidth="2" />
            <line x1="160" y1="10" x2="110" y2="20" stroke="#10b981" strokeWidth="1" />
            <line x1="160" y1="10" x2="220" y2="20" stroke="#10b981" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* 2. Site Reports Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((site) => (
          <div
            key={site.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-200"
          >
            {/* Top Row: Icon, Title, and Status Badge */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${site.iconBg}`}
                  >
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {site.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                      {site.subtitle}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                {site.statusType === 'in-progress' && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#064e3b] border border-emerald-200/70 whitespace-nowrap">
                    In Progress
                  </span>
                )}
                {site.statusType === 'in-progress-amber' && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70 whitespace-nowrap">
                    In Progress
                  </span>
                )}
                {site.statusType === 'completed' && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
                    Completed
                  </span>
                )}
                {site.statusType === 'on-hold' && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70 whitespace-nowrap">
                    On Hold
                  </span>
                )}
              </div>

              {/* Middle Metrics Row */}
              <div className="grid grid-cols-3 gap-2 py-6 border-b border-slate-100 mt-2">
                {/* Progress */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <BarChart3 size={14} className="text-slate-600" />
                    <span>{site.progress}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Progress</div>
                </div>

                {/* Total Expenses */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Coins size={14} className="text-amber-500" />
                    <span>{site.expenses}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Total Expenses</div>
                </div>

                {/* Labour */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Users size={14} className="text-blue-500" />
                    <span>{site.labour}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Labour</div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 flex items-center justify-between gap-3 relative z-10">
              <button
                onClick={() => setSelectedReport(site)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#043e2f] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>View Report</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={() => alert(`Downloading full report for ${site.title}...`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download size={13} className="text-slate-500" />
                <span>Download</span>
              </button>
            </div>

            {/* Subtle Colored Bottom Wave Gradient */}
            <div
              className={`absolute bottom-0 right-0 w-32 h-16 pointer-events-none rounded-br-3xl bg-gradient-to-tl ${site.bottomWave}`}
            />
          </div>
        ))}
      </div>

      {/* 3. Detailed Site Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${selectedReport.iconBg}`}>
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedReport.title} - Full Report</h2>
                  <p className="text-xs text-slate-500">{selectedReport.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs">
              {/* Stat summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Overall Progress</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{selectedReport.progress}</div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: selectedReport.progress }} />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Cumulative Expenses</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{selectedReport.expenses}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">Within budget margin</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-slate-400 font-medium">Active Workforce</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{selectedReport.labour} Workers</div>
                  <div className="text-[11px] text-slate-500 mt-1">Direct & sub-contracted</div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Expense Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">Material Procurement (Cement, Steel, Bricks)</span>
                    <span className="text-slate-900 font-bold">60%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">Labour &amp; Overtime Wages</span>
                    <span className="text-slate-900 font-bold">25%</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">Machinery &amp; Vehicle Rentals</span>
                    <span className="text-slate-900 font-bold">15%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Exporting complete PDF dossier for ${selectedReport.title}...`);
                  setSelectedReport(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043e2f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
              >
                <Download size={14} />
                <span>Export Report PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

