import React, { useState, useEffect } from 'react';
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
  Trash2,
  Briefcase,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import AddClientModal from '../components/AddClientModal';
import AddEmployeeModal from '../components/AddEmployeeModal';
import AddMaterialModal from '../components/AddMaterialModal';
import { INITIAL_MATERIALS } from '../constants/materialsData';
import { materialApi, clientApi, employeeApi } from '../services/api';

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

  // Live Clients & Employees Data from MongoDB Atlas
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Load from MongoDB Atlas on mount
  useEffect(() => {
    loadMaterials();
    loadClients();
    loadEmployees();
  }, []);

  const loadMaterials = async () => {
    try {
      const res = await materialApi.getAll();
      const list = res.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        const formatted = list.map((m) => ({
          id: m._id || m.id,
          code: m.code,
          name: m.name,
          category: m.category,
          unit: m.unit,
          price: m.defaultPrice || 0,
          status: m.status || 'Active',
          stock: m.currentStock || m.stock || 0,
          img: m.imageUrl || '',
        }));
        setMaterialsList(formatted);
      }
    } catch (err) {
      console.warn('Could not load materials:', err.message);
    }
  };

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const res = await clientApi.getAll();
      const list = res.data || res || [];
      const formatted = list.map((c) => ({
        id: c._id || c.id,
        initials: c.initials || (c.name ? c.name.slice(0, 2).toUpperCase() : 'CL'),
        name: c.name,
        type: c.type || 'Individual',
        phone: c.phone || '-',
        email: c.email || '-',
        location: c.city ? `${c.city}${c.state ? `, ${c.state}` : ''}` : (c.address1 || 'Tamil Nadu'),
        projects: `${c.projectsCount || 0} Project${c.projectsCount === 1 ? '' : 's'}`,
        status: c.status || 'Active',
        avatarBg: c.type === 'Company' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
      }));
      setClients(formatted);
    } catch (err) {
      console.warn('Could not fetch clients from backend:', err.message);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await employeeApi.getAll();
      const list = res.data || res || [];
      const formatted = list.map((e) => ({
        id: e._id || e.id,
        empId: e.empId,
        initials: e.initials || (e.name ? e.name.slice(0, 2).toUpperCase() : 'EM'),
        name: e.name,
        phone: e.phone || '-',
        email: e.email || '-',
        designation: e.designation || 'Site Engineer',
        department: e.department || 'Civil',
        joiningDate: e.joiningDate ? new Date(e.joiningDate).toLocaleDateString('en-IN') : '-',
        salary: e.salary || 0,
        assignedSite: e.assignedSite || 'All Sites',
        employmentType: e.employmentType || 'Permanent',
        status: e.status || 'Active',
        avatarBg: 'bg-blue-100 text-blue-800',
      }));
      setEmployees(formatted);
    } catch (err) {
      console.warn('Could not fetch employees from backend:', err.message);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Start inline price editing
  const handleStartEditPrice = (mat) => {
    setEditingPriceId(mat.id);
    setEditPriceVal(String(mat.price));
  };

  // Save updated master price
  const handleSavePrice = async (id) => {
    const numeric = parseFloat(editPriceVal);
    if (!isNaN(numeric) && numeric >= 0) {
      try {
        await materialApi.update(id, { defaultPrice: numeric });
      } catch (err) {
        console.warn('Could not update price in DB:', err.message);
      }
      setMaterialsList((prev) =>
        prev.map((m) => (m.id === id ? { ...m, price: numeric } : m))
      );
    }
    setEditingPriceId(null);
  };

  // Toggle Active / Inactive status for Material
  const handleToggleStatus = async (id) => {
    const item = materialsList.find((m) => m.id === id);
    if (!item) return;
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await materialApi.update(id, { status: newStatus });
    } catch (err) {
      console.warn('Could not update status in DB:', err.message);
    }
    setMaterialsList((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: newStatus }
          : m
      )
    );
  };

  const handleSaveMaterial = async (newMat) => {
    try {
      const payload = {
        name: newMat.name,
        category: newMat.category || 'General',
        unit: newMat.unit || 'Bags',
        defaultPrice: parseFloat(newMat.price) || 0,
        status: 'Active',
        description: newMat.description || '',
      };
      const res = await materialApi.create(payload);
      if (res && res.data) {
        const m = res.data;
        const formatted = {
          id: m._id || m.id,
          code: m.code,
          name: m.name,
          category: m.category,
          unit: m.unit,
          price: m.defaultPrice || 0,
          status: m.status || 'Active',
          stock: 0,
          img: m.imageUrl || '',
        };
        setMaterialsList((prev) => [formatted, ...prev]);
        return;
      }
    } catch (err) {
      console.warn('Failed to save material to DB, falling back to local state:', err.message);
    }

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

  // Save new client to MongoDB Atlas
  const handleSaveClient = async (newClientData) => {
    try {
      const res = await clientApi.create(newClientData);
      if (res && res.data) {
        await loadClients();
        return;
      }
    } catch (err) {
      console.warn('Failed to save client to DB:', err.message);
    }
    // Optimistic fallback
    const initials = newClientData.name
      ? newClientData.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
      : 'CL';
    const fallback = {
      id: Date.now().toString(),
      initials,
      name: newClientData.name,
      type: newClientData.type || 'Individual',
      phone: newClientData.phone || '-',
      email: newClientData.email || '-',
      location: newClientData.city ? `${newClientData.city}, TN` : 'Tamil Nadu',
      projects: '0 Projects',
      status: 'Active',
      avatarBg: 'bg-emerald-100 text-emerald-800',
    };
    setClients((prev) => [fallback, ...prev]);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await clientApi.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.warn('Could not delete client:', err.message);
    }
  };

  // Save new employee to MongoDB Atlas
  const handleSaveEmployee = async (newEmpData) => {
    try {
      const res = await employeeApi.create(newEmpData);
      if (res && res.data) {
        await loadEmployees();
        return;
      }
    } catch (err) {
      console.warn('Failed to save employee to DB:', err.message);
    }
    // Optimistic fallback
    const initials = newEmpData.name
      ? newEmpData.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
      : 'EM';
    const fallback = {
      id: Date.now().toString(),
      empId: newEmpData.empId || `EMP-${Date.now().toString().slice(-3)}`,
      initials,
      name: newEmpData.name,
      phone: newEmpData.phone || '-',
      email: newEmpData.email || '-',
      designation: newEmpData.designation || 'Site Engineer',
      department: newEmpData.department || 'Civil',
      joiningDate: new Date().toLocaleDateString('en-IN'),
      salary: parseFloat(newEmpData.salary) || 0,
      assignedSite: newEmpData.assignedSite || 'All Sites',
      employmentType: newEmpData.employmentType || 'Permanent',
      status: 'Active',
      avatarBg: 'bg-blue-100 text-blue-800',
    };
    setEmployees((prev) => [fallback, ...prev]);
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeApi.delete(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.warn('Could not delete employee:', err.message);
    }
  };

  // Filtered queries
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.phone.includes(searchQuery)
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
          onClick={() => { setActiveTab('Clients'); setSearchQuery(''); }}
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
            <div className="text-base font-bold">Clients ({clients.length})</div>
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
          onClick={() => { setActiveTab('Employees'); setSearchQuery(''); }}
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
            <div className="text-base font-bold">Employees ({employees.length})</div>
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
          onClick={() => { setActiveTab('Materials'); setSearchQuery(''); }}
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
            <div className="text-base font-bold">Materials ({materialsList.length})</div>
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
      {/* ==================================== */}
      {/* TAB 1: CLIENTS                       */}
      {/* ==================================== */}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Stats Column (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Total Clients Card */}
              <div className="bg-[#008744] text-white rounded-3xl p-6 shadow-md shadow-emerald-800/20 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-100">Total Clients</span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <div className="text-4xl font-black mt-3">{clients.length}</div>
                <div className="text-[11px] text-emerald-100 mt-1">Saved in database</div>
              </div>

              {/* Active Clients */}
              <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-emerald-100/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">
                    {clients.filter((c) => c.status === 'Active').length}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Active Profiles</div>
                </div>
              </div>

              {/* Company vs Individual */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none">
                    {clients.filter((c) => c.type === 'Company').length}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Corporate Entities</div>
                </div>
              </div>
            </div>

            {/* Right Clients List Table (9 cols) */}
            <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {loadingClients ? (
                <div className="p-12 text-center text-slate-400">
                  <Clock size={28} className="mx-auto mb-2 text-slate-300 animate-spin" />
                  <div className="font-semibold text-slate-600">Loading clients from database...</div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <Users size={32} className="mx-auto text-slate-300" />
                  <div className="font-bold text-slate-700 text-sm">No clients found</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No clients match your search query.'
                      : 'No clients registered yet. Click "Add Client" above to create your first client profile.'}
                  </p>
                  <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-[#008744] text-white rounded-xl px-4 py-2 text-xs font-bold cursor-pointer hover:bg-[#00743a] transition-all"
                  >
                    <Plus size={14} />
                    <span>Add First Client</span>
                  </button>
                </div>
              ) : (
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
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
                          title="Delete client"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* TAB 2: EMPLOYEES                     */}
      {/* ==================================== */}
      {activeTab === 'Employees' && (
        <div className="space-y-5">
          {/* Action Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Employees Master ({employees.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Engineers, supervisors, project managers, and company staff records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-72 md:w-80">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, ID, designation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                />
              </div>

              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={16} />
                <span>Add Employee</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="text-xs font-bold text-slate-500">Total Staff</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{employees.length}</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="text-xs font-bold text-emerald-700">Active Duty</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {employees.filter((e) => e.status === 'Active').length}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="text-xs font-bold text-blue-700">Permanent Roles</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {employees.filter((e) => e.employmentType === 'Permanent').length}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
              <div className="text-xs font-bold text-amber-700">On Contract</div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {employees.filter((e) => e.employmentType === 'Contract').length}
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {loadingEmployees ? (
              <div className="p-12 text-center text-slate-400">
                <Clock size={28} className="mx-auto mb-2 text-slate-300 animate-spin" />
                <div className="font-semibold text-slate-600">Loading employees from database...</div>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <HardHat size={32} className="mx-auto text-slate-300" />
                <div className="font-bold text-slate-700 text-sm">No employees found</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? 'No employees match your search query.'
                    : 'No employees recorded yet. Click "Add Employee" above to add your first staff member.'}
                </p>
                <button
                  onClick={() => setIsEmployeeModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#008744] text-white rounded-xl px-4 py-2 text-xs font-bold cursor-pointer hover:bg-[#00743a] transition-all"
                >
                  <Plus size={14} />
                  <span>Add First Employee</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Role & Dept</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Assigned Site</th>
                      <th className="py-3.5 px-4 text-right">Salary (₹)</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {emp.initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{emp.name}</div>
                              <span className="text-[10px] font-mono text-slate-500 font-semibold">{emp.empId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{emp.designation}</div>
                          <span className="text-[10px] text-slate-500">{emp.department} • {emp.employmentType}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 font-medium">{emp.phone}</div>
                          <div className="text-[10px] text-slate-400">{emp.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {emp.assignedSite}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          ₹{emp.salary ? Number(emp.salary).toLocaleString('en-IN') : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {emp.status === 'Active' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{emp.status}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors cursor-pointer"
                            title="Delete employee"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* TAB 3: MATERIALS                     */}
      {/* ==================================== */}
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Active ({materialsList.filter((m) => m.status === 'Active').length})
              </button>
              <button
                onClick={() => setMaterialStatusFilter('Inactive')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  materialStatusFilter === 'Inactive'
                    ? 'bg-slate-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Inactive ({materialsList.filter((m) => m.status === 'Inactive').length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Material Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4 text-right">Master Rate (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materialsList
                    .filter((m) => {
                      const matchStatus =
                        materialStatusFilter === 'All' || m.status === materialStatusFilter;
                      const matchSearch =
                        !searchQuery ||
                        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()));
                      return matchStatus && matchSearch;
                    })
                    .map((mat, idx) => {
                      const isEditingPrice = editingPriceId === mat.id;
                      const isActive = mat.status === 'Active';

                      return (
                        <tr
                          key={mat.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            !isActive ? 'opacity-60 bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center text-slate-400 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                                <img
                                  src={
                                    mat.img ||
                                    mat.image ||
                                    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&q=80'
                                  }
                                  alt={mat.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src =
                                      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&q=80';
                                  }}
                                />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{mat.name}</div>
                                {mat.code && (
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {mat.code}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {mat.category || 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">
                            {mat.unit || 'Units'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isEditingPrice ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-slate-400 font-medium">₹</span>
                                <input
                                  type="number"
                                  step="any"
                                  value={editPriceVal}
                                  onChange={(e) => setEditPriceVal(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSavePrice(mat.id);
                                    if (e.key === 'Escape') setEditingPriceId(null);
                                  }}
                                  className="w-20 px-2 py-1 bg-white border-2 border-blue-500 rounded-lg text-xs font-bold text-right text-slate-900 focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSavePrice(mat.id)}
                                  className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => setEditingPriceId(null)}
                                  className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="font-bold text-slate-900">
                                ₹{Number(mat.price || 0).toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(mat.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              <span>{isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleStartEditPrice(mat)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-400 text-slate-600 hover:text-blue-600 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
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
        onSaveEmployee={handleSaveEmployee}
      />

      <AddMaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSaveMaterial={handleSaveMaterial}
      />
    </div>
  );
}
