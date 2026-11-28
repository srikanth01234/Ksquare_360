import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  Layers,
  Building2,
  Home,
  CheckCircle2,
  Circle,
  User,
  ChevronDown,
  Phone,
  FileEdit,
  MapPin,
  Calendar,
  IndianRupee,
  Plus,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { clientApi } from '../services/api';
import { useDropdowns } from '../context/DropdownContext';

// Structured Project Code Generator (e.g. CHN-11-2026-NB-01 or MDU-11-2026-RE-01)
const generateStructuredProjectCode = (
  city = 'Chennai',
  projectType = 'New Building',
  dateStr = null,
  runningNumber = '01'
) => {
  const cityMap = {
    Chennai: 'CHN',
    Madurai: 'MDU',
    Tirunelveli: 'TNV',
    Coimbatore: 'CBE',
    Salem: 'SLM',
    Trichy: 'TRY',
  };
  const cityCode = cityMap[city] || (city ? city.slice(0, 3).toUpperCase() : 'CHN');
  const d = dateStr ? new Date(dateStr) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;
  const month = String(validDate.getMonth() + 1).padStart(2, '0');
  const year = validDate.getFullYear();
  // Strictly 'NB' for New Building or 'RE' for Renovation
  const catCode = projectType === 'Renovation' ? 'RE' : 'NB';
  return `${cityCode}-${month}-${year}-${catCode}-${runningNumber}`;
};

