import React, { useState, useEffect } from 'react';
import {
  Users,
  HardHat,
  CalendarCheck,
  Wallet,
  Plus,
  Search,
  Building2,
  Layers,
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
  Phone,
  Briefcase,
  Wrench,
  Paintbrush,
  Hammer,
  Zap,
  MapPin,
  CreditCard,
  FileText,
  X,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import AddLabourModal from '../components/AddLabourModal';
import { LABOUR_WORKER_TYPES } from '../constants/constructionData';
import { labourApi, siteApi } from '../services/api';

export default function Labour() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabour, setEditingLabour] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('All Sites');
  const [selectedType, setSelectedType] = useState('All Labour Types');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [viewingLabour, setViewingLabour] = useState(null); // 'View Labour details' Modal

  // Live Labour Workers State from MongoDB Atlas
  const [labourList, setLabourList] = useState([]);
  const [sitesList, setSitesList] = useState([]);

  useEffect(() => {
    loadLabour();
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await siteApi.getAll();
      setSitesList(res.data || res || []);
    } catch (err) {
      console.warn('Could not fetch sites in Labour page:', err.message);
    }
  };

  const loadLabour = async () => {
    try {
      const res = await labourApi.getAll();
      const list = res.data || res || [];
      const formatted = list.map((l, idx) => {
        const siteName = l.siteName || (typeof l.currentSite === 'object' ? l.currentSite?.name : '') || '';
        const siteCode = l.siteCode || (typeof l.currentSite === 'object' ? l.currentSite?.code : '') || '';
        return {
          ...l,
          id: l._id || l.id || String(idx + 1).padStart(2, '0'),
          type: l.workerType || l.category || l.type || 'Mason',
          siteName: siteName || 'Unassigned',
          siteCode: siteCode,
          dailyWageNum: typeof l.dailyWage === 'number' ? l.dailyWage : parseFloat(String(l.dailyWage || 0).replace(/[^\d.]/g, '')) || 0,
          dailyWage: typeof l.dailyWage === 'number' ? `₹${l.dailyWage.toLocaleString('en-IN')}` : (l.dailyWage || '₹0'),
          otRate: typeof l.overtimeRate === 'number' ? `₹${l.overtimeRate.toLocaleString('en-IN')}` : (l.otRate || '₹0'),
          joiningDate: l.joiningDate ? new Date(l.joiningDate).toLocaleDateString('en-IN') : 'Recent',
          status: l.status || 'Active',
          avatar: l.photoUrl || l.avatar || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80',
        };
      });
      setLabourList(formatted);
    } catch (err) {
      console.warn('Could not fetch labour from backend:', err.message);
      setLabourList([]);
    }
  };

  const handleAddLabour = async (newWorker) => {
    try {
      await labourApi.create({
        name: newWorker.name,
        workerType: newWorker.workerType || newWorker.labourType,
        phone: newWorker.phone,
        currentSite: newWorker.currentSite || newWorker.siteId || null,
        dailyWage: typeof newWorker.dailyWage === 'number' ? newWorker.dailyWage : parseFloat(String(newWorker.dailyWage || '').replace(/[^\d.]/g, '')) || 800,
        overtimeRate: typeof newWorker.otRate === 'number' ? newWorker.otRate : parseFloat(String(newWorker.otRate || '').replace(/[^\d.]/g, '')) || 100,
        address: newWorker.address || '',
        aadhaarNumber: newWorker.aadhaarNumber || '',
        panNumber: newWorker.panNumber || '',
        status: newWorker.status || 'Active',
        photoUrl: newWorker.photoUrl || '',
      });
      await loadLabour();
    } catch (err) {
      console.warn('API add labour fallback:', err.message);
      const formatted = {
        ...newWorker,
        id: String(labourList.length + 1).padStart(2, '0'),
      };
      setLabourList([formatted, ...labourList]);
    }
  };

  const handleEditLabour = async (id, updatedWorker) => {
    try {
      await labourApi.update(id, {
        name: updatedWorker.name,
        workerType: updatedWorker.workerType || updatedWorker.labourType,
        phone: updatedWorker.phone,
        currentSite: updatedWorker.currentSite || updatedWorker.siteId || null,
        dailyWage: typeof updatedWorker.dailyWage === 'number' ? updatedWorker.dailyWage : parseFloat(String(updatedWorker.dailyWage || '').replace(/[^\d.]/g, '')) || 800,
        overtimeRate: typeof updatedWorker.otRate === 'number' ? updatedWorker.otRate : parseFloat(String(updatedWorker.otRate || updatedWorker.overtimeRate || '').replace(/[^\d.]/g, '')) || 100,
        address: updatedWorker.address || '',
        aadhaarNumber: updatedWorker.aadhaarNumber || '',
        panNumber: updatedWorker.panNumber || '',
        status: updatedWorker.status || 'Active',
        photoUrl: updatedWorker.photoUrl || '',
      });
      await loadLabour();
    } catch (err) {
      console.warn('API update labour fallback:', err.message);
      setLabourList((prev) =>
        prev.map((w) => (w.id === id || w._id === id ? { ...w, ...updatedWorker } : w))
      );
    } finally {
      setEditingLabour(null);
    }
  };

  const handleDeleteLabour = async (id) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) return;
    try {
      await labourApi.delete(id);
      await loadLabour();
    } catch (err) {
      console.warn('API delete labour fallback:', err.message);
      setLabourList(labourList.filter((item) => item.id !== id && item._id !== id));
    }
  };

  const filteredLabour = labourList.filter((worker) => {
    const sName = worker.siteName || '';
    const name = String(worker.name || '').toLowerCase();
    const phone = String(worker.phone || '');
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(query) ||
      phone.includes(query) ||
      sName.toLowerCase().includes(query);

    const matchesSite =
      selectedSite === 'All Sites' || sName === selectedSite;

    const matchesType =
      selectedType === 'All Labour Types' || worker.type === selectedType;

    return matchesSearch && matchesSite && matchesType;
  });

  return (
    <div className="p-5 md:p-8 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between relative">
        <div className="p-6 md:p-7 flex-1 space-y-1.5">
          <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">
            Labour
          </span>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-7 bg-emerald-600 rounded-full" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Labour Management
            </h2>
          </div>
          <p className="text-xs md:text-sm text-slate-500 max-w-lg">
            Manage workers, their details, wages and site assignments.
          </p>
        </div>

        {/* Workers Atmospheric Graphic & Add Button */}
        <div className="relative w-full md:w-96 h-28 md:h-36 overflow-hidden flex items-center justify-end px-6 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
            alt="Construction workers"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent md:from-white md:via-white/30 md:to-transparent" />

          {/* Add Labour Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs md:text-sm font-bold shadow-lg shadow-emerald-800/30 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Labour</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Cards (Total Labour, Active Workers, Present Today, Pending Wages) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Labour */}
        <div className="bg-[#edf9f3] rounded-2xl p-5 border border-emerald-100/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Total Labour</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {labourList.length}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-100/70 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
            <TrendingUp size={11} />
            <span>Active: {labourList.filter((w) => w.status === 'Active').length}</span>
          </div>
        </div>

        {/* Active Workers */}
        <div className="bg-[#eefaf2] rounded-2xl p-5 border border-emerald-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <HardHat size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Active Workers</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {labourList.filter((w) => w.status === 'Active').length}
            </div>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-[#fff7ee] rounded-2xl p-5 border border-amber-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <CalendarCheck size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Available Workers</div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {labourList.filter((w) => w.status !== 'Inactive').length}
            </div>
          </div>
        </div>

        {/* Daily Wage Total */}
        <div className="bg-[#f5f2ff] rounded-2xl p-5 border border-purple-100/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Daily Payroll</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              ₹{labourList.reduce((sum, w) => sum + (w.dailyWageNum || 0), 0).toLocaleString('en-IN')}
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
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
          />
        </div>

        {/* Filter Dropdowns */}
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
              {sitesList.map((s) => (
                <option key={s._id || s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Labour Types */}
          <div className="relative">
            <Layers size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Labour Types">All Labour Types</option>
              {LABOUR_WORKER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Contractors */}
          <div className="relative">
            <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs cursor-pointer"
            >
              <option value="All Contractors">All Contractors</option>
              <option value="Direct Hire">Direct Hire</option>
              <option value="Sub-contractor A">Sub-contractor A</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Dates */}
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300">
            <Calendar size={13} className="text-slate-400" />
            <span>All Time</span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* 4. Labour List Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table Header Bar */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={17} />
            </div>
            <span>Labour List ({filteredLabour.length})</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-xs transition-colors">
              <Download size={13} className="text-slate-500" />
              <span>Export</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {/* View Switcher */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Labour Type</th>
                <th className="py-3 px-4">Daily Wage</th>
                <th className="py-3 px-4">OT Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabour.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Number */}
                  <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                    {worker.id}
                  </td>

                  {/* Worker Name & Phone */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.avatar}
                        alt={worker.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-emerald-100 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{worker.name}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Phone size={11} />
                          <span>{worker.phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Labour Type */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        worker.typeColor || 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      <Briefcase size={12} />
                      <span>{worker.type}</span>
                    </span>
                  </td>

                  {/* Daily Wage */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {worker.dailyWage}
                  </td>

                  {/* OT Rate */}
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {worker.otRate}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    {worker.status === 'Active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>On Site</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        title="View Details"
                        onClick={() => setViewingLabour(worker)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        title="Edit Worker"
                        onClick={() => setEditingLabour(worker)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50 transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        title="Delete Worker"
                        onClick={() => handleDeleteLabour(worker.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
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
            Showing 1 – {filteredLabour.length} of {labourList.length} labourers
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
              10
            </button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Labour Modal */}
      <AddLabourModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLabour={handleAddLabour}
      />

      {/* Edit Labour Modal */}
      <AddLabourModal
        isOpen={!!editingLabour}
        onClose={() => setEditingLabour(null)}
        workerToEdit={editingLabour}
        onUpdateLabour={handleEditLabour}
      />

      {/* View Labour Details Modal */}
      {viewingLabour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3.5">
                <img
                  src={viewingLabour.avatar}
                  alt={viewingLabour.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {viewingLabour.name}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        viewingLabour.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {viewingLabour.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Worker ID: #{viewingLabour.id} &bull; {viewingLabour.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingLabour(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Profile Details Content */}
            <div className="p-6 space-y-5">
              {/* Contact & Location */}
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Contact & Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Phone size={12} className="text-emerald-600" />
                      Phone Number
                    </span>
                    <div className="text-xs font-extrabold text-slate-900 mt-1">
                      {viewingLabour.phone}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Building2 size={12} className="text-blue-600" />
                      Assigned Site
                    </span>
                    <div className="text-xs font-extrabold text-slate-900 mt-1">
                      {viewingLabour.siteName} ({viewingLabour.siteCode})
                    </div>
                  </div>

                  <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <MapPin size={12} className="text-rose-500" />
                      Residential Address
                    </span>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {viewingLabour.address || 'Chennai, Tamil Nadu'}
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC & Identity Verification */}
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  KYC & Identification Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <CreditCard size={12} className="text-indigo-600" />
                      Aadhaar Number
                    </span>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                      {viewingLabour.aadhaarNumber || 'Not provided'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <FileText size={12} className="text-amber-600" />
                      PAN Number
                    </span>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                      {viewingLabour.panNumber || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wage & Deployment */}
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Wage Rates & Enrollment
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">
                      Daily Wage
                    </span>
                    <div className="text-sm font-black text-emerald-900 mt-0.5">
                      {viewingLabour.dailyWage}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80">
                    <span className="text-[10px] font-bold text-sky-800 uppercase">
                      OT Rate
                    </span>
                    <div className="text-sm font-black text-sky-900 mt-0.5">
                      {viewingLabour.otRate}{' '}
                      <span className="text-[10px] font-semibold">/hr</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Joined On
                    </span>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {viewingLabour.joiningDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingLabour(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

