import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  User,
  Phone,
  IndianRupee,
  Edit,
  Plus,
  Home,
  Layers,
  Users,
  Wallet,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Receipt,
  Info,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Coins,
  Truck,
  TrendingUp,
  Search,
  Trash2,
  Download,
  CreditCard,
} from 'lucide-react';
import { siteApi, expenseApi, dailyUpdateApi, invoiceApi, paymentApi, getAllPages } from '../services/api';
import { buildDailyUpdatePayload } from '../utils/dailyUpdatePayload';
import { buildExpensePayload } from '../utils/expensePayload';
import AddExpenseModal from '../components/AddExpenseModal';
import AddDailyUpdateModal from '../components/AddDailyUpdateModal';
import AddSiteModal from '../components/AddSiteModal';

export default function SiteDetails({ site = null, onBack = () => { } }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentSite, setCurrentSite] = useState(site || {
    name: 'New Project',
    code: 'CHN-2026-01',
    type: 'New Building',
    status: 'Active',
    client: 'Client',
    contact: '',
    location: '',
    startDate: '',
    expectedDate: '',
    projectBudget: 0,
    clientPaid: 0,
    materialsExpense: 0,
    labourExpense: 0,
    rentalExpense: 0,
    additionalWorkExpense: 0,
  });

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditSiteModalOpen, setIsEditSiteModalOpen] = useState(false);

  // Live collections for this site
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [siteUpdates, setSiteUpdates] = useState([]);
  const [siteInvoices, setSiteInvoices] = useState([]);
  const [payingExpense, setPayingExpense] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', paymentMode: 'Cash', referenceNo: '', notes: '' });
  const [payError, setPayError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real financial figures & related data from backend
  useEffect(() => {
    loadAllSiteData();
  }, [site]);

  const loadAllSiteData = async () => {
    const sId = site?._id || site?.id;
    if (!sId) return;
    const scope = { siteId: sId };
    const results = await Promise.allSettled([
      siteApi.getById(sId),
      getAllPages(expenseApi.getAll, scope),
      getAllPages(dailyUpdateApi.getAll, scope),
      getAllPages(invoiceApi.getAll, scope),
    ]);
    const [details, expenses, updates, invoices] = results;
    if (details.status === 'fulfilled') setCurrentSite(details.value.data);
    if (expenses.status === 'fulfilled') setSiteExpenses(expenses.value);
    if (updates.status === 'fulfilled') setSiteUpdates(updates.value);
    if (invoices.status === 'fulfilled') setSiteInvoices(invoices.value);
    setLoadError(results.some((result) => result.status === 'rejected')
      ? 'Some site data could not be refreshed. Try again.' : '');
  };

  const isAddlWork = (expense) =>
    expense.isAdditionalWork || expense.expenseType === 'ADDITIONAL_WORK' || expense.category === 'Additional Work';
  const {
    materialsExpense = 0,
    labourExpense = 0,
    rentalExpense = 0,
    additionalWorkExpense = 0,
    additionalMaterialsExpense: apiAddlMat,
    additionalLabourExpense: apiAddlLab,
    additionalRentalExpense: apiAddlRent,
    normalContractExpenses = 0,
    totalExpenses = 0,
    clientPaid = 0,
    excessAmount = 0,
    clientPending = 0,
  } = currentSite.financials || {};
  const projectBudget = currentSite.projectBudget ?? currentSite.financials?.projectBudget ?? 0;

  // Compute Additional Work breakdown (Materials, Labour, Rental, Total)
  const addlExpensesList = siteExpenses.filter(isAddlWork);
  const addlMaterialsTotal =
    apiAddlMat !== undefined
      ? apiAddlMat
      : addlExpensesList
          .filter((e) => e.subCategory === 'Materials')
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const addlLabourTotal =
    apiAddlLab !== undefined
      ? apiAddlLab
      : addlExpensesList
          .filter((e) => e.subCategory === 'Labour')
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const addlRentalTotal =
    apiAddlRent !== undefined
      ? apiAddlRent
      : addlExpensesList
          .filter((e) => ['Rental', 'Vehicle Rent', 'Rent'].includes(e.subCategory))
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const addlGrandTotal =
    additionalWorkExpense ||
    addlExpensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handlePrintAdditionalWorkPdf = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    const rowsHtml =
      addlExpensesList.length === 0
        ? '<tr><td colspan="5" style="padding:16px;text-align:center;color:#64748b;">No additional work expenses recorded.</td></tr>'
        : addlExpensesList
            .map(
              (exp, idx) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${idx + 1}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : '-'}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${exp.subCategory || 'General'}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${exp.description || '-'}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">₹${Number(exp.amount || 0).toLocaleString('en-IN')}</td>
          </tr>`
            )
            .join('');

    win.document.write(`
      <html>
        <head>
          <title>Additional Work Report - ${currentSite.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #0f172a; }
            h1 { margin: 0 0 4px; font-size: 20px; }
            p { margin: 0 0 18px; color: #475569; font-size: 13px; }
            .cards { display: flex; gap: 12px; margin-bottom: 20px; }
            .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #f8fafc; }
            .card .lbl { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; }
            .card .val { font-size: 16px; font-weight: 800; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 9px 8px; border-bottom: 2px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <h1>Additional Work & Expenses Report</h1>
          <p>${currentSite.name} (${currentSite.code || ''}) &bull; Client: ${currentSite.client || '-'}</p>
          <div class="cards">
            <div class="card"><div class="lbl">Addl. Material</div><div class="val">₹${addlMaterialsTotal.toLocaleString('en-IN')}</div></div>
            <div class="card"><div class="lbl">Addl. Labour</div><div class="val">₹${addlLabourTotal.toLocaleString('en-IN')}</div></div>
            <div class="card"><div class="lbl">Addl. Rental</div><div class="val">₹${addlRentalTotal.toLocaleString('en-IN')}</div></div>
            <div class="card" style="background:#faf5ff;border-color:#d8b4fe;"><div class="lbl" style="color:#6b21a8;">Total Additional Work</div><div class="val" style="color:#581c87;">₹${addlGrandTotal.toLocaleString('en-IN')}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const formatCurrency = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');
  const formatDate = (val) => {
    if (!val) return 'Not set';
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const spentPercent = clientPaid > 0 ? Math.min(100, Math.round((totalExpenses / clientPaid) * 100)) : 0;
  const excessPercent = clientPaid > 0 ? Math.max(0, 100 - spentPercent) : 0;

  // Dynamic Client Payment Progress: (Amount Received ÷ Total Contract Budget) × 100
  const paymentProgressPercent =
    clientPaid > 0 && projectBudget > 0
      ? Math.min(100, Math.round((clientPaid / projectBudget) * 100))
      : 0;
  const paymentProgressRingColor =
    paymentProgressPercent > 90
      ? { stroke: '#ef4444', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' }
      : paymentProgressPercent >= 50
        ? { stroke: '#f59e0b', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-800 border-amber-200' }
        : { stroke: '#10b981', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

  const tabs = [
    { id: 'Overview', label: 'Overview', icon: Home },
    { id: 'Materials', label: 'Materials', icon: Layers, count: siteExpenses.filter(e => e.category === 'Materials' && !isAddlWork(e)).length },
    { id: 'Labour', label: 'Labour', icon: Users, count: siteExpenses.filter(e => e.category === 'Labour' && !isAddlWork(e)).length },
    { id: 'Additional Work', label: 'Additional Work', icon: Zap, count: siteExpenses.filter(isAddlWork).length },
    { id: 'Expenses', label: 'All Expenses', icon: Wallet, count: siteExpenses.length },
    { id: 'Daily Updates', label: 'Daily Updates', icon: CalendarDays, count: siteUpdates.length },
    { id: 'Billing', label: 'Billing', icon: FileSpreadsheet, count: siteInvoices.length },
  ];

  // Activities list (from backend or live updates)
  const recentActivities = siteUpdates.length > 0
    ? siteUpdates.slice(0, 5).map((u) => ({
      id: u._id || u.id,
      title: `${u.workPhase || 'Update'}: ${u.title || u.description}`,
      time: u.date ? new Date(u.date).toLocaleDateString('en-IN') : 'Recent',
      color: 'bg-emerald-500',
    }))
    : currentSite.recentActivities || [];

  // Expenses list (from backend or live expenses)
  const recentExpenses = siteExpenses.length > 0
    ? siteExpenses.slice(0, 5)
    : currentSite.recentExpenses || [];

  // Handlers for Add modals
  const handleAddExpense = async (newExp) => {
    const payload = buildExpensePayload({ ...newExp, siteId: currentSite._id || currentSite.id }, currentSite);
    await expenseApi.create(payload);
    await loadAllSiteData();
  };

  const handleAddUpdate = async (updateData) => {
    await dailyUpdateApi.create(buildDailyUpdatePayload(updateData, currentSite._id || currentSite.id));
    await loadAllSiteData();
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await expenseApi.delete(id);
      await loadAllSiteData();
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const handleClearExpensePayment = (exp) => {
    const outstanding =
      exp.pendingAmount !== undefined && exp.pendingAmount > 0
        ? exp.pendingAmount
        : Math.max(0, (Number(exp.amount) || 0) - (Number(exp.paidAmount) || 0));
    setPayingExpense({ ...exp, outstanding });
    setPayForm({ amount: String(outstanding), paymentMode: 'Cash', referenceNo: '', notes: '' });
    setPayError('');
  };

  const handleConfirmRecordPayment = async (e) => {
    e.preventDefault();
    if (!payingExpense) return;
    const payAmt = parseFloat(payForm.amount);
    const maxAllowed = payingExpense.outstanding || 0;
    if (isNaN(payAmt) || payAmt <= 0) {
      setPayError('Payment amount must be greater than ₹0.');
      return;
    }
    if (payAmt > maxAllowed) {
      setPayError(`Payment amount cannot exceed remaining outstanding amount (₹${maxAllowed.toLocaleString('en-IN')}).`);
      return;
    }
    try {
      await paymentApi.create({
        flowType: 'OUTGOING',
        siteId: currentSite._id || currentSite.id,
        siteName: currentSite.name,
        siteCode: currentSite.code,
        expenseId: payingExpense._id || payingExpense.id,
        partyName: payingExpense.supplierName && payingExpense.supplierName !== '-' ? payingExpense.supplierName : payingExpense.description,
        category:
          payingExpense.category === 'Materials'
            ? 'Materials'
            : payingExpense.category === 'Labour'
              ? 'Labour Wages'
              : payingExpense.category === 'Rental'
                ? 'Machinery Rental'
                : 'Other',
        amount: payAmt,
        paymentMode: payForm.paymentMode || 'Cash',
        referenceNo: payForm.referenceNo || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceRef: `Settlement for ${payingExpense.description}`,
        notes: payForm.notes || '',
      });
      setPayingExpense(null);
      await loadAllSiteData();
    } catch (err) {
      setPayError(err?.message || 'Could not record payment.');
    }
  };

  const handleUpdateSite = async (id, updatedSiteData) => {
    try {
      const res = await siteApi.update(id, updatedSiteData);
      if (res?.data) {
        setCurrentSite(res.data);
      } else {
        setCurrentSite((prev) => ({ ...prev, ...updatedSiteData }));
      }
      setIsEditSiteModalOpen(false);
      await loadAllSiteData();
    } catch (err) {
      console.warn('Could not update site:', err.message);
      setCurrentSite((prev) => ({ ...prev, ...updatedSiteData }));
      setIsEditSiteModalOpen(false);
    }
  };

  return (
    <div className="p-5 md:p-7 space-y-5 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {loadError && <p role="alert" className="text-sm text-rose-700">{loadError}</p>}
      {/* 1. Top Bar with Backward Button & Breadcrumbs */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 text-xs font-bold shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Sites</span>
        </button>

        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <button
            onClick={onBack}
            className="hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Home size={14} className="text-slate-400" />
            <span>Sites</span>
          </button>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-emerald-700 font-bold">{currentSite.name}</span>
        </nav>
      </div>

      {/* 2. Top Banner Card with Additional Work & Expenses Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col xl:flex-row items-stretch justify-between gap-5 p-5 md:p-6">
        {/* Left Information */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  {currentSite.name}
                </h1>
                {currentSite.status === 'Active' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active</span>
                  </span>
                )}
                {currentSite.status === 'Completed' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-300">
                    <CheckCircle2 size={12} className="text-blue-600" />
                    <span>Completed</span>
                  </span>
                )}
                {currentSite.status === 'On Hold' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300">
                    <Clock size={12} className="text-amber-600" />
                    <span>On Hold</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-2">
                <span className="font-mono font-bold text-slate-700">{currentSite.code}</span>
                <span className="text-slate-300">•</span>
                <span>{currentSite.type}</span>
              </div>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 font-medium pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              <span>Client: <strong className="text-slate-800">{currentSite.client}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" />
              <span>{currentSite.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Start: <strong className="text-slate-800">{formatDate(currentSite.startDate)}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Expected: <strong className="text-slate-800">{formatDate(currentSite.expectedDate)}</strong></span>
            </div>
          </div>

          {/* Additional Work & Expenses Breakdown Banner Box (Additional Work Only + PDF Report) */}
          <div className="p-4 bg-gradient-to-r from-purple-50/40 via-slate-50 to-white border border-purple-200/70 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-xs">Additional Work & Expenses Breakdown</div>
                <div className="text-[11px] text-slate-500">Additional work expenditure (Material, Labour, Rental)</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Additional Material */}
              <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs min-w-[76px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Material</div>
                <div className="text-xs font-black text-slate-900">{formatCurrency(addlMaterialsTotal)}</div>
              </div>

              {/* Additional Labour */}
              <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs min-w-[76px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Labour</div>
                <div className="text-xs font-black text-blue-700">{formatCurrency(addlLabourTotal)}</div>
              </div>

              {/* Additional Rental */}
              <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-center shadow-2xs min-w-[76px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rental</div>
                <div className="text-xs font-black text-amber-700">{formatCurrency(addlRentalTotal)}</div>
              </div>

              {/* Total Additional Work */}
              <div className="px-3.5 py-1.5 bg-purple-700 text-white rounded-xl text-center shadow-xs min-w-[100px]">
                <div className="text-[10px] font-bold text-purple-100 uppercase tracking-wider">Total Addl.</div>
                <div className="text-xs font-black">{formatCurrency(addlGrandTotal)}</div>
              </div>

              {/* Export PDF Report Button */}
              <button
                type="button"
                onClick={handlePrintAdditionalWorkPdf}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                title="Download / Print Additional Work PDF Report"
              >
                <FileSpreadsheet size={13} />
                <span>PDF Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions & Site Photo */}
        <div className="flex flex-col justify-between items-end gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsEditSiteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Edit Site Details"
            >
              <Edit size={14} className="text-amber-600" />
              <span>Edit Site</span>
            </button>
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Plus size={14} className="text-emerald-600" />
              <span>+ Add Update</span>
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Add Expense</span>
            </button>
          </div>

          <div className="w-full sm:w-72 h-32 rounded-2xl overflow-hidden shadow-xs border border-slate-200 relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Site Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
              <span className="text-white text-[11px] font-bold tracking-tight">
                {currentSite.name} ({currentSite.code})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${isActive
                  ? 'bg-[#008744] text-white shadow-sm shadow-emerald-800/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
            >
              <TabIcon size={14} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          VIEW CONTENT BY ACTIVE TAB
          ========================================================================= */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          {/* Left / Center Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Row 1: 5 Stat Cards - Materials, Labour, Rental, Additional Work, Total Expenses */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Materials */}
              <div className="bg-[#edf9f3] rounded-2xl p-3.5 border border-emerald-100/80 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Materials</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{formatCurrency(materialsExpense)}</div>
                </div>
              </div>

              {/* Labour */}
              <div className="bg-[#edf5ff] rounded-2xl p-3.5 border border-blue-100/80 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Labour</div>
                  <div className="text-base sm:text-lg font-black text-blue-800 tracking-tight">{formatCurrency(labourExpense)}</div>
                </div>
              </div>

              {/* Rental */}
              <div className="bg-[#fff7ee] rounded-2xl p-3.5 border border-amber-100/80 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Rental</div>
                  <div className="text-base sm:text-lg font-black text-amber-800 tracking-tight">{formatCurrency(rentalExpense)}</div>
                </div>
              </div>

              {/* Additional Work */}
              <div className="bg-[#f5f2ff] rounded-2xl p-3.5 border border-purple-100/80 shadow-xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-purple-700 uppercase">Addl. Work</div>
                  <div className="text-base sm:text-lg font-black text-purple-900 tracking-tight">{formatCurrency(additionalWorkExpense)}</div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Wallet size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Total Spent</div>
                  <div className="text-base sm:text-lg font-black text-emerald-950 tracking-tight">{formatCurrency(totalExpenses)}</div>
                </div>
              </div>
            </div>

            {/* Row 2: Client Payments & Cash Flow (Excess in Hand) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                    <Coins size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Client Payments & Excess Balance</h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Tracking advance received from client vs actual site expenditure
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${excessAmount >= 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${excessAmount >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>Cash in Hand: {formatCurrency(excessAmount)}</span>
                </span>
              </div>

              {/* 3 Clean Stat Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Client Paid Amount */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/80 transition-all hover:bg-blue-50/70">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700">Client Paid Amount</span>
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                      <CheckCircle2 size={13} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    {formatCurrency(clientPaid)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Advance received from client
                  </div>
                </div>

                {/* 2. Total Site Expenses */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Total Expenses Spent</span>
                    <div className="w-6 h-6 rounded-md bg-slate-200/60 text-slate-700 flex items-center justify-center">
                      <Wallet size={13} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    {formatCurrency(totalExpenses)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Materials + Labour + Rental + Addl. Work
                  </div>
                </div>

                {/* 3. Cash in Hand */}
                <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 transition-all hover:bg-emerald-50 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">Cash in Hand</span>
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <TrendingUp size={13} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-2 tracking-tight">
                    {formatCurrency(excessAmount)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Surplus cash available in hand
                  </div>
                </div>
              </div>

              {/* Progress Meter */}
              <div className="pt-1 space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div
                    className="bg-purple-600 h-full rounded-l-full transition-all duration-500"
                    style={{ width: `${spentPercent}%` }}
                  />
                  <div
                    className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
                    style={{ width: `${excessPercent}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium px-0.5 gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                    <span>Spent: <strong className="text-slate-800">{formatCurrency(totalExpenses)}</strong> ({spentPercent}%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Cash in Hand: <strong className="text-emerald-700">{formatCurrency(excessAmount)}</strong> ({excessPercent}%)</span>
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 font-mono">
                    Excess = Client Paid ({formatCurrency(clientPaid)}) − Spent ({formatCurrency(totalExpenses)})
                  </span>
                </div>
              </div>
            </div>

            {/* Row 3: Recent Activities & Recent Expenses (User Request 2: Working View All buttons) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Recent Activities */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Zap size={16} className="text-emerald-600" />
                    <span>Recent Activities</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('Daily Updates')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="py-3 space-y-3.5 relative min-h-[140px] flex flex-col justify-center">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                      <Zap size={20} className="mx-auto mb-1.5 text-slate-300 opacity-60" />
                      <p className="text-xs font-semibold text-slate-600">No activities recorded yet</p>
                      <p className="text-[11px] text-slate-400">Updates, material dispatches and labour logs will show here.</p>
                      <button
                        onClick={() => setIsUpdateModalOpen(true)}
                        className="mt-3 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        + Log First Daily Update
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute left-2.5 top-5 bottom-5 w-0.5 bg-slate-100 pointer-events-none" />
                      {recentActivities.map((act) => (
                        <div key={act.id} className="flex items-start gap-3 relative z-10 text-xs">
                          <span className={`w-2.5 h-2.5 rounded-full ${act.color} mt-1 shrink-0 ring-4 ring-white`} />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 leading-snug">{act.title}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">{act.time}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Recent Expenses Table */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                    <span>Recent Expenses</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('Expenses')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="overflow-x-auto py-2 min-h-[140px] flex flex-col justify-center">
                  {recentExpenses.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                      <Wallet size={20} className="mx-auto mb-1.5 text-slate-300 opacity-60" />
                      <p className="text-xs font-semibold text-slate-600">No expenses recorded yet</p>
                      <p className="text-[11px] text-slate-400">Add materials, labour wages or rental payments to track costs.</p>
                      <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="mt-3 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        + Add First Expense
                      </button>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                          <th className="py-2 px-1">#</th>
                          <th className="py-2 px-2">Date</th>
                          <th className="py-2 px-2">Category</th>
                          <th className="py-2 px-2">Description</th>
                          <th className="py-2 px-1 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {recentExpenses.map((exp, idx) => (
                          <tr key={exp.id || exp._id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-1 font-medium text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-2 font-medium text-slate-600 whitespace-nowrap">{exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : 'Today'}</td>
                            <td className="py-2.5 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${exp.category === 'Materials'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : exp.category === 'Labour'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : exp.category === 'Rental'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-purple-50 text-purple-800 border-purple-200'
                                }`}>
                                {exp.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 font-medium text-slate-800 max-w-[120px] truncate">{exp.description}</td>
                            <td className="py-2.5 px-1 text-right font-bold text-slate-900 whitespace-nowrap">
                              {formatCurrency(exp.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Site Information Card + Compact Payment Progress Card (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Info size={16} className="text-emerald-600" />
                  <span>Site Information</span>
                </div>
                <button
                  onClick={() => setIsEditSiteModalOpen(true)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Edit Site Details"
                >
                  <Edit size={13} />
                  <span>Edit</span>
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Site Type</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                    {currentSite.type}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Site Code</span>
                  <span className="font-mono font-bold text-slate-900">{currentSite.code}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Client Name</span>
                  <span className="font-bold text-slate-900">{currentSite.client}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Contact Phone</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Phone size={13} className="text-slate-400" />
                    <span>{currentSite.contact || 'Not set'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Site Location</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{currentSite.location || 'Chennai, TN'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Contract Budget</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatCurrency(projectBudget)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Client Paid</span>
                  <span className="font-extrabold text-blue-700 text-sm">
                    {formatCurrency(clientPaid)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Pending to Receive</span>
                  <span className="font-extrabold text-rose-600 text-sm">
                    {formatCurrency(clientPending)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Start Date</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{formatDate(currentSite.startDate)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Expected Completion</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar size={13} className="text-slate-400" />
                    <span>{formatDate(currentSite.expectedDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Payment Progress Card directly below Site Information */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <CreditCard size={16} className="text-emerald-600" />
                  <span>Payment Progress</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${paymentProgressRingColor.badge}`}>
                  {paymentProgressPercent}%
                </span>
              </div>

              <div className="flex items-center gap-5">
                {/* Circular Progress Indicator */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={paymentProgressRingColor.stroke}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={
                        2 * Math.PI * 40 * (1 - paymentProgressPercent / 100)
                      }
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-lg font-black leading-none ${paymentProgressRingColor.text}`}>
                      {paymentProgressPercent}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                      Received
                    </span>
                  </div>
                </div>

                {/* Amount Received & Yet to Receive ONLY */}
                <div className="flex-1 space-y-3 text-xs min-w-0">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Amount Received
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
                      {formatCurrency(clientPaid)}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                      Yet to Receive
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-0.5 truncate">
                      {formatCurrency(clientPending)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2, 3, 4: EXPENSES (ALL OR BY CATEGORY INCLUDING ADDITIONAL WORK) */}
      {(activeTab === 'Expenses' || activeTab === 'All Expenses' || activeTab === 'Materials' || activeTab === 'Labour' || activeTab === 'Additional Work') && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                {activeTab === 'Additional Work' ? <Zap size={18} className="text-purple-600" /> : activeTab === 'Materials' ? <Layers size={18} /> : activeTab === 'Labour' ? <Users size={18} /> : <Wallet size={18} />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {activeTab === 'Additional Work' ? 'Additional Site Work & Metering' : activeTab === 'Materials' ? 'Material Purchases' : activeTab === 'Labour' ? 'Labour & Wage Expenses' : 'All Recorded Site Expenses'}
                </h3>
                <p className="text-xs text-slate-500">Live ledger entries for {currentSite.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search description or supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                <span>+ Add Expense</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description / Details</th>
                  <th className="py-3.5 px-4">Supplier / Contractor</th>
                  <th className="py-3.5 px-4 text-center">Qty / Unit</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const filteredExp = siteExpenses
                    .filter((e) => {
                      if (activeTab === 'Materials') return e.category === 'Materials' && !isAddlWork(e);
                      if (activeTab === 'Labour') return e.category === 'Labour' && !isAddlWork(e);
                      if (activeTab === 'Additional Work') return isAddlWork(e);
                      return true;
                    })
                    .filter((e) =>
                      String(e.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      String(e.supplierName || e.supplier || '').toLowerCase().includes(searchQuery.toLowerCase())
                    );

                  if (filteredExp.length === 0) {
                    return (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-slate-400">
                          <Wallet size={28} className="mx-auto mb-2 text-slate-300 opacity-60" />
                          <div className="font-bold text-slate-700">No {activeTab.toLowerCase()} expenses found.</div>
                          <div className="text-xs text-slate-400 mt-1">Click "+ Add Expense" above to add your first record.</div>
                        </td>
                      </tr>
                    );
                  }

                  return filteredExp.map((e, idx) => (
                    <tr key={e._id || e.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">{formatDate(e.date)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${e.category === 'Materials'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : e.category === 'Labour'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : e.category === 'Rental'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{e.description}</div>
                        {e.items && e.items.length > 0 && (
                          <div className="text-[11px] text-emerald-700 font-medium mt-1 flex flex-wrap gap-1">
                            <span className="font-semibold text-slate-500">Materials:</span>
                            {e.items.map((it, i) => (
                              <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded text-[10px]">
                                {it.materialName} ({it.quantity} {it.unit})
                              </span>
                            ))}
                          </div>
                        )}
                        {e.notes && (
                          <div className="text-[10px] text-purple-700 bg-purple-50/70 border border-purple-100 rounded px-1.5 py-0.5 mt-1 line-clamp-1">
                            {e.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{e.supplierName || e.supplier || '-'}</td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                        {e.quantity ? `${e.quantity} ${e.unit || ''}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-black text-slate-900">{formatCurrency(e.amount)}</div>
                        {e.paymentStatus === 'Partial' && (
                          <div className="text-[10px] font-semibold mt-0.5 space-x-1.5">
                            <span className="text-emerald-700">Paid: {formatCurrency(e.paidAmount || 0)}</span>
                            <span className="text-amber-700">Due: {formatCurrency(e.pendingAmount || 0)}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${e.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : e.paymentStatus === 'Partial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                          {e.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {e.paymentStatus !== 'Paid' && (
                            <button
                              title="Clear / Pay this bill"
                              onClick={() => handleClearExpensePayment(e)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <CreditCard size={11} />
                              <span>Pay</span>
                            </button>
                          )}
                          <button
                            title="Delete expense"
                            onClick={() => handleDeleteExpense(e._id || e.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DAILY UPDATES */}
      {activeTab === 'Daily Updates' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <CalendarDays size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Site Daily Progress Updates</h3>
                <p className="text-xs text-slate-500">Day-to-day activity logs and labour deployment for {currentSite.name}</p>
              </div>
            </div>

            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              <span>+ Log Update</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {siteUpdates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarDays size={30} className="mx-auto mb-2 text-slate-300" />
                <div className="font-bold text-slate-700">No daily updates recorded for this site yet.</div>
                <div className="text-xs text-slate-400 mt-1">Click "+ Log Update" above to record construction progress.</div>
              </div>
            ) : (
              siteUpdates.map((u, idx) => (
                <div key={u._id || u.id || idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{u.title || u.workPhase || 'Site Work'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        {u.workPhase || 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{u.description || u.notes || '-'}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium mt-1.5">
                      {u.progress != null && <span>Progress {u.progress}% · {u.status}</span>}
                      {u.materialsUsed && <span>Materials {u.materialsUsed}</span>}
                      <span>Date: <strong className="text-slate-700">{formatDate(u.date)}</strong></span>
                      <span>•</span>
                      <span>Workers Present: <strong className="text-blue-700">{u.workersCount ?? u.labourCount ?? 0}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: BILLING & INVOICES */}
      {activeTab === 'Billing' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Invoices & Client Billing</h3>
                <p className="text-xs text-slate-500">Contract progress billing and tax invoices for {currentSite.name}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase bg-slate-50/70">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siteInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      <FileSpreadsheet size={28} className="mx-auto mb-2 text-slate-300" />
                      <div className="font-bold text-slate-700">No invoices generated for this site yet.</div>
                      <div className="text-xs text-slate-400 mt-1">Create an invoice from the Billing & Invoices section.</div>
                    </td>
                  </tr>
                ) : (
                  siteInvoices.map((inv) => (
                    <tr key={inv._id || inv.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(inv.issueDate || inv.date)}</td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{inv.clientName || currentSite.client}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatCurrency(inv.paidAmount)}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600">{formatCurrency(inv.balanceDue)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                          {inv.paymentStatus || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Partial / Remaining Payment Modal */}
      {payingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Record Expense Payment</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">{payingExpense.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayingExpense(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <span className="text-xs font-black">✕</span>
              </button>
            </div>

            <form onSubmit={handleConfirmRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Total Bill</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">{formatCurrency(payingExpense.amount)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Paid</div>
                  <div className="text-xs font-black text-emerald-800 mt-0.5">
                    {formatCurrency(payingExpense.paidAmount || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-700 uppercase">Outstanding</div>
                  <div className="text-xs font-black text-amber-800 mt-0.5">
                    {formatCurrency(payingExpense.outstanding || 0)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Payment Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max={payingExpense.outstanding}
                  required
                  value={payForm.amount}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => {
                    setPayError('');
                    setPayForm({ ...payForm, amount: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter partial or full amount up to {formatCurrency(payingExpense.outstanding || 0)}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Payment Method *</label>
                  <select
                    value={payForm.paymentMode}
                    onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI (GPay)">UPI</option>
                    <option value="Bank Transfer (NEFT)">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">Reference No.</label>
                  <input
                    type="text"
                    placeholder="Optional UTR / Ref"
                    value={payForm.referenceNo}
                    onChange={(e) => setPayForm({ ...payForm, referenceNo: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {payError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
                  {payError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingExpense(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal with Locked Site */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
        lockedSite={`${currentSite.name} (${currentSite.code})`}
      />

      {/* Add Daily Update Modal with Locked Site */}
      <AddDailyUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onAddUpdate={handleAddUpdate}
        lockedSite={`${currentSite.name} (${currentSite.code})`}
        sites={[currentSite]}
      />

      {/* Edit Site Modal */}
      <AddSiteModal
        isOpen={isEditSiteModalOpen}
        siteToEdit={currentSite}
        onClose={() => setIsEditSiteModalOpen(false)}
        onUpdateSite={handleUpdateSite}
      />
    </div>
  );
}
