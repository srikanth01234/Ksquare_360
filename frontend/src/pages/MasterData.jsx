import React, { useState } from 'react';
import {
  Layers,
  Users,
  HardHat,
  Package,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle2,
  Clock,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Tag,
} from 'lucide-react';
import AddClientModal from '../components/AddClientModal';
import AddEmployeeModal from '../components/AddEmployeeModal';
import AddMaterialModal from '../components/AddMaterialModal';
import { INITIAL_MATERIALS } from '../constants/materialsData';

export default function MasterData({
  materials: externalMaterials,
  setMaterials: externalSetMaterials,
}) {
  const [activeTab, setActiveTab] = useState('Clients'); // 'Clients' | 'Employees' | 'Materials'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  // Materials Master Data (Shared with Godown Stock)
  const [internalMaterials, setInternalMaterials] = useState(INITIAL_MATERIALS);
  const materialsList = externalMaterials || internalMaterials;
  const setMaterialsList = externalSetMaterials || setInternalMaterials;
  const [materialStatusFilter, setMaterialStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');

  // Start inline price editing
  const handleStartEditPrice = (mat) => {
    setEditingPriceId(mat.id);
    setEditPriceVal(String(mat.price));
  };

  // Save updated master price (Updates live master catalogue and future godown operations)
  const handleSavePrice = (id) => {
    const numeric = parseFloat(editPriceVal);
    if (!isNaN(numeric) && numeric >= 0) {
      setMaterialsList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, price: numeric } : m))
      );
    }
    setEditingPriceId(null);
  };

  // Toggle Active / Inactive status
  const handleToggleStatus = (id) => {
    setMaterialsList((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' }
          : m
      )
    );
  };

  const handleSaveMaterial = (newMat) => {
    const created = {
      id: `MAT-${Date.now().toString().slice(-4)}`,
      name: newMat.name,
      category: newMat.category || 'General',
      unit: newMat.unit || 'Bags',
      price: parseFloat(newMat.price) || 0,
      stock: 0,
      availableQuantity: 0,
      totalPurchased: 0,
      totalIssued: 0,
      minStock: 10,
      minStockLevel: 10,
      status: 'Active',
      image: newMat.image || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      description: newMat.description || 'Custom construction material added to catalogue.',
    };
    setMaterialsList((prev) => [created, ...prev]);
  };

  // Clients Data
  const [clients, setClients] = useState([
    {
      id: 1,
      initials: 'AK',
      name: 'Arun Kumar',
      type: 'Individual',
      phone: '+91 98765 43210',
      email: 'arun@gmail.com',
      location: 'Chennai, TN',
      projects: '2 Projects',
      status: 'Active',
      avatarBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 2,
      initials: 'RS',
      name: 'Ravi & Sons Constructions',
      type: 'Company',
      phone: '+91 98401 22334',
      email: 'info@ravisons.com',
      location: 'Madurai, TN',
      projects: '1 Project',
      status: 'Active',
      avatarBg: 'bg-amber-100 text-amber-800',
    },
    {
      id: 3,
      initials: 'MS',
      name: 'Maya Construction',
      type: 'Company',
      phone: '+91 97509 88776',
      email: 'maya@construction.com',
      location: 'Tirunelveli, TN',
      projects: '2 Projects',
      status: 'Active',
      avatarBg: 'bg-sky-100 text-sky-800',
    },
    {
      id: 4,
      initials: 'SK',
      name: 'Sathish Kumar',
      type: 'Individual',
      phone: '+91 98840 55667',
      email: 'sathishk@gmail.com',
      location: 'Thoothukudi, TN',
      projects: '1 Project',
      status: 'On Hold',
      avatarBg: 'bg-purple-100 text-purple-800',
    },
    {
      id: 5,
      initials: 'VG',
      name: 'Vignesh Group',
      type: 'Company',
      phone: '+91 98422 111009',
      email: 'contact@vigneshgroup.in',
      location: 'Coimbatore, TN',
      projects: '2 Projects',
      status: 'Active',
      avatarBg: 'bg-rose-100 text-rose-800',
    },
  ]);

  const handleSaveClient = (newClient) => {
    const formatted = {
      ...newClient,
      avatarBg: 'bg-emerald-100 text-emerald-800',
    };
    setClients([formatted, ...clients]);
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-5 md:p-8 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm overflow-hidden flex items-center justify-between">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Layers size={26} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
              Master Data
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Master Data
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Manage your clients, employees and construction materials in one place.
            </p>
          </div>
        </div>

        {/* Decorative Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none opacity-25 flex items-end justify-end pr-6 pb-2">
          <svg width="220" height="110" viewBox="0 0 220 110" fill="none">
            <rect x="20" y="35" width="75" height="75" stroke="#10b981" strokeWidth="1.5" />
            <line x1="20" y1="60" x2="95" y2="60" stroke="#10b981" strokeWidth="1" />
            <line x1="20" y1="85" x2="95" y2="85" stroke="#10b981" strokeWidth="1" />
            <line x1="45" y1="35" x2="45" y2="110" stroke="#10b981" strokeWidth="1" />
            <line x1="70" y1="35" x2="70" y2="110" stroke="#10b981" strokeWidth="1" />
            <line x1="140" y1="10" x2="140" y2="110" stroke="#10b981" strokeWidth="2" />
            <line x1="100" y1="20" x2="200" y2="20" stroke="#10b981" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* 2. Top 3 Master Category Cards / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Clients Tab */}
        <button
          onClick={() => setActiveTab('Clients')}
          className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer ${
            activeTab === 'Clients'
              ? 'bg-[#008744] text-white shadow-lg shadow-emerald-800/25 ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 shadow-sm'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'Clients' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <Users size={24} />
          </div>
          <div>
            <div className="text-base font-bold">Clients</div>
            <div
              className={`text-xs mt-0.5 ${
                activeTab === 'Clients' ? 'text-emerald-100' : 'text-slate-400'
              }`}
            >
              Customer and project owners
            </div>
          </div>
        </button>

        {/* Employees Tab */}
        <button
          onClick={() => setActiveTab('Employees')}
          className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer ${
            activeTab === 'Employees'
              ? 'bg-[#008744] text-white shadow-lg shadow-emerald-800/25 ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 shadow-sm'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'Employees' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <HardHat size={24} />
          </div>
          <div>
            <div className="text-base font-bold">Employees</div>
            <div
              className={`text-xs mt-0.5 ${
                activeTab === 'Employees' ? 'text-emerald-100' : 'text-slate-400'
              }`}
            >
              Engineers, supervisors and staff
            </div>
          </div>
        </button>

        {/* Materials Tab */}
        <button
          onClick={() => setActiveTab('Materials')}
          className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-300 cursor-pointer ${
            activeTab === 'Materials'
              ? 'bg-[#008744] text-white shadow-lg shadow-emerald-800/25 ring-2 ring-emerald-500/20'
              : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 shadow-sm'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'Materials' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <Package size={24} />
          </div>
          <div>
            <div className="text-base font-bold">Materials</div>
            <div
              className={`text-xs mt-0.5 ${
                activeTab === 'Materials' ? 'text-emerald-100' : 'text-slate-400'
              }`}
            >
              Construction materials and rates
            </div>
          </div>
        </button>
      </div>

      {/* 3. Main View for Active Tab */}
      {activeTab === 'Clients' && (
        <div className="space-y-5">
          {/* Action Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Clients ({clients.length})
            </h2>

            <div className="flex items-center gap-3">
              <div className="relative w-72 md:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search client by name, phone or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-2xs">
                <Filter size={15} />
              </button>

              <button
                onClick={() => setIsClientModalOpen(true)}
                className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Add Client</span>
              </button>
            </div>
          </div>

          {/* Grid Layout: Left Stats Column & Right Clients List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Stats Cards (3 cols) */}
            <div className="lg:col-span-3 space-y-3.5">
              {/* Total Clients */}
              <div className="bg-[#edf9f3] rounded-2xl p-4 border border-emerald-100/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">12</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Total Clients</div>
                </div>
              </div>

              {/* Active Projects */}
              <div className="bg-[#edf5ff] rounded-2xl p-4 border border-blue-100/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">8</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Active Projects</div>
                </div>
              </div>

              {/* Completed Projects */}
              <div className="bg-[#fff7ee] rounded-2xl p-4 border border-amber-100/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">2</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Completed Projects</div>
                </div>
              </div>

              {/* On Hold */}
              <div className="bg-[#fef2f2] rounded-2xl p-4 border border-rose-100/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">2</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">On Hold</div>
                </div>
              </div>
            </div>

            {/* Right Clients List Table (9 cols) */}
            <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Initials & Client Info */}
                    <div className="flex items-center gap-3.5 min-w-[210px]">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs ${client.avatarBg}`}
                      >
                        {client.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{client.name}</div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                          {client.type}
                        </span>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-0.5 min-w-[150px] text-[11px] text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail size={11} />
                        <span>{client.email}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 min-w-[120px]">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{client.location}</span>
                    </div>

                    {/* Projects Count */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 min-w-[90px]">
                      <Layers size={13} className="text-emerald-600" />
                      <span>{client.projects}</span>
                    </div>

                    {/* Status */}
                    <div className="min-w-[80px]">
                      {client.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>On Hold</span>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end md:self-center">
                      <button className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors">
                        <Edit2 size={13} />
                      </button>
                      <button className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs">
                <span className="text-slate-500 font-medium">Showing 1 – 5 of 12 clients</span>
                <div className="flex items-center gap-1.5">
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                    <ChevronLeft size={13} />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-[#008744] text-white font-bold text-xs">1</button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">2</button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">3</button>
                  <button className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employees Tab Placeholder with Add Trigger */}
      {activeTab === 'Employees' && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HardHat size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Employees Master</h3>
          <p className="text-xs text-slate-500 max-w-md">
            Manage your company's civil engineers, supervisors, and administrative personnel.
          </p>
          <button
            onClick={() => setIsEmployeeModalOpen(true)}
            className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/25 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Employee</span>
          </button>
        </div>
      )}

      {/* Materials Tab Content */}
      {activeTab === 'Materials' && (
        <div className="space-y-4">
          {/* Action & Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Construction Materials Catalogue ({materialsList.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Standard master rates and active availability for godown stock & billing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsMaterialModalOpen(true)}
                className="flex items-center gap-2 bg-[#0072ff] hover:bg-blue-600 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Material</span>
              </button>
            </div>
          </div>

          {/* Important Rule Notice Banner */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
            <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Master Pricing & Status Policy:</span>
              <p className="text-[11px] text-blue-800/90 leading-relaxed">
                The master price is used as the default price for godown stock records. Changing the master price will not change historical purchase prices of existing stock or previously recorded expenses. Inactive materials are hidden from new stock operations, while historical records remain accessible.
              </p>
            </div>
          </div>

          {/* Filter Bar: Status Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setMaterialStatusFilter('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  materialStatusFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Materials ({materialsList.length})
              </button>
              <button
                onClick={() => setMaterialStatusFilter('Active')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  materialStatusFilter === 'Active'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                Active ({materialsList.filter((m) => m.status === 'Active').length})
              </button>
              <button
                onClick={() => setMaterialStatusFilter('Inactive')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  materialStatusFilter === 'Inactive'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
                }`}
              >
                Inactive / Discontinued ({materialsList.filter((m) => m.status === 'Inactive').length})
              </button>
            </div>
          </div>

          {/* Materials Table with Editable Default Price & Status Toggle */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Material</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Unit</th>
                    <th className="py-3.5 px-4">Default Price (Editable)</th>
                    <th className="py-3.5 px-4 text-center">Stock Status</th>
                    <th className="py-3.5 px-4 text-center">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {materialsList
                    .filter((m) => {
                      if (materialStatusFilter === 'Active') return m.status === 'Active';
                      if (materialStatusFilter === 'Inactive') return m.status === 'Inactive';
                      return true;
                    })
                    .map((mat, idx) => {
                      const isEditing = editingPriceId === mat.id;
                      const isActive = mat.status === 'Active';

                      return (
                        <tr
                          key={mat.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            !isActive ? 'bg-slate-50/50 opacity-80' : ''
                          }`}
                        >
                          {/* Number */}
                          <td className="py-3.5 px-4 text-center text-slate-400 font-bold">
                            {idx + 1}
                          </td>

                          {/* Material Name & Photo */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                                <img
                                  src={mat.image}
                                  alt={mat.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-xs md:text-sm">
                                  {mat.name}
                                </div>
                                <div className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">
                                  {mat.description || 'Standard building material'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/50">
                              {mat.category}
                            </span>
                          </td>

                          {/* Unit */}
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {mat.unit}
                          </td>

                          {/* Editable Default Price */}
                          <td className="py-3.5 px-4">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                                <span className="font-bold text-slate-500">₹</span>
                                <input
                                  type="number"
                                  step="any"
                                  autoFocus
                                  value={editPriceVal}
                                  onChange={(e) => setEditPriceVal(e.target.value)}
                                  className="w-24 px-2 py-1 bg-white border-2 border-emerald-500 rounded-lg text-xs font-black text-slate-900 focus:outline-none shadow-xs"
                                />
                                <button
                                  onClick={() => handleSavePrice(mat.id)}
                                  className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                                  title="Save Price"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingPriceId(null)}
                                  className="w-7 h-7 rounded-lg border border-slate-300 text-slate-600 flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => handleStartEditPrice(mat)}
                                className="group inline-flex items-center gap-2 cursor-pointer p-1 -m-1 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Click to edit default price"
                              >
                                <span className="font-black text-slate-900 text-sm">
                                  ₹ {Number(mat.price).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  / {mat.unit}
                                </span>
                                <span className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">
                                  <Edit2 size={12} />
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status Toggle (Active / Inactive) */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(mat.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              }`}
                              title={`Click to mark as ${isActive ? 'Inactive' : 'Active'}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isActive ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                              <span>{mat.status}</span>
                            </button>
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleStartEditPrice(mat)}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 size={11} />
                                <span>Edit Rate</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3 Add Modals */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSaveClient={handleSaveClient}
      />

      <AddEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSaveEmployee={() => {}}
      />

      <AddMaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSaveMaterial={handleSaveMaterial}
      />
    </div>
  );
}

