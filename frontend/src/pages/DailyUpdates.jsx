import React, { useState, useEffect } from 'react';
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
import AddDailyUpdateModal from '../components/AddDailyUpdateModal';
import { siteApi, dailyUpdateApi, expenseApi } from '../services/api';

export default function DailyUpdates({ onExpenseAdded = () => {} }) {
  // Navigation: null = All Sites Cards View; object = Dedicated Site Daily Updates Detail View
  const [activeSite, setActiveSite] = useState(null);

  // Modals & Filters
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteFilterStatus, setSiteFilterStatus] = useState('All'); // 'All' | 'Active' | 'Completed' | 'On Hold'
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState('All Activities');
  const [viewMode, setViewMode] = useState('list');

  // Live Sites Directory from MongoDB Atlas
  const [sitesDirectory, setSitesDirectory] = useState([]);

  // Live Daily Updates Activity Records from MongoDB Atlas
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    loadSitesAndUpdates();
  }, []);

  const loadSitesAndUpdates = async () => {
    try {
      const [overviewRes, updatesRes] = await Promise.all([
        dailyUpdateApi.getSitesOverview().catch(() => siteApi.getAll().catch(() => ({ data: [] }))),
        dailyUpdateApi.getAll().catch(() => ({ data: [] })),
      ]);

      const rawSites = overviewRes.data || overviewRes || [];
      const formattedSites = rawSites.map((s, idx) => ({
        ...s,
        id: s._id || s.id || String(idx + 1).padStart(2, '0'),
        shortCode: s.code ? s.code.split('-').slice(0, 2).join('-') : 'KS',
        updatesCount: s.totalUpdatesCount ?? s.updatesCount ?? 0,
        lastUpdated: s.lastUpdated ? new Date(s.lastUpdated).toLocaleDateString('en-IN') : 'Recent',
        progress: s.progress ?? (s.status === 'Completed' ? 100 : s.status === 'On Hold' ? 30 : 15),
      }));
      setSitesDirectory(formattedSites);

      const rawUpdates = updatesRes.data || updatesRes || [];
      const formattedUpdates = rawUpdates.map((u, idx) => ({
        ...u,
        id: u._id || u.id || String(idx + 1).padStart(2, '0'),
        date: u.date ? new Date(u.date).toLocaleDateString('en-IN') : 'Today',
        siteName: u.siteName || (u.site?.name) || 'Site',
        siteCode: u.siteCode || (u.site?.code) || '',
        activity: u.title || u.workPhase || u.activity || 'Site Work',
        description: u.description || u.notes || '',
        labourCount: u.workersCount ?? u.laboursPresent ?? u.labourCount ?? 0,
        materialsUsed: u.materialsUsed || '-',
        duration: u.duration || '8 hrs',
        progress: u.progress || 50,
        status: u.status || 'Completed',
      }));
      setUpdates(formattedUpdates);
    } catch (err) {
      console.warn('Could not load daily updates from backend:', err.message);
      setSitesDirectory([]);
      setUpdates([]);
    }
  };

  const handleAddUpdate = async (updateData) => {
    try {
      const targetSiteId = updateData.siteId || (activeSite ? (activeSite._id || activeSite.id) : null);
      if (targetSiteId) {
        await dailyUpdateApi.create({
          siteId: targetSiteId,
          title: updateData.title || updateData.activity || 'Daily Progress',
          description: updateData.description,
          workPhase: updateData.workPhase || 'General Construction',
          workersCount: updateData.workersCount || updateData.labourCount || 0,
          notes: updateData.notes || '',
          date: updateData.date,
        });
        await loadSitesAndUpdates();
        return;
      }
    } catch (err) {
      console.warn('Could not save daily update to DB:', err.message);
    }

    setUpdates((prev) => [{ ...updateData, id: `tmp_${Date.now()}` }, ...prev]);
  };

  // Handle adding an expense recorded from the Site Detail page
  const handleAddExpenseFromModal = async (newExp) => {
    const targetSite = activeSite || sitesDirectory.find((s) => s.name === newExp.siteName || s.code === newExp.siteCode);
    const siteId = targetSite ? (targetSite._id || targetSite.id) : null;
    const targetSiteName = targetSite ? targetSite.name : newExp.siteName || 'Site';
    const targetSiteCode = targetSite
      ? targetSite.shortCode || targetSite.code
      : newExp.siteCode || 'KS-001';

    try {
      if (siteId) {
        await expenseApi.create({
          ...newExp,
          site: siteId,
          siteId,
          siteName: targetSiteName,
          siteCode: targetSiteCode,
        });
        await dailyUpdateApi.create({
          siteId,
          title: `${newExp.category} Expense: ${newExp.description}`,
          description: `${newExp.description} (₹${newExp.amount}) - ${newExp.paymentStatus}`,
          workPhase: newExp.category,
          workersCount: newExp.category === 'Labour' ? Number(newExp.quantity) || 4 : 0,
          date: newExp.date || new Date().toISOString(),
        });
        await loadSitesAndUpdates();
        onExpenseAdded({
          ...newExp,
          siteName: targetSiteName,
          siteCode: targetSiteCode,
          siteId,
        });
        return;
      }
    } catch (err) {
      console.warn('Failed saving expense update to DB:', err.message);
    }

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

  const handleDeleteUpdate = async (id) => {
    try {
      if (id && !String(id).startsWith('tmp_')) {
        await dailyUpdateApi.delete(id);
      }
    } catch (err) {
      console.warn('Could not delete daily update in DB:', err.message);
    }
    setUpdates((prev) => prev.filter((u) => u.id !== id && u._id !== id));
    loadSitesAndUpdates();
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

            {/* Action Buttons */}
            <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={15} className="text-emerald-600" />
                <span>+ Log Update</span>
              </button>
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

      {/* Add Daily Update Modal */}
      <AddDailyUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onAddUpdate={handleAddUpdate}
        lockedSite={
          activeSite
            ? `${activeSite.name} (${activeSite.shortCode || activeSite.code})`
            : null
        }
        sites={sitesDirectory}
      />
    </div>
  );
}