export default function AddSiteModal({
  isOpen,
  onClose,
  onAddSite,
  siteToEdit = null,
  onUpdateSite = null,
}) {
  const { getOptions } = useDropdowns();
  const cityOptions = getOptions('sites.cities', ['Chennai', 'Madurai', 'Trichy', 'Tirunelveli', 'Coimbatore', 'Salem']);
  const stateOptions = getOptions('sites.states', ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh']);
  const statusOptions = getOptions('sites.statuses', ['Active', 'Completed', 'On Hold']);
  const [projectType, setProjectType] = useState('New Building');
  const [runningNumber, setRunningNumber] = useState('01');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    client: '',
    clientId: '',
    contact: '',
    description: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    startDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    budget: '',
    status: 'Active', // 'Active' | 'Completed' | 'On Hold'
  });

  // Client Searchable Dropdown State (from Master Data -> Clients)
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientError, setClientError] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const clientDropdownRef = useRef(null);
  const [knownClients, setKnownClients] = useState([]);

  // Load existing clients from Master Data -> Clients on open
  useEffect(() => {
    if (isOpen) {
      setClientError('');
      loadClientsFromBackend();
    }
  }, [isOpen]);

  const loadClientsFromBackend = async () => {
    try {
      setLoadingClients(true);
      const res = await clientApi.getAll();
      const list = res.data || res || [];
      const formatted = Array.isArray(list)
        ? list.map((c) => ({
            id: c._id || c.id,
            name: c.name || '',
            type: c.type || 'Individual',
            phone: c.phone || '',
            email: c.email || '',
            location: c.city ? `${c.city}${c.state ? `, ${c.state}` : ''}` : (c.address1 || ''),
          }))
        : [];
      setKnownClients(formatted);
    } catch (err) {
      console.warn('Could not load clients from Master Data:', err.message);
      setKnownClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Close client dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter clients based on search input
  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return knownClients;
    return knownClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q))
    );
  }, [clientSearch, knownClients]);

  // Populate data when editing or auto-generate code when creating
  useEffect(() => {
    if (isOpen) {
      if (siteToEdit) {
        setProjectType(siteToEdit.type || 'New Building');
        setFormData({
          name: siteToEdit.name || '',
          code: siteToEdit.code || '',
          client: siteToEdit.client || '',
          clientId: siteToEdit.clientId || '',
          contact: siteToEdit.contact || '',
          description: siteToEdit.description || '',
          address: siteToEdit.address || '',
          city: siteToEdit.location || 'Chennai',
          state: siteToEdit.state || 'Tamil Nadu',
          pincode: siteToEdit.pincode || '',
          startDate: siteToEdit.startDate ? siteToEdit.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
          completionDate: siteToEdit.expectedDate ? siteToEdit.expectedDate.split('T')[0] : '',
          budget: String(siteToEdit.projectBudget || siteToEdit.budget || '').replace(/[^\d.]/g, ''),
          status: siteToEdit.status || 'Active',
        });
        setClientSearch(siteToEdit.client || '');
      } else {
        const randNum = String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');
        setRunningNumber(randNum);
        const autoCode = generateStructuredProjectCode('Chennai', 'New Building', new Date().toISOString().split('T')[0], randNum);
        setProjectType('New Building');
        setFormData({
          name: '',
          code: autoCode,
          client: '',
          clientId: '',
          contact: '',
          description: '',
          address: '',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '',
          startDate: new Date().toISOString().split('T')[0],
          completionDate: '',
          budget: '',
          status: 'Active',
        });
        setClientSearch('');
      }
    }
  }, [isOpen, siteToEdit]);

  // AUTO-CHANGE Project Code whenever City, Building Type, or Start Date changes!
  useEffect(() => {
    if (isOpen && !siteToEdit) {
      const updatedCode = generateStructuredProjectCode(
        formData.city,
        projectType,
        formData.startDate,
        runningNumber
      );
      setFormData((prev) => ({ ...prev, code: updatedCode }));
    }
  }, [formData.city, projectType, formData.startDate, runningNumber, isOpen, siteToEdit]);

  const handleRegenerateCode = () => {
    const nextRand = String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');
    setRunningNumber(nextRand);
    const freshCode = generateStructuredProjectCode(formData.city, projectType, formData.startDate, nextRand);
    setFormData((prev) => ({ ...prev, code: freshCode }));
  };

  const handleSelectClient = (clientObj) => {
    setFormData((prev) => ({
      ...prev,
      client: clientObj.name,
      clientId: clientObj.id || '',
      contact: clientObj.phone || '',
    }));
    setClientSearch(clientObj.name);
    setClientError('');
    setIsClientDropdownOpen(false);
  };

  const handleClientInputChange = (e) => {
    const val = e.target.value;
    setClientSearch(val);
    setClientError('');
    setFormData((prev) => ({
      ...prev,
      client: val === prev.client ? prev.client : '',
      clientId: val === prev.client ? prev.clientId : '',
    }));
    setIsClientDropdownOpen(true);
  };

  // Quick preset completion dates (e.g. +3 Months, +6 Months, +1 Year)
  const handleQuickDuration = (monthsToAdd) => {
    const base = formData.startDate ? new Date(formData.startDate) : new Date();
    if (isNaN(base.getTime())) return;
    const target = new Date(base);
    target.setMonth(target.getMonth() + monthsToAdd);
    const formatted = target.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, completionDate: formatted }));
  };

  // Calculated duration between Start and Completion
  const durationInfo = useMemo(() => {
    if (!formData.startDate || !formData.completionDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.completionDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const approxMonths = (diffDays / 30.4).toFixed(1);
    return { days: diffDays, months: approxMonths };
  }, [formData.startDate, formData.completionDate]);

  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const matchedClient =
      knownClients.find((c) => c.id === formData.clientId) ||
      knownClients.find((c) => c.name.toLowerCase() === (formData.client || clientSearch).trim().toLowerCase());

    if (!siteToEdit && !matchedClient) {
      setClientError('Please select an existing client from Master Data → Clients.');
      setIsClientDropdownOpen(true);
      return;
    }

    const finalCode =
      formData.code || generateStructuredProjectCode(formData.city, projectType, formData.startDate, runningNumber);

    const sitePayload = {
      code: finalCode,
      name: formData.name,
      client: matchedClient ? matchedClient.name : formData.client || clientSearch,
      clientId: matchedClient ? matchedClient.id : formData.clientId || null,
      contact: formData.contact || (matchedClient ? matchedClient.phone : '') || '',
      type: projectType,
      location: formData.city || 'Chennai',
      address: formData.address || '',
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      expectedDate: formData.completionDate || '',
      budget: formData.budget ? `₹${formData.budget}` : '₹10,00,000',
      projectBudget: parseFloat(formData.budget) || 1000000,
      progress: formData.status === 'Completed' ? 100 : formData.status === 'On Hold' ? 30 : 15,
      status: formData.status || 'Active',
    };

    if (siteToEdit && onUpdateSite) {
      onUpdateSite(siteToEdit._id || siteToEdit.id, sitePayload);
    } else {
      onAddSite({
        ...sitePayload,
        id: Date.now().toString(),
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-white">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
                  <Layers size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {siteToEdit ? 'Edit Construction Project' : 'Add New Project'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {siteToEdit
                      ? `Update site details, timeline or budget for ${siteToEdit.name}.`
                      : 'Create a new construction project and start managing materials, labour, expenses and updates.'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="px-7 py-5 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section 1: Project Type */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 tracking-tight">
                  <Layers size={14} className="text-slate-600" />
                  <span>Project Type (Building Type) <span className="text-rose-500">*</span></span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: New Building */}
                  <div
                    onClick={() => setProjectType('New Building')}
                    className={`relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                      projectType === 'New Building'
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        projectType === 'New Building'
                          ? 'bg-emerald-100/70 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Building2 size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">New Building (NB)</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Construction of a new structural property
                      </div>
                    </div>
                    {projectType === 'New Building' ? (
                      <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-600 text-white" />
                    ) : (
                      <Circle size={20} className="text-slate-300" />
                    )}
                  </div>

                  {/* Option 2: Renovation */}
                  <div
                    onClick={() => setProjectType('Renovation')}
                    className={`relative flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                      projectType === 'Renovation'
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        projectType === 'Renovation'
                          ? 'bg-emerald-100/70 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Home size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">Renovation (RE)</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Modification or improvement of an existing property
                      </div>
                    </div>
                    {projectType === 'Renovation' ? (
                      <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-600 text-white" />
                    ) : (
                      <Circle size={20} className="text-slate-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Project Information */}
              <div className="space-y-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                  <Building2 size={13} />
                  <span>Project Information</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Project Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Project Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Green Villa"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Project Code (Auto Generated on city/date/type change) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Project Code <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
                        title="Auto-regenerate structured code with fresh running number"
                      >
                        <RefreshCw size={10} />
                        <span>Auto Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. CHN-11-2026-NB-01"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono shadow-2xs"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                        Auto Synced
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Auto-updates on City ({formData.city || 'Chennai'}), Type ({projectType === 'Renovation' ? 'RE' : 'NB'}), and Date.
                    </p>
                  </div>

                  {/* Client Name with Searchable Dropdown (from Master Data -> Clients) */}
                  <div className="relative" ref={clientDropdownRef}>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Client Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <User size={14} />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Search client from Master Data..."
                        value={clientSearch}
                        onChange={handleClientInputChange}
                        onFocus={() => setIsClientDropdownOpen(true)}
                        className={`w-full pl-9 pr-8 py-2.5 bg-slate-50/70 border rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs ${
                          clientError ? 'border-rose-400 ring-2 ring-rose-500/15' : 'border-slate-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setIsClientDropdownOpen((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    {clientError && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1">{clientError}</p>
                    )}

                    {/* Searchable Dropdown Menu */}
                    <AnimatePresence>
                      {isClientDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100"
                        >
                          <div className="p-2 bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Search size={11} className="text-slate-400" />
                              <span>Select Client (Master Data)</span>
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {loadingClients ? 'Loading...' : `${filteredClients.length} found`}
                            </span>
                          </div>

                          {loadingClients ? (
                            <div className="p-3 text-center text-xs text-slate-500">
                              Loading clients from Master Data...
                            </div>
                          ) : filteredClients.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-500 space-y-1">
                              <div className="font-semibold text-slate-700">
                                {knownClients.length === 0
                                  ? 'No clients found in Master Data'
                                  : `No client matching "${clientSearch}"`}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Add clients in Master Data → Clients first to avoid duplicates.
                              </div>
                            </div>
                          ) : (
                            filteredClients.map((c) => (
                              <div
                                key={c.id || c.name}
                                onClick={() => handleSelectClient(c)}
                                className={`px-3.5 py-2.5 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between transition-colors ${
                                  formData.clientId === c.id || formData.client === c.name
                                    ? 'bg-emerald-50/80 font-bold text-emerald-900'
                                    : 'text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                                    {c.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900">{c.name}</div>
                                    <div className="text-[10px] text-slate-400">
                                      {c.phone || 'No phone'} {c.location ? `• ${c.location}` : ''}
                                    </div>
                                  </div>
                                </div>
                                {(formData.clientId === c.id || formData.client === c.name) && (
                                  <Check size={14} className="text-emerald-600" />
                                )}
                              </div>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone size={14} />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Project Description (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 text-slate-400">
                        <FileEdit size={14} />
                      </div>
                      <textarea
                        rows={1}
                        placeholder="Add project notes, scope or special instructions..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Address Details */}
              <div className="space-y-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                  <MapPin size={13} />
                  <span>Address & City Location</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Project Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={1}
                      placeholder="Enter complete address (House No., Street, Area, Landmark)"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none shadow-2xs"
                    />
                  </div>

                  {/* City (Auto triggers Code Generation) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City (Location) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full appearance-none px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-8 shadow-2xs cursor-pointer"
                      >
                        {cityOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full appearance-none px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-8 shadow-2xs cursor-pointer"
                      >
                        {stateOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 600001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Section 4: Modern Date Pickers & Project Plan */}
              <div className="space-y-3 pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
                  <Calendar size={13} />
                  <span>Timeline & Project Schedule (Modern Date Pickers)</span>
                </div>

                {/* Modern Date Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date Card */}
                  <div className="p-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                        <Calendar size={14} className="text-emerald-600" />
                        <span>Start Date</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            startDate: new Date().toISOString().split('T')[0],
                          })
                        }
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 px-2 py-0.5 rounded-md bg-emerald-100/70 border border-emerald-200 cursor-pointer"
                      >
                        Set to Today
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                      />
                    </div>

                    <div className="text-[11px] text-emerald-900 font-semibold flex items-center gap-1">
                      <Check size={12} className="text-emerald-600 shrink-0" />
                      <span>{formatFriendlyDate(formData.startDate) || 'Select valid start date'}</span>
                    </div>
                  </div>

                  {/* Expected Completion Card */}
                  <div className="p-4 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-white shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                        <Clock size={14} className="text-blue-600" />
                        <span>Expected Completion</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">Quick Duration:</span>
                    </div>

                    <div className="relative">
                      <input
                        type="date"
                        required
                        min={formData.startDate}
                        value={formData.completionDate}
                        onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                      />
                    </div>

                    {/* Quick Duration Preset Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(3)}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-[10px] font-bold text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        +3 Mos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(6)}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-[10px] font-bold text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        +6 Mos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(9)}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-[10px] font-bold text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        +9 Mos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDuration(12)}
                        className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-100 text-[10px] font-bold text-blue-700 border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        +1 Year
                      </button>
                    </div>

                    <div className="text-[11px] text-blue-900 font-semibold flex items-center gap-1">
                      <Check size={12} className="text-blue-600 shrink-0" />
                      <span>{formatFriendlyDate(formData.completionDate) || 'Pick date or click +3/+6/+1Y'}</span>
                    </div>
                  </div>
                </div>

                {/* Duration Summary Bar */}
                {durationInfo && (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold">
                      <Clock size={14} className="text-emerald-600" />
                      <span>Project Planned Timeline:</span>
                      <span className="font-extrabold text-emerald-800">
                        {durationInfo.days} Days (~{durationInfo.months} Months)
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700">
                      {formatFriendlyDate(formData.startDate)} <ArrowRight size={11} className="inline mx-1" /> {formatFriendlyDate(formData.completionDate)}
                    </div>
                  </div>
                )}

                {/* Budget and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Estimated Project Budget <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <span className="font-bold text-xs">₹</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 25,00,000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Site Status <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full appearance-none px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-8 shadow-2xs cursor-pointer"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  <span>{siteToEdit ? 'Save Changes' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
