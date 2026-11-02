import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  IndianRupee,
  Building2,
  Upload,
  CheckCircle2,
  Circle,
  RotateCw,
  Save,
} from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onSaveEmployee }) {
  const [formData, setFormData] = useState({
    empId: 'EMP-001',
    name: '',
    phone: '',
    email: '',
    designation: 'Site Engineer',
    department: 'Civil',
    joiningDate: '2026-11-01',
    salary: '45000',
    assignedSite: 'Green Villa (KS-001)',
    employmentType: 'Permanent', // 'Permanent' | 'Contract'
    status: 'Active',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    onSaveEmployee(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Header with Engineers Banner */}
        <div className="relative flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-white overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Add Employee</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add a new company employee.
              </p>
            </div>
          </div>

          <div className="w-28 h-16 rounded-xl overflow-hidden shadow-xs shrink-0 hidden sm:block">
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80"
              alt="Construction Engineers"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section 1: Employee Information */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold">
              <User size={13} />
              <span>Employee Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.empId}
                    onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, empId: `EMP-${Math.floor(Math.random() * 899 + 100)}` })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                  >
                    <RotateCw size={13} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <span className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold">
                    +91
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Designation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Site Engineer">Site Engineer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Site Supervisor">Site Supervisor</option>
                  <option value="Quantity Surveyor">Quantity Surveyor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Civil">Civil</option>
                  <option value="Operations">Operations</option>
                  <option value="Quality & Safety">Quality & Safety</option>
                  <option value="Accounts">Accounts</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Joining Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Monthly Salary (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Assignment & Status */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 font-bold">
              <Briefcase size={13} />
              <span>Assignment & Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Assigned Site
                </label>
                <select
                  value={formData.assignedSite}
                  onChange={(e) => setFormData({ ...formData, assignedSite: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Green Villa (KS-001)">Green Villa (KS-001)</option>
                  <option value="RK Residence (KS-004)">RK Residence (KS-004)</option>
                  <option value="Metro Apartment (KS-005)">Metro Apartment (KS-005)</option>
                  <option value="Office Renovation (KS-002)">Office Renovation (KS-002)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Employment Type <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, employmentType: 'Permanent' })}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer ${
                      formData.employmentType === 'Permanent'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {formData.employmentType === 'Permanent' ? (
                      <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-600 text-white" />
                    ) : (
                      <Circle size={15} className="text-slate-300" />
                    )}
                    <span>Permanent</span>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, employmentType: 'Contract' })}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer ${
                      formData.employmentType === 'Contract'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {formData.employmentType === 'Contract' ? (
                      <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-600 text-white" />
                    ) : (
                      <Circle size={15} className="text-slate-300" />
                    )}
                    <span>Contract</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Status <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, status: 'Active' })}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer ${
                      formData.status === 'Active'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {formData.status === 'Active' ? (
                      <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-600 text-white" />
                    ) : (
                      <Circle size={15} className="text-slate-300" />
                    )}
                    <span>Active</span>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer ${
                      formData.status === 'Inactive'
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {formData.status === 'Inactive' ? (
                      <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-600 text-white" />
                    ) : (
                      <Circle size={15} className="text-slate-300" />
                    )}
                    <span>Inactive</span>
                  </div>
                </div>
              </div>

              {/* Upload Photo */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Upload Photo
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:border-emerald-400 cursor-pointer transition-colors bg-slate-50/50">
                  <User size={18} className="text-slate-400 mb-1" />
                  <span className="font-bold text-slate-700">Choose Photo</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG (Max 2 MB)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20"
            >
              <Save size={15} />
              <span>Save Employee</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

