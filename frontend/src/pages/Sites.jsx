import React, { useState, useEffect } from 'react';
import {
  Building2,
  HardHat,
  Clock,
  CheckCircle2,
  Search,
  MapPin,
  Layers,
  TrendingUp,
  Calendar,
  ChevronDown,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import AddSiteModal from '../components/AddSiteModal';
import { siteApi } from '../services/api';

export default function Sites({ onSelectSite = () => {} }) {
  const [editingSite, setEditingSite] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('All Site Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedDateRange, setSelectedDateRange] = useState('All Dates');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Live Sites Data from MongoDB Atlas
  const [sites, setSites] = useState([]);

  // Fetch sites on component mount
  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoading(true);
      const res = await siteApi.getAll();
      const list = res.data || res || [];
      const formatted = list.map((s, idx) => {
        const budgetNum = Number(s.projectBudget ?? s.financials?.projectBudget ?? 0);
        const clientPaidNum = Number(s.financials?.clientPaid ?? s.clientPaid ?? 0);
        const computedProgress =
          clientPaidNum > 0 && budgetNum > 0
            ? Math.min(100, Math.round((clientPaidNum / budgetNum) * 100))
            : 0;
        return {
          ...s,
          id: s._id || s.id || String(idx + 1).padStart(2, '0'),
          clientAvatar: s.client ? s.client[0].toUpperCase() : 'C',
          budget: s.budget || (budgetNum > 0 ? `₹${budgetNum.toLocaleString('en-IN')}` : '₹0'),
          progress: computedProgress,
        };
      });
      setSites(formatted);
    } catch (err) {
      console.warn('Could not fetch sites from backend, starting with clean list:', err.message);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (newSiteData) => {
    try {
      // Send directly to MongoDB API
      const res = await siteApi.create({
        name: newSiteData.name,
        code: newSiteData.code,
        client: newSiteData.client,
        contact: newSiteData.contact || '',
        type: newSiteData.type,
        location: newSiteData.location,
        address: newSiteData.address || '',
        startDate: newSiteData.startDate,
        expectedDate: newSiteData.expectedDate,
        projectBudget: typeof newSiteData.budget === 'number'
          ? newSiteData.budget
          : parseFloat(String(newSiteData.budget || '').replace(/[^\d.]/g, '')) || 0,
        status: newSiteData.status || 'Active',
      });
      await loadSites();
    } catch (err) {
      console.warn('API create fallback to local state:', err.message);
      const formattedSite = {
        ...newSiteData,
        id: String(sites.length + 1).padStart(2, '0'),
        clientAvatar: newSiteData.client ? newSiteData.client[0].toUpperCase() : 'C',
      };
      setSites([formattedSite, ...sites]);
    }
  };

  const handleDeleteSite = async (id) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;
    try {
      await siteApi.delete(id);
      await loadSites();
    } catch (err) {
      setSites(sites.filter((site) => site.id !== id && site._id !== id));
    }
  };

  const handleUpdateSite = async (id, updatedSiteData) => {
    try {
      await siteApi.update(id, updatedSiteData);
      await loadSites();
      setEditingSite(null);
    } catch (err) {
      console.warn('API update fallback to local state:', err.message);
      setSites((prev) =>
        prev.map((s) => (s._id === id || s.id === id ? { ...s, ...updatedSiteData } : s))
      );
      setEditingSite(null);
    }
  };

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLocation, selectedType, selectedStatus, selectedDateRange]);

  // Filtered sites by Search, Location, Type, Date, and Status
  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      selectedLocation === 'All Locations' ||
      site.location === selectedLocation ||
      (site.location && site.location.includes(selectedLocation));

    const matchesType =
      selectedType === 'All Site Types' || site.type === selectedType;

    const matchesStatus =
      selectedStatus === 'All Status' || site.status === selectedStatus;

    let matchesDate = true;
    if (selectedDateRange !== 'All Dates') {
      const refDate = new Date(site.startDate || site.createdAt);
      const now = new Date();
      if (!isNaN(refDate.getTime())) {
        if (selectedDateRange === 'This Month') {
          matchesDate =
            refDate.getMonth() === now.getMonth() &&
            refDate.getFullYear() === now.getFullYear();
        } else if (selectedDateRange === 'Last 3 Months') {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          matchesDate = refDate >= threeMonthsAgo;
        }
      }
    }

    return matchesSearch && matchesLocation && matchesType && matchesStatus && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSites.length / itemsPerPage));
  const paginatedSites = filteredSites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 md:p-8 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Sites Management
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Manage all your construction projects in one place.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Stat Cards (Clickable Quick Filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sites */}
        <div
          onClick={() => setSelectedStatus('All Status')}
          className={`rounded-2xl p-5 border shadow-xs flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all ${
            selectedStatus === 'All Status' ? 'bg-[#edf5ff] border-blue-300 ring-2 ring-blue-500/20' : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
          title="Filter all sites"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#0072ff]/10 text-[#0072ff] flex items-center justify-center shrink-0">
            <Building2 size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{sites.length}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Total Sites</div>
          </div>
        </div>

        {/* Active Sites */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'Active' ? 'All Status' : 'Active')}
          className={`rounded-2xl p-5 border shadow-xs flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all ${
            selectedStatus === 'Active' ? 'bg-[#edfaf3] border-emerald-400 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200/80 hover:border-emerald-200'
          }`}
          title="Filter active sites"
        >
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <HardHat size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-950 tracking-tight">
              {sites.filter((s) => s.status === 'Active').length}
            </div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Active Sites (Ongoing)</div>
          </div>
        </div>

        {/* Completed Sites */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'Completed' ? 'All Status' : 'Completed')}
          className={`rounded-2xl p-5 border shadow-xs flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all ${
            selectedStatus === 'Completed' ? 'bg-[#f0f7ff] border-blue-400 ring-2 ring-blue-500/20' : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
          title="Filter completed sites"
        >
          <div className="w-13 h-13 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-950 tracking-tight">
              {sites.filter((s) => s.status === 'Completed').length}
            </div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">Completed Sites (Finished)</div>
          </div>
        </div>

        {/* On Hold */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'On Hold' ? 'All Status' : 'On Hold')}
          className={`rounded-2xl p-5 border shadow-xs flex items-center gap-4 relative overflow-hidden cursor-pointer transition-all ${
            selectedStatus === 'On Hold' ? 'bg-[#fff9eb] border-amber-400 ring-2 ring-amber-500/20' : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
          title="Filter on hold sites"
        >
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-950 tracking-tight">
              {sites.filter((s) => s.status === 'On Hold').length}
            </div>
            <div className="text-xs text-slate-500 font-bold mt-0.5">On Hold (Stopped)</div>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by site name, client, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Location Filter */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Locations">All Locations</option>
              <option value="Chennai">Chennai</option>
              <option value="Madurai">Madurai</option>
              <option value="Trichy">Trichy</option>
              <option value="Tirunelveli">Tirunelveli</option>
            </select>
            <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Site Types">All Site Types</option>
              <option value="New Building">New Building</option>
              <option value="Renovation">Renovation</option>
            </select>
            <Layers size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter (Active, Completed, On Hold) */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active (Ongoing)</option>
              <option value="Completed">Completed (Finished)</option>
              <option value="On Hold">On Hold (Stopped)</option>
            </select>
            <TrendingUp size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Dates Filter */}
          <div className="relative">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Dates">All Dates</option>
              <option value="This Month">This Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
            </select>
            <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Sites Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Site Name</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Budget</th>
                <th className="py-3.5 px-4">Expenses</th>
                <th className="py-3.5 px-4 w-44">Progress</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSites.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300 opacity-60" />
                    <p className="font-bold text-slate-700 text-sm">No construction sites found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Create a new site in Master Data → Sites to get started.</p>
                  </td>
                </tr>
              ) : (
                paginatedSites.map((site, idx) => {
                  const rowNum = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                <tr key={site.id || site._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Number */}
                  <td className="py-4 px-4 text-center font-bold text-slate-400">
                    {rowNum}
                  </td>

                  {/* Site Name */}
                  <td className="py-4 px-4 cursor-pointer" onClick={() => onSelectSite(site)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 hover:text-blue-600 transition-colors">{site.name}</div>
                        <div className="text-[11px] text-slate-400">{site.code}</div>
                      </div>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100/80 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                        {site.clientAvatar}
                      </div>
                      <span className="font-medium text-slate-700">{site.client}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        site.type === 'New Building'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-purple-50 text-purple-600 border border-purple-100'
                      }`}
                    >
                      {site.type}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{site.location}</span>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {site.budget}
                  </td>

                  <td className="py-4 px-4 whitespace-nowrap text-xs">
                    <div className="font-bold text-slate-900">₹{(site.financials?.totalExpenses ?? 0).toLocaleString('en-IN')}</div>
                    <div className="text-slate-500">Normal ₹{(site.financials?.normalContractExpenses ?? 0).toLocaleString('en-IN')}</div>
                    <div className="text-purple-700">Additional ₹{(site.financials?.additionalWorkExpense ?? 0).toLocaleString('en-IN')}</div>
                  </td>

                  {/* Progress */}
                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      <div
                        className={`text-[11px] font-bold ${
                          (site.progress ?? 0) > 90
                            ? 'text-rose-600'
                            : (site.progress ?? 0) >= 50
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {site.progress ?? 0}%
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (site.progress ?? 0) > 90
                              ? 'bg-rose-500'
                              : (site.progress ?? 0) >= 50
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${site.progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status (Active, Completed, On Hold) */}
                  <td className="py-4 px-4 text-center">
                    {site.status === 'Active' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Active</span>
                      </span>
                    )}
                    {site.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-300">
                        <CheckCircle2 size={12} className="text-blue-600" />
                        <span>Completed</span>
                      </span>
                    )}
                    {site.status === 'On Hold' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                        <Clock size={12} className="text-amber-600" />
                        <span>On Hold</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="View Site"
                        onClick={() => onSelectSite(site)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        title="Edit Site"
                        onClick={() => setEditingSite(site)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors cursor-pointer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        title="Delete Site"
                        onClick={() => handleDeleteSite(site.id || site._id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing {filteredSites.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredSites.length)} of {filteredSites.length} sites
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#0072ff] text-white shadow-xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Site Modal */}
      <AddSiteModal
        isOpen={!!editingSite}
        siteToEdit={editingSite}
        onClose={() => {
          setEditingSite(null);
        }}
        onAddSite={handleAddSite}
        onUpdateSite={handleUpdateSite}
      />
    </div>
  );
}

