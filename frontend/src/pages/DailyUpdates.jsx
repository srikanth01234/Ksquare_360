import React, { useState } from 'react';
import {
  CalendarCheck,
  Building2,
  Users,
  Layers,
  Plus,
  Search,
  Calendar,
  Tag,
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
} from 'lucide-react';
import AddDailyUpdateModal from '../components/AddDailyUpdateModal';

export default function DailyUpdates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedActivity, setSelectedActivity] = useState('All Activities');
  const [viewMode, setViewMode] = useState('list');

  // Initial Daily Updates Data
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
      date: '31 Oct 2026',
      siteName: 'RK Residence',
      siteCode: 'KS-004',
      activity: 'Brick Work in Progress',
      description: 'Ground floor brick work (East wall) – 45% completed.',
      labourCount: 4,
      materialsUsed: 'Bricks',
      duration: '7 hrs',
      progress: 45,
      status: 'In Progress',
    },
    {
      id: '03',
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
      id: '04',
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
      id: '05',
      date: '29 Oct 2026',
      siteName: 'Green Villa',
      siteCode: 'KS-001',
      activity: 'Site Preparation',
      description: 'Leveling and cleaning work completed.',
      labourCount: 4,
      materialsUsed: 'Sand, Gravel',
      duration: '4 hrs',
      progress: 100,
      status: 'Completed',
    },
  ]);

  const handleAddUpdate = (newUp) => {
    const formatted = {
      ...newUp,
      id: String(updates.length + 1).padStart(2, '0'),
    };
    setUpdates([formatted, ...updates]);
  };

  const handleDeleteUpdate = (id) => {
    setUpdates(updates.filter((u) => u.id !== id));
  };

  const filteredUpdates = updates.filter((item) => {
    const matchesSearch =
      item.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.siteName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSite =
      selectedSite === 'All Sites' || item.siteName === selectedSite;

    const matchesActivity =
      selectedActivity === 'All Activities' ||
      item.activity.toLowerCase().includes(selectedActivity.toLowerCase());

    return matchesSearch && matchesSite && matchesActivity;
  });

  return (
    <div className="p-5 md:p-8 space-y-5 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <CalendarCheck size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Daily Updates
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Track day-to-day construction progress, activities, resources and site status.
            </p>
          </div>
        </div>

        {/* Add Daily Update Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs md:text-sm font-bold shadow-lg shadow-emerald-800/25 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Add Daily Update</span>
        </button>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Updates */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Updates</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                128
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-100/70 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <TrendingUp size={11} />
            <span>+12%</span>
          </div>
        </div>

        {/* Active Sites */}
        <div className="bg-[#edf5ff] rounded-2xl p-5 border border-blue-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Sites</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              6
            </div>
          </div>
        </div>

        {/* Total Labour */}
        <div className="bg-[#fff7ee] rounded-2xl p-5 border border-amber-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Labour</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              342
            </div>
          </div>
        </div>

        {/* Materials Used */}
        <div className="bg-[#fef2f2] rounded-2xl p-5 border border-rose-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Materials Used</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              12 Types
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by site or activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sites */}
          <div className="relative">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Sites">All Sites</option>
              <option value="Green Villa">Green Villa</option>
              <option value="RK Residence">RK Residence</option>
              <option value="Metro Apartment">Metro Apartment</option>
              <option value="Office Renovation">Office Renovation</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Dates */}
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300">
            <Calendar size={13} className="text-slate-400" />
            <span>All Dates</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {/* Activities */}
          <div className="relative">
            <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Activities">All Activities</option>
              <option value="Foundation">Foundation</option>
              <option value="Brick">Brick Work</option>
              <option value="Plastering">Plastering</option>
              <option value="Painting">Painting</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* View Switcher */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 ml-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#008744] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#008744] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck size={17} />
            </div>
            <span>Daily Update List ({filteredUpdates.length})</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors">
            <Download size={13} className="text-slate-500" />
            <span>Export</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Site</th>
                <th className="py-3 px-4 w-80">Activity / Work Update</th>
                <th className="py-3 px-4 text-center">Labour</th>
                <th className="py-3 px-4">Materials Used</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 w-36">Work Progress</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUpdates.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Number */}
                  <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                    {item.id}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 font-medium text-slate-600 whitespace-nowrap">
                    {item.date}
                  </td>

                  {/* Site */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{item.siteName}</div>
                        <div className="text-[10px] text-slate-400">{item.siteCode}</div>
                      </div>
                    </div>
                  </td>

                  {/* Activity / Work Update */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-bold text-slate-900">{item.activity}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                  </td>

                  {/* Labour */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-semibold text-slate-700">
                      <User size={12} className="text-slate-400" />
                      <span>{item.labourCount}</span>
                    </div>
                  </td>

                  {/* Materials Used */}
                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Layers size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{item.materialsUsed}</span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1 font-medium">
                      <Clock size={12} className="text-slate-400" />
                      <span>{item.duration}</span>
                    </div>
                  </td>

                  {/* Work Progress */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#008744] h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 w-8 text-right">
                          {item.progress}%
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{item.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="View Update"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        title="Edit Update"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        title="Delete Update"
                        onClick={() => handleDeleteUpdate(item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors"
                      >
                        <Trash2 size={13} />
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
            Showing 1 – {filteredUpdates.length} of 128 updates
          </div>

          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#008744] text-white font-bold text-xs shadow-xs">
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
            <span className="text-xs text-slate-400 px-1 font-bold">...</span>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors">
              26
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Daily Update Modal */}
      <AddDailyUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUpdate={handleAddUpdate}
      />
    </div>
  );
}

