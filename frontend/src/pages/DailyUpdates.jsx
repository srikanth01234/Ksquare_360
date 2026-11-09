import React, { useState } from 'react';
import {
  CalendarCheck,
  Building2,
  Users,
  Layers,
  Plus,
  Search,
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
  Clock,
  User,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import AddExpenseModal from '../components/AddExpenseModal';

export default function DailyUpdates({ onExpenseAdded = () => {} }) {
  // Navigation: null = All Sites Cards View; object = Dedicated Site Daily Updates Detail View
  const [activeSite, setActiveSite] = useState(null);

  // Modals & Filters
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilterStatus, setSiteFilterStatus] = useState('All'); // 'All' | 'Active' | 'Completed' | 'On Hold'
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState('All Activities');
  const [viewMode, setViewMode] = useState('list');

  // Construction Sites Directory with Structured Codes, Status, Updates Count, and Last Updated
  const [sitesDirectory, setSitesDirectory] = useState([
    {
      id: '01',
      name: 'Green Villa',
      code: 'CHN-11-2026-NB-01',
      shortCode: 'KS-001',
      location: 'Chennai',
      client: 'Arun Kumar',
      status: 'Active',
      updatesCount: 12,
      lastUpdated: 'Today',
      progress: 75,
    },
    {
      id: '02',
      name: 'Office Renovation',
      code: 'MDU-10-2026-RE-02',
      shortCode: 'KS-002',
      location: 'Madurai',
      client: 'Kumar',
      status: 'Active',
      updatesCount: 8,
      lastUpdated: 'Yesterday',
      progress: 48,
    },
    {
      id: '03',
      name: 'RK Residence',
      code: 'TNV-09-2026-NB-03',
      shortCode: 'KS-004',
      location: 'Tirunelveli',
      client: 'Suresh',
      status: 'On Hold',
      updatesCount: 6,
      lastUpdated: '31 Oct 2026',
      progress: 30,
    },
    {
      id: '04',
      name: 'Metro Apartment',
      code: 'CHN-08-2026-NB-04',
      shortCode: 'KS-005',
      location: 'Chennai',
      client: 'Manikandan',
      status: 'Active',
      updatesCount: 9,
      lastUpdated: '30 Oct 2026',
      progress: 60,
    },
    {
      id: '05',
      name: 'Sunshine Enclave',
      code: 'TRY-05-2026-NB-05',
      shortCode: 'KS-006',
      location: 'Trichy',
      client: 'Ganesh',
      status: 'Completed',
      updatesCount: 15,
      lastUpdated: '25 Oct 2026',
      progress: 100,
    },
  ]);

  // Daily Updates Activity Records
  const [updates, setUpdates] = useState([
    {
      id: '01',
      date: '01 Nov 2026',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      activity: 'Foundation Work Continued',
      description: 'Column foundation reinforcement and formwork setup completed.',
      labourCount: 6,
      materialsUsed: 'Steel, Cement',
      duration: '8 hrs',
      progress: 60,
      status: 'In Progress',
    },
    {
      id: '02',
      date: '01 Nov 2026',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      activity: 'Plinth Beam Curing',
      description: 'Morning and evening water curing for ground beam.',
      labourCount: 2,
      materialsUsed: 'Water',
      duration: '3 hrs',
      progress: 90,
      status: 'Completed',
    },
    {
      id: '03',
      date: '31 Oct 2026',
      siteName: 'RK Residence',
      siteCode: 'KS-004',
      activity: 'Brick Work in Progress',
      description: 'Ground floor brick work (East wall) – 45% completed.',
      labourCount: 4,
      materialsUsed: 'Bricks, M-Sand',
      duration: '7 hrs',
      progress: 45,
      status: 'In Progress',
    },
    {
      id: '04',
      date: '31 Oct 2026',
      siteName: 'Metro Apartment',
      siteCode: 'KS-005',
      activity: 'Plastering Work Started',
      description: 'Internal wall plastering started in Block A – 1st Floor.',
      labourCount: 5,
      materialsUsed: 'Cement, Sand',
      duration: '6 hrs',
      progress: 30,
      status: 'In Progress',
    },
    {
      id: '05',
      date: '30 Oct 2026',
      siteName: 'Office Renovation',
      siteCode: 'KS-002',
      activity: 'Painting Work',
      description: 'Primer coating completed in all rooms.',
      labourCount: 3,
      materialsUsed: 'Paint, Primer',
      duration: '5 hrs',
      progress: 100,
      status: 'Completed',
    },
    {
      id: '06',
      date: '29 Oct 2026',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      activity: 'Site Preparation & Leveling',
      description: 'Leveling and cleaning work completed before excavation.',
      labourCount: 4,
      materialsUsed: 'Sand, Gravel',
      duration: '4 hrs',
      progress: 100,
      status: 'Completed',
    },
    {
      id: '07',
      date: '25 Oct 2026',
      siteName: 'Sunshine Enclave',
      siteCode: 'KS-006',
      activity: 'Final Handover Inspection',
      description: 'Client walk-through and handover punch list signoff.',
      labourCount: 2,
      materialsUsed: '-',
      duration: '5 hrs',
      progress: 100,
      status: 'Completed',
    },
  ]);

  // Handle adding an expense recorded from the Site Detail page
  const handleAddExpenseFromModal = (newExp) => {
    const targetSiteName = activeSite ? activeSite.name : newExp.siteName || 'Green Villa';
    const targetSiteCode = activeSite
      ? activeSite.shortCode || activeSite.code
      : newExp.siteCode || 'KS-001';

    const formattedUpdate = {
      id: String(updates.length + 1).padStart(2, '0'),
      date: newExp.date || new Date().toISOString().split('T')[0],
      siteName: targetSiteName,
      siteCode: targetSiteCode,
      activity: `${newExp.category} Expense: ${newExp.description}`,
      description: `${newExp.description} (${newExp.amount}) supplied by ${
        newExp.supplier || 'Vendor'
      }. Payment: ${newExp.paymentStatus}`,
      labourCount: newExp.category === 'Labour' ? Number(newExp.quantity) || 4 : 4,
      materialsUsed:
        newExp.category === 'Materials'
          ? newExp.description.split(' - ')[0] || 'Material'
          : '-',
      duration: '8 hrs',
      progress: 70,
      status: 'In Progress',
    };

    setUpdates([formattedUpdate, ...updates]);

    // Update the site's update count
    setSitesDirectory((prev) =>
      prev.map((s) =>
        s.name === targetSiteName
          ? { ...s, updatesCount: s.updatesCount + 1, lastUpdated: 'Today' }
          : s
      )
    );

    onExpenseAdded({
      ...newExp,
      siteName: targetSiteName,
      siteCode: targetSiteCode,
    });
  };

  const handleDeleteUpdate = (id) => {
    setUpdates(updates.filter((u) => u.id !== id));
  };

  // Filtered sites for Cards view
  const filteredSites = sitesDirectory.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.client.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      siteFilterStatus === 'All' || site.status === siteFilterStatus;

    return matchesSearch && matchesStatus;
  });

  // Filtered activities for active site detail view
  const siteActivities = activeSite
    ? updates.filter((u) => {
        const belongsToSite =
          u.siteName === activeSite.name ||
          u.siteCode === activeSite.shortCode ||
          u.siteCode === activeSite.code;

        const matchesQuery =
          u.activity.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
          u.description.toLowerCase().includes(activitySearchQuery.toLowerCase());

        const matchesActivity =
          selectedActivityFilter === 'All Activities' ||
          u.activity.toLowerCase().includes(selectedActivityFilter.toLowerCase());

        return belongsToSite && matchesQuery && matchesActivity;
      })
    : [];

  return (
    <div className="p-4 md:p-7 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* =========================================================================
          VIEW 1: ALL SITES AS CARDS VIEW (When activeSite is null)
          ========================================================================= */}
      {!activeSite ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <CalendarCheck size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Daily Updates
                </h1>
                <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                  Select a site to view its daily activities and recorded site progress.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                {sitesDirectory.length} Construction Sites
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Sites
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {sitesDirectory.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                All registered projects
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Active Sites
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {sitesDirectory.filter((s) => s.status === 'Active').length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Work currently ongoing
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Updates
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {updates.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Activities logged
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Updated Today
              </span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {sitesDirectory.filter((s) => s.lastUpdated === 'Today').length}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                Sites active today
              </div>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by site name, code, city, or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={siteFilterStatus}
                  onChange={(e) => setSiteFilterStatus(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Sites Grid Cards (User Request: "Daily Update page -> Need UI as card of all sites. Then click the site to enter the detail page.") */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {filteredSites.map((site) => (
              <div
                key={site.id}
                onClick={() => setActiveSite(site)}
                className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 p-5 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top: Site Name & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {site.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
                          <span className="font-mono text-slate-700 font-bold">
                            {site.shortCode || site.code}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={11} className="text-slate-400" />
                            {site.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        site.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : site.status === 'Completed'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          site.status === 'Active'
                            ? 'bg-emerald-500'
                            : site.status === 'Completed'
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {site.status}
                    </span>
                  </div>

                  {/* Project Structured Code & Client */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Project Code:</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {site.code}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Client:</span>
                    <span className="font-semibold text-slate-800">{site.client}</span>
                  </div>
                </div>

                {/* Bottom Card Footer: Updates Count & Last Updated Date */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                      {site.updatesCount} Updates
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Last update: <strong className="text-slate-700">{site.lastUpdated}</strong>
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#008744] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: DEDICATED SITE DAILY UPDATES DETAIL PAGE (When site clicked)
            User Request: "Then click the site to enter the detail page. Then need the
            'Add Expense' button, and in the popup remove the dropdown of the 'Site'."
           ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Bar with Back Button & Add Expense Button */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveSite(null)}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Back to All Sites"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {activeSite.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      activeSite.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : activeSite.status === 'Completed'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeSite.status === 'Active'
                          ? 'bg-emerald-500'
                          : activeSite.status === 'Completed'
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    {activeSite.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                  <span className="font-mono font-bold text-slate-700">{activeSite.code}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400" />
                    {activeSite.location}
                  </span>
                  <span>&bull;</span>
                  <span>Client: {activeSite.client}</span>
                </div>
              </div>
            </div>

            {/* Prominent Add Expense Button (User Request: "Then need the 'Add Expense' button") */}
            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={16} />
                <span>+ Add Expense</span>
              </button>
            </div>
          </div>

          {/* Site Activities KPI Mini Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Site Updates Logged
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {siteActivities.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Total recorded tasks
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                In Progress
              </span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {siteActivities.filter((a) => a.status === 'In Progress').length}
              </div>
              <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                Current activities
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Completed Tasks
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {siteActivities.filter((a) => a.status === 'Completed').length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Verified work
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Labour Deployed
              </span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {siteActivities.reduce((acc, a) => acc + (a.labourCount || 0), 0)}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
                Worker shifts tracked
              </div>
            </div>
          </div>

          {/* Activities Filter & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder={`Search activities for ${activeSite.name}...`}
                value={activitySearchQuery}
                onChange={(e) => setActivitySearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={selectedActivityFilter}
                  onChange={(e) => setSelectedActivityFilter(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  <option value="All Activities">All Activities</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Brick Work">Brick Work</option>
                  <option value="Plastering">Plastering</option>
                  <option value="Painting">Painting</option>
                  <option value="Expense">Expenses</option>
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                />
              </div>

              {/* View Switcher */}
              <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-white shadow-2xs">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-[#008744] text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="List View"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-[#008744] text-white shadow-2xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Activities List / Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Activity Name</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-center">Labour</th>
                    <th className="py-3.5 px-4">Materials Used</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {siteActivities.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <CalendarCheck size={32} className="mx-auto mb-2 text-slate-300" />
                        <div className="font-bold text-slate-700 text-sm">
                          No daily updates recorded for {activeSite.name} yet.
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Click "+ Add Expense" above to record a site expense and update.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    siteActivities.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{item.date}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          {item.activity}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium max-w-sm truncate">
                          {item.description}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Users size={11} />
                            {item.labourCount}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {item.materialsUsed}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {item.status === 'Completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={11} />
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock size={11} />
                              In Progress
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDeleteUpdate(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete record"
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
        </div>
      )}

      {/* Add Expense Modal with Locked Site (User Request: "and in the popup remove the dropdown of the 'Site'") */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpenseFromModal}
        lockedSite={
          activeSite
            ? `${activeSite.name} (${activeSite.shortCode || activeSite.code})`
            : null
        }
      />
    </div>
  );
}
