import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  X,
  HardHat,
  User,
  Phone,
  Building2,
  Calendar,
  IndianRupee,
  Plus,
  Wrench,
  Clock,
  Briefcase,
  MapPin,
  CreditCard,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import {
  LABOUR_WORKER_TYPES,
  CONTRACT_WORK_TYPES,
} from '../constants/constructionData';
import { siteApi } from '../services/api';
import { useDropdowns } from '../context/DropdownContext';

export default function AddLabourModal({
  isOpen,
  onClose,
  onAddLabour,
  workerToEdit = null,
  onUpdateLabour = null,
}) {
  const { getOptions } = useDropdowns();
  const workerTypesList = getOptions('labour.workerTypes', LABOUR_WORKER_TYPES);
  const contractWorkTypesList = getOptions('labour.contractWorkTypes', CONTRACT_WORK_TYPES);
  const [activeTab, setActiveTab] = useState('Daily Wage'); // 'Daily Wage' | 'Labour Contract'
  const [sitesList, setSitesList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    labourType: 'Mason',
    contractWorkType: '',
    assignedSite: '',
    siteId: '',
    dailyWage: '1000',
    otRate: '100',
    joiningDate: new Date().toISOString().split('T')[0],
    totalAreaSqft: '',
    ratePerSqft: '',
    contractStartDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: '',
    scopeNotes: '',
    status: 'Active',
    address: '',
    aadhaarNumber: '',
    panNumber: '',
    photo: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (workerToEdit) {
        const isContract = workerToEdit.engagementType === 'Labour Contract';
        setActiveTab(isContract ? 'Labour Contract' : 'Daily Wage');
        setFormData({
          name: workerToEdit.name || '',
          phone: workerToEdit.phone || '',
          labourType: workerToEdit.workerType || workerToEdit.labourType || workerToEdit.type || 'Mason',
          contractWorkType: workerToEdit.contractWorkType || (isContract ? workerToEdit.workerType : '') || '',
          assignedSite: workerToEdit.siteName && workerToEdit.siteName !== 'Unassigned'
            ? `${workerToEdit.siteName} (${workerToEdit.siteCode || ''})`
            : '',
          siteId: workerToEdit.currentSite?._id || workerToEdit.currentSite || workerToEdit.siteId || '',
          dailyWage: String(workerToEdit.dailyWageNum ?? (typeof workerToEdit.dailyWage === 'number' ? workerToEdit.dailyWage : parseFloat(String(workerToEdit.dailyWage || '').replace(/[^\d.]/g, '')) || 1000)),
          otRate: String(workerToEdit.overtimeRate ?? (typeof workerToEdit.otRate === 'number' ? workerToEdit.otRate : parseFloat(String(workerToEdit.otRate || '').replace(/[^\d.]/g, '')) || 100)),
          joiningDate: workerToEdit.joiningDate && !isNaN(new Date(workerToEdit.joiningDate).getTime()) ? new Date(workerToEdit.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalAreaSqft: workerToEdit.totalAreaSqft ? String(workerToEdit.totalAreaSqft) : '',
          ratePerSqft: workerToEdit.ratePerSqft ? String(workerToEdit.ratePerSqft) : '',
          contractStartDate: workerToEdit.contractStartDate && !isNaN(new Date(workerToEdit.contractStartDate).getTime()) ? new Date(workerToEdit.contractStartDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          expectedCompletionDate: workerToEdit.expectedCompletionDate && !isNaN(new Date(workerToEdit.expectedCompletionDate).getTime()) ? new Date(workerToEdit.expectedCompletionDate).toISOString().split('T')[0] : '',
          scopeNotes: workerToEdit.scopeNotes || '',
          status: workerToEdit.status || 'Active',
          address: workerToEdit.address || '',
          aadhaarNumber: workerToEdit.aadhaarNumber || '',
          panNumber: workerToEdit.panNumber || '',
          photo: workerToEdit.photoUrl || workerToEdit.avatar || '',
        });
      } else {
        setActiveTab('Daily Wage');
        setFormData({
          name: '',
          phone: '',
          labourType: 'Mason',
          contractWorkType: '',
          assignedSite: '',
          siteId: '',
          dailyWage: '1000',
          otRate: '100',
          joiningDate: new Date().toISOString().split('T')[0],
          totalAreaSqft: '',
          ratePerSqft: '',
          contractStartDate: new Date().toISOString().split('T')[0],
          expectedCompletionDate: '',
          scopeNotes: '',
          status: 'Active',
          address: '',
          aadhaarNumber: '',
          panNumber: '',
          photo: '',
        });
      }

      siteApi.getAll().then((res) => {
        const list = res.data || res || [];
        setSitesList(list);
        if (!workerToEdit && list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            assignedSite: prev.assignedSite || `${list[0].name} (${list[0].code})`,
            siteId: prev.siteId || list[0]._id,
          }));
        }
      }).catch((err) => {
        console.warn('Could not fetch sites in AddLabourModal:', err.message);
      });
    }
  }, [isOpen, workerToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    let siteId = formData.siteId;
    let siteName = 'Site';
    let siteCode = '';

    const matched = sitesList.find(
      (s) => `${s.name} (${s.code})` === formData.assignedSite || s._id === formData.assignedSite
    );
    if (matched) {
      siteId = matched._id;
      siteName = matched.name;
      siteCode = matched.code;
    } else if (formData.assignedSite) {
      const siteParts = formData.assignedSite.split(' (');
      siteName = siteParts[0] || 'Site';
      siteCode = siteParts[1] ? siteParts[1].replace(')', '') : '';
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=200&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
    ];
    const finalAvatar =
      formData.photo.trim() ||
      defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const isContract = activeTab === 'Labour Contract';
    const areaNum = parseFloat(formData.totalAreaSqft) || 0;
    const ratePerSqftNum = parseFloat(formData.ratePerSqft) || 0;
    const totalContractAmount = Math.round(areaNum * ratePerSqftNum);

    if (isContract && (!formData.contractWorkType || areaNum <= 0 || ratePerSqftNum <= 0)) {
      return;
    }

    const workerPayload = {
      engagementType: isContract ? 'Labour Contract' : 'Daily Wage',
      name: formData.name,
      phone: formData.phone || '+91 98765 43210',
      labourType: isContract ? formData.contractWorkType : formData.labourType,
      workerType: isContract ? formData.contractWorkType : formData.labourType,
      contractWorkType: isContract ? formData.contractWorkType : '',
      currentSite: siteId || null,
      siteId: siteId || null,
      siteName: siteName,
      siteCode: siteCode,
      dailyWage: isContract ? 0 : parseFloat(formData.dailyWage) || 800,
      overtimeRate: isContract ? 0 : parseFloat(formData.otRate) || 100,
      joiningDate: formData.joiningDate || new Date().toISOString(),
      totalAreaSqft: isContract ? areaNum : 0,
      ratePerSqft: isContract ? ratePerSqftNum : 0,
      totalContractAmount: isContract ? totalContractAmount : 0,
      contractStartDate: isContract ? formData.contractStartDate || new Date().toISOString() : null,
      expectedCompletionDate: isContract && formData.expectedCompletionDate ? formData.expectedCompletionDate : null,
      scopeNotes: isContract ? formData.scopeNotes || '' : '',
      status: formData.status || 'Active',
      address: formData.address || '',
      aadhaarNumber: formData.aadhaarNumber || '',
      panNumber: formData.panNumber || '',
      photoUrl: finalAvatar,
      avatar: finalAvatar,
    };

    if (workerToEdit && onUpdateLabour) {
      onUpdateLabour(workerToEdit._id || workerToEdit.id, workerPayload);
    } else {
      onAddLabour({
        ...workerPayload,
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
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
          >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <HardHat size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {workerToEdit
                  ? activeTab === 'Labour Contract'
                    ? 'Edit Labour Contractor'
                    : 'Edit Labour Worker'
                  : 'Add New Labour'}
              </h2>
              <p className="text-xs text-slate-500">
                {workerToEdit
                  ? 'Update details, rates, KYC, and site assignment.'
                  : 'Register a daily wage worker or labour contractor.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Two Registration Tabs: Daily Wage Labour vs Labour Contract */}
        <div className="px-6 pt-4 pb-2 bg-slate-50/70 border-b border-slate-100">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('Daily Wage')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'Daily Wage'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardHat size={14} />
              <span>Daily Wage Labour</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('Labour Contract')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'Labour Contract'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase size={14} />
              <span>Labour Contract</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Row 1: Worker/Contractor Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {activeTab === 'Labour Contract' ? 'Contractor Name' : 'Worker Name'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'Labour Contract' ? 'e.g. Ravi Construction' : 'e.g. Kumar M'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Labour/Contract Work Type & Assigned Site */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTab === 'Labour Contract' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contract Work Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    required
                    value={formData.contractWorkType}
                    onChange={(e) => setFormData({ ...formData, contractWorkType: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select work type</option>
                    {contractWorkTypesList.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Labour Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={formData.labourType}
                    onChange={(e) => setFormData({ ...formData, labourType: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {workerTypesList.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Site <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.assignedSite}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = sitesList.find((s) => s._id === val || `${s.name} (${s.code})` === val);
                    setFormData({
                      ...formData,
                      assignedSite: match ? `${match.name} (${match.code})` : val,
                      siteId: match ? match._id : '',
                    });
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {sitesList.length === 0 ? (
                    <option value="">No sites available</option>
                  ) : (
                    sitesList.map((s) => (
                      <option key={s._id || s.id} value={`${s.name} (${s.code})`}>
                        {s.name} ({s.code})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Address (Requested) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Residential Address
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
              <textarea
                rows={2}
                placeholder="e.g. 14/2, Cross Street, Perumbakkam, Chennai - 600100"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          {/* Row 4: Aadhaar Number & PAN Number (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Aadhaar Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 1234 5678 9012"
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                PAN Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {activeTab === 'Labour Contract' ? 'Contractor Photo URL' : 'Labour Photo URL'}{' '}
              <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="https://... (or leave blank for standard avatar)"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                ) : (
                  <HardHat size={18} className="text-slate-400" />
                )}
              </div>
            </div>
          </div>

          {/* Row 6: Wage Details (Daily Wage) OR Contract Details (Labour Contract) */}
          {activeTab === 'Daily Wage' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Daily Wage (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="1000"
                    value={formData.dailyWage}
                    onChange={(e) => setFormData({ ...formData, dailyWage: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  OT Rate (₹/hr)
                </label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="100"
                    value={formData.otRate}
                    onChange={(e) => setFormData({ ...formData, otRate: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Joining Date
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-blue-200/80 bg-blue-50/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                <Wrench size={14} className="text-blue-600" />
                <span>Contract Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Work Area (Sq.ft) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="e.g. 2000"
                    value={formData.totalAreaSqft}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setFormData({ ...formData, totalAreaSqft: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rate per Sq.ft (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder="e.g. 250"
                      value={formData.ratePerSqft}
                      onWheel={(e) => e.target.blur()}
                      onChange={(e) => setFormData({ ...formData, ratePerSqft: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Total Contract Amount Display */}
              <div className="p-3.5 rounded-xl bg-white border border-blue-200 flex items-center justify-between shadow-2xs">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Total Labour Contract Amount
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {(parseFloat(formData.totalAreaSqft) || 0).toLocaleString('en-IN')} Sq.ft × ₹
                    {(parseFloat(formData.ratePerSqft) || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-lg font-black text-blue-700">
                  ₹
                  {Math.round(
                    (parseFloat(formData.totalAreaSqft) || 0) *
                      (parseFloat(formData.ratePerSqft) || 0)
                  ).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contract Start Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={formData.contractStartDate}
                      onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Expected Completion
                  </label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      min={formData.contractStartDate}
                      value={formData.expectedCompletionDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedCompletionDate: e.target.value })
                      }
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Scope of Work / Contract Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe work scope, milestones, or payment terms..."
                  value={formData.scopeNotes}
                  onChange={(e) => setFormData({ ...formData, scopeNotes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                activeTab === 'Labour Contract'
                  ? 'bg-[#0072ff] hover:bg-blue-700 shadow-blue-700/20'
                  : 'bg-[#008744] hover:bg-[#00743a] shadow-emerald-700/20'
              }`}
            >
              <Plus size={15} />
              <span>
                {workerToEdit
                  ? 'Save Changes'
                  : activeTab === 'Labour Contract'
                  ? 'Add Contractor'
                  : 'Add Worker'}
              </span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}

