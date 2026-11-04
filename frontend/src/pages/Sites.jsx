import React, { useState } from 'react';
import {
  Building2,
  HardHat,
  Clock,
  CheckCircle2,
  Plus,
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
} from 'lucide-react';
import AddSiteModal from '../components/AddSiteModal';

export default function Sites({ onSelectSite = () => {} }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('All Site Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Initial Sites Data (Active & Ongoing Projects only - Completed sites are in Completed Sites section)
  const [sites, setSites] = useState([
    {
      id: '01',
      code: 'KS-001',
      name: 'Green Villa',
      client: 'Arun Kumar',
      clientAvatar: 'A',
      type: 'New Building',
      location: 'Chennai',
      budget: '₹25,00,000',
      progress: 75,
      status: 'Active',
    },
    {
      id: '02',
      code: 'KS-002',
      name: 'Office Renovation',
      client: 'Kumar',
      clientAvatar: 'K',
      type: 'Renovation',
      location: 'Madurai',
      budget: '₹8,00,000',
      progress: 48,
      status: 'Active',
    },
    {
      id: '03',
      code: 'KS-004',
      name: 'RK Residence',
      client: 'Suresh',
      clientAvatar: 'S',
      type: 'New Building',
      location: 'Tirunelveli',
      budget: '₹32,00,000',
      progress: 30,
      status: 'Planning',
    },
    {
      id: '04',
      code: 'KS-005',
      name: 'Metro Apartment',
      client: 'Manikandan',
      clientAvatar: 'M',
      type: 'New Building',
      location: 'Chennai',
      budget: '₹8,00,000',
      progress: 60,
      status: 'Active',
    },
  ]);

  const handleAddSite = (newSiteData) => {
    const formattedSite = {
      ...newSiteData,
      id: String(sites.length + 1).padStart(2, '0'),
      clientAvatar: newSiteData.client ? newSiteData.client[0].toUpperCase() : 'C',
    };
    setSites([formattedSite, ...sites]);
  };

  const handleDeleteSite = (id) => {
    setSites(sites.filter((site) => site.id !== id));
  };

  // Filtered sites (Completed sites excluded from this page)
  const filteredSites = sites.filter((site) => {
    if (site.status === 'Completed') return false;

    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      selectedLocation === 'All Locations' || site.location === selectedLocation;

    const matchesType =
      selectedType === 'All Site Types' || site.type === selectedType;

    const matchesStatus =
      selectedStatus === 'All Status' || site.status === selectedStatus;

    return matchesSearch && matchesLocation && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Page Header & Add Button */}
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

        {/* Add New Site Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 bg-[#0072ff] hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-xs md:text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Plus size={17} />
          <span>Add New Site</span>
        </button>
      </div>

      {/* 2. Stat Cards (Total Sites, Active Sites, Planning, Completed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sites */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/70 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="w-13 h-13 rounded-2xl bg-[#0072ff]/10 text-[#0072ff] flex items-center justify-center shrink-0">
            <Building2 size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">24</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Total Sites</div>
          </div>
        </div>

        {/* Active Sites */}
        <div className="bg-[#edfaf3] rounded-2xl p-5 border border-emerald-100/70 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <HardHat size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">12</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Active Sites</div>
          </div>
        </div>

        {/* Planning */}
        <div className="bg-[#fff6ec] rounded-2xl p-5 border border-amber-100/70 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">5</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Planning</div>
          </div>
        </div>

        {/* On Hold */}
        <div className="bg-[#f4f0ff] rounded-2xl p-5 border border-purple-100/70 shadow-xs flex items-center gap-4 relative overflow-hidden">
          <div className="w-13 h-13 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">2</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">On Hold</div>
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
            placeholder="Search by site name or client..."
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

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="On Hold">On Hold</option>
            </select>
            <TrendingUp size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Dates Filter */}
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-xs hover:border-slate-300">
            <Calendar size={14} className="text-slate-400" />
            <span>All Dates</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>
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
                <th className="py-3.5 px-4 w-44">Progress</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSites.map((site) => (
                <tr key={site.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Number */}
                  <td className="py-4 px-4 text-center font-medium text-slate-400">
                    {site.id}
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

                  {/* Progress */}
                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-700">
                        {site.progress}%
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#0072ff] h-full rounded-full transition-all duration-500"
                          style={{ width: `${site.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    {site.status === 'Active' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    )}
                    {site.status === 'Completed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-600 border border-purple-200/60">
                        <CheckCircle2 size={12} />
                        <span>Completed</span>
                      </span>
                    )}
                    {site.status === 'Planning' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200/60">
                        <Clock size={12} />
                        <span>Planning</span>
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
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        title="Delete Site"
                        onClick={() => handleDeleteSite(site.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Showing 1 – {filteredSites.length} of {sites.length} sites
          </div>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={15} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#0072ff] text-white font-bold text-xs shadow-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              3
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              4
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              5
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Site Modal */}
      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSite={handleAddSite}
      />
    </div>
  );
}

