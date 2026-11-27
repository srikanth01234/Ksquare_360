import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalBackdropVariants, modalContentVariants } from '../utils/animations';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Plus,
  Building2,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Banknote,
  Send,
  X,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  AlertCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { paymentApi, siteApi } from '../services/api';

export default function Payments() {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'outgoing'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All Sites');
  const [selectedModeFilter, setSelectedModeFilter] = useState('All Modes');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'THIS_MONTH' | 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [isReceivedModalOpen, setIsReceivedModalOpen] = useState(false);
  const [isOutgoingModalOpen, setIsOutgoingModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({
    partyName: '',
    category: '',
    amount: '',
    paymentMode: 'Bank Transfer (NEFT)',
    referenceNo: '',
    invoiceRef: '',
    status: 'Cleared',
    date: '',
    notes: '',
  });

  // Live Payments State from MongoDB Atlas
  const [receivedPayments, setReceivedPayments] = useState([]);
  const [outgoingPayments, setOutgoingPayments] = useState([]);
  const [sitesList, setSitesList] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [selectedPendingExpenseId, setSelectedPendingExpenseId] = useState('');
  const [loading, setLoading] = useState(true);

  // File upload refs & preview states
  const receivedFileRef = useRef(null);
  const outgoingFileRef = useRef(null);
  const [receivedReceiptPreview, setReceivedReceiptPreview] = useState(null);
  const [outgoingReceiptPreview, setOutgoingReceiptPreview] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadPayments(), loadSites(), loadPendingExpenses()]);
    setLoading(false);
  };

  const loadPendingExpenses = async () => {
    try {
      const res = await paymentApi.getPendingExpenses();
      const list = res.data || res || [];
      setPendingExpenses(list);
    } catch (err) {
      console.warn('Could not load pending expenses in Payments:', err.message);
    }
  };

  const loadSites = async () => {
    try {
      const res = await siteApi.getAll();
      const list = res.data || res || [];
      setSitesList(list);
    } catch (err) {
      console.warn('Could not fetch sites in Payments:', err.message);
    }
  };

  const loadPayments = async () => {
    try {
      const res = await paymentApi.getAll();
      const list = res.data || res || [];
      const rec = [];
      const out = [];

      list.forEach((p, idx) => {
        const item = {
          ...p,
          _id: p._id || p.id,
          id: p.referenceNo || p.paymentNumber || p._id || `PAY-${idx + 1}`,
          displayId: p.paymentNumber || p.referenceNo || `PAY-${String(idx + 1).padStart(3, '0')}`,
          rawDate: p.date,
          date: p.date ? new Date(p.date).toLocaleDateString('en-IN') : 'Today',
          siteId: p.site?._id || p.siteId || (typeof p.site === 'string' ? p.site : null),
          siteName: p.siteName || (p.site?.name) || 'Site',
          siteCode: p.siteCode || (p.site?.code) || '',
          amount: typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0,
          paymentMode: p.paymentMode || 'Bank Transfer (NEFT)',
          referenceNo: p.referenceNo || p.referenceNumber || '-',
          status: p.status || 'Cleared',
          notes: p.notes || '',
          receiptUrl: p.receiptUrl || '',
          flowType: p.flowType || (p.category === 'Client Payment' ? 'RECEIVED' : 'OUTGOING'),
        };

        if (item.flowType === 'RECEIVED' || p.category === 'CLIENT_PAYMENT' || p.category === 'Client Payment') {
          rec.push({
            ...item,
            clientName: p.partyName || p.clientName || 'Client',
            invoiceRef: p.invoiceRef || p.referenceNo || p.referenceNumber || '-',
          });
        } else {
          out.push({
            ...item,
            beneficiary: p.partyName || p.beneficiary || 'Vendor / Worker',
            category: p.category || 'Materials',
            billRef: p.invoiceRef || p.referenceNo || p.referenceNumber || '-',
          });
        }
      });

      setReceivedPayments(rec);
      setOutgoingPayments(out);
    } catch (err) {
      console.warn('Could not fetch payments from backend:', err.message);
      setReceivedPayments([]);
      setOutgoingPayments([]);
    }
  };

  // Form state for Record Received Payment Modal
  const [receivedForm, setReceivedForm] = useState({
    clientName: '',
    siteName: '',
    invoiceRef: '',
    amount: '',
    paymentMode: 'Bank Transfer (NEFT)',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Form state for Record Outgoing Payment Modal
  const [outgoingForm, setOutgoingForm] = useState({
    beneficiary: '',
    category: 'Materials',
    siteName: '',
    billRef: '',
    amount: '',
    paymentMode: 'Bank Transfer (NEFT)',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Reset pagination on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedSiteFilter, selectedModeFilter, selectedStatusFilter, selectedDateFilter, customStartDate, customEndDate]);

  // KPI Calculations
  const totalReceived = useMemo(() => {
    return receivedPayments.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [receivedPayments]);

  const totalOutgoing = useMemo(() => {
    return outgoingPayments.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [outgoingPayments]);

  const netBalance = totalReceived - totalOutgoing;

  // Dynamic Payment Progress: (Total Received Amount ÷ Total Contract Budget) × 100
  // Excludes outgoing payments completely; starts at 0% when no payment is received
  const totalContractBudget = useMemo(() => {
    return sitesList.reduce((sum, s) => sum + (Number(s.projectBudget) || 0), 0);
  }, [sitesList]);

  const paymentProgressPercent = useMemo(() => {
    if (totalReceived <= 0 || totalContractBudget <= 0) return 0;
    const rawPct = (totalReceived / totalContractBudget) * 100;
    return Math.min(100, Math.round(rawPct));
  }, [totalReceived, totalContractBudget]);

  const paymentProgressColor = useMemo(() => {
    if (paymentProgressPercent > 90) {
      return {
        bar: 'bg-rose-500',
        text: 'text-rose-700',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (paymentProgressPercent >= 50) {
      return {
        bar: 'bg-amber-400',
        text: 'text-amber-700',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    }
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }, [paymentProgressPercent]);

  // Date Filter Predicate
  const matchesDateFilter = (item) => {
    if (selectedDateFilter === 'ALL') return true;
    if (!item.rawDate) return true;
    const itemDate = new Date(item.rawDate);
    const now = new Date();

    if (selectedDateFilter === 'TODAY') {
      return (
        itemDate.getDate() === now.getDate() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    if (selectedDateFilter === 'THIS_MONTH') {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }
    if (selectedDateFilter === 'CUSTOM') {
      if (customStartDate && new Date(customStartDate) > itemDate) return false;
      if (customEndDate) {
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        if (end < itemDate) return false;
      }
      return true;
    }
    return true;
  };

  // Filtered lists
  const filteredReceived = useMemo(() => {
    return receivedPayments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(p.clientName || '').toLowerCase().includes(q) ||
        String(p.siteName || '').toLowerCase().includes(q) ||
        String(p.id || '').toLowerCase().includes(q) ||
        String(p.displayId || '').toLowerCase().includes(q) ||
        String(p.referenceNo || '').toLowerCase().includes(q) ||
        String(p.invoiceRef || '').toLowerCase().includes(q);

      const matchesSite =
        selectedSiteFilter === 'All Sites' ||
        p.siteName === selectedSiteFilter ||
        p.siteId === selectedSiteFilter ||
        String(p.siteName || '').includes(selectedSiteFilter);

      const matchesMode =
        selectedModeFilter === 'All Modes' ||
        String(p.paymentMode || '').toLowerCase().includes(selectedModeFilter.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === 'All Status' ||
        String(p.status || '').toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesSite && matchesMode && matchesStatus && matchesDateFilter(p);
    });
  }, [receivedPayments, searchQuery, selectedSiteFilter, selectedModeFilter, selectedStatusFilter, selectedDateFilter, customStartDate, customEndDate]);

  const filteredOutgoing = useMemo(() => {
    return outgoingPayments.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        String(p.beneficiary || '').toLowerCase().includes(q) ||
        String(p.siteName || '').toLowerCase().includes(q) ||
        String(p.id || '').toLowerCase().includes(q) ||
        String(p.displayId || '').toLowerCase().includes(q) ||
        String(p.category || '').toLowerCase().includes(q) ||
        String(p.referenceNo || '').toLowerCase().includes(q) ||
        String(p.billRef || '').toLowerCase().includes(q);

      const matchesSite =
        selectedSiteFilter === 'All Sites' ||
        p.siteName === selectedSiteFilter ||
        p.siteId === selectedSiteFilter ||
        String(p.siteName || '').includes(selectedSiteFilter);

      const matchesMode =
        selectedModeFilter === 'All Modes' ||
        String(p.paymentMode || '').toLowerCase().includes(selectedModeFilter.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === 'All Status' ||
        String(p.status || '').toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesSite && matchesMode && matchesStatus && matchesDateFilter(p);
    });
  }, [outgoingPayments, searchQuery, selectedSiteFilter, selectedModeFilter, selectedStatusFilter, selectedDateFilter, customStartDate, customEndDate]);

  // Active paginated slice
  const activeList = activeTab === 'received' ? filteredReceived : filteredOutgoing;
  const totalPages = Math.ceil(activeList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return activeList.slice(startIndex, startIndex + itemsPerPage);
  }, [activeList, currentPage, itemsPerPage]);

  const handleReceivedSiteChange = (selectedVal) => {
    if (!selectedVal) {
      setReceivedForm((prev) => ({
        ...prev,
        siteName: '',
        clientName: '',
      }));
      return;
    }

    const matched = sitesList.find(
      (s) => `${s.name} (${s.code})` === selectedVal || s.name === selectedVal || s._id === selectedVal
    );

    setReceivedForm((prev) => ({
      ...prev,
      siteName: selectedVal,
      clientName: matched?.client || matched?.clientName || '',
    }));
  };

  const handleOpenReceivedModal = () => {
    setReceivedForm({
      clientName: '',
      siteName: '',
      invoiceRef: '',
      amount: '',
      paymentMode: 'Bank Transfer (NEFT)',
      referenceNo: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setReceivedReceiptPreview(null);
    setIsReceivedModalOpen(true);
  };

  const handleSaveReceived = async (e) => {
    e.preventDefault();
    if (!receivedForm.siteName) {
      alert('Please select a construction site.');
      return;
    }
    if (!receivedForm.amount || parseFloat(receivedForm.amount) <= 0) return;

    const matched = sitesList.find(
      (s) => `${s.name} (${s.code})` === receivedForm.siteName || s.name === receivedForm.siteName || s._id === receivedForm.siteName
    );
    const siteId = matched ? matched._id : null;
    if (!siteId) {
      alert('Please select a valid construction site from the list.');
      return;
    }
    const siteName = matched.name;
    const siteCode = matched.code;

    try {
      await paymentApi.create({
        flowType: 'RECEIVED',
        siteId,
        siteName,
        siteCode,
        partyName: receivedForm.clientName,
        category: 'Client Payment',
        amount: parseFloat(receivedForm.amount),
        paymentMode: receivedForm.paymentMode,
        referenceNo: receivedForm.referenceNo || `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceRef: receivedForm.invoiceRef || '',
        date: receivedForm.date,
        receiptUrl: receivedReceiptPreview || '',
        notes: receivedForm.notes || '',
      });
      await loadAllData();
      setIsReceivedModalOpen(false);
      setReceivedReceiptPreview(null);
      setReceivedForm({
        clientName: '',
        siteName: '',
        invoiceRef: '',
        amount: '',
        paymentMode: 'Bank Transfer (NEFT)',
        referenceNo: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (err) {
      console.warn('API error creating received payment:', err.message);
      alert(`Could not record received payment: ${err.message}`);
    }
  };

  const handleSelectPendingExpense = (expenseId) => {
    setSelectedPendingExpenseId(expenseId);
    if (!expenseId) return;

    const exp = pendingExpenses.find((e) => (e._id || e.id) === expenseId);
    if (!exp) return;

    const beneficiary = exp.supplierName && exp.supplierName !== '-' ? exp.supplierName : exp.description;
    const catMap = {
      Materials: 'Materials',
      Labour: 'Labour Wages',
      Rental: 'Machinery Rental',
      'Vehicle Rent': 'Vehicle Rental',
      'Additional Work': 'Other',
      Other: 'Other',
    };
    const sName = exp.siteName || exp.site?.name || '';
    const sCode = exp.siteCode || exp.site?.code || '';
    const siteLabel = sName ? `${sName}${sCode ? ` (${sCode})` : ''}` : outgoingForm.siteName;
    const billRef = exp.invoiceBillNo || exp.invoiceNo || exp.description || `EXP-${String(exp._id || exp.id).slice(-4)}`;
    const amt = exp.pendingAmount !== undefined && exp.pendingAmount > 0 ? exp.pendingAmount : exp.amount;

    setOutgoingForm((prev) => ({
      ...prev,
      beneficiary,
      category: catMap[exp.category] || 'Materials',
      siteName: siteLabel,
      amount: String(amt),
      billRef,
      notes: `Clearing pending expense: ${exp.description}`,
    }));
  };

  const handleSaveOutgoing = async (e) => {
    e.preventDefault();
    const payAmt = parseFloat(outgoingForm.amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      alert('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    if (selectedPendingExpenseId) {
      const linkedExp = pendingExpenses.find((ex) => (ex._id || ex.id) === selectedPendingExpenseId);
      const outstanding =
        linkedExp?.pendingAmount !== undefined && linkedExp.pendingAmount > 0
          ? linkedExp.pendingAmount
          : linkedExp?.amount || 0;
      if (linkedExp && payAmt > outstanding) {
        alert(`Payment amount (₹${payAmt.toLocaleString('en-IN')}) cannot exceed remaining outstanding amount (₹${outstanding.toLocaleString('en-IN')}).`);
        return;
      }
    }

    const matched = sitesList.find(
      (s) =>
        `${s.name} (${s.code})` === outgoingForm.siteName ||
        s.name === outgoingForm.siteName ||
        s.name === outgoingForm.siteName.split(' (')[0] ||
        s._id === outgoingForm.siteName
    );
    const siteId = matched ? matched._id : null;
    if (!siteId) {
      alert('Please select a valid construction site.');
      return;
    }
    const siteName = matched.name;
    const siteCode = matched.code;

    try {
      await paymentApi.create({
        flowType: 'OUTGOING',
        siteId,
        siteName,
        siteCode,
        expenseId: selectedPendingExpenseId || null,
        recordAsSiteExpense: !selectedPendingExpenseId,
        partyName: outgoingForm.beneficiary,
        category: outgoingForm.category || 'Materials',
        amount: payAmt,
        paymentMode: outgoingForm.paymentMode,
        referenceNo: outgoingForm.referenceNo || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
        invoiceRef: outgoingForm.billRef || '',
        date: outgoingForm.date,
        receiptUrl: outgoingReceiptPreview || '',
        notes: outgoingForm.notes || '',
      });
      await loadAllData();
      setIsOutgoingModalOpen(false);
      setSelectedPendingExpenseId('');
      setOutgoingReceiptPreview(null);
      setOutgoingForm({
        beneficiary: '',
        category: 'Materials',
        siteName: sitesList[0] ? `${sitesList[0].name} (${sitesList[0].code})` : '',
        billRef: '',
        amount: '',
        paymentMode: 'Bank Transfer (NEFT)',
        referenceNo: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (err) {
      console.warn('API error creating outgoing payment:', err.message);
      alert(`Could not save payment: ${err.message}`);
    }
  };

  const handleOpenEdit = (payment) => {
    setEditingPayment(payment);
    setEditForm({
      partyName: payment.clientName || payment.beneficiary || payment.partyName || '',
      category: payment.category || 'Materials',
      amount: String(payment.amount || ''),
      paymentMode: payment.paymentMode || 'Bank Transfer (NEFT)',
      referenceNo: payment.referenceNo || '',
      invoiceRef: payment.invoiceRef || payment.billRef || '',
      status: payment.status || 'Cleared',
      date: payment.rawDate ? new Date(payment.rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: payment.notes || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;
    try {
      const id = editingPayment._id || editingPayment.id;
      const parsedAmt = parseFloat(editForm.amount) || 0;
      await paymentApi.update(id, {
        partyName: editForm.partyName,
        category: editForm.category,
        amount: parsedAmt,
        paymentMode: editForm.paymentMode,
        referenceNo: editForm.referenceNo,
        invoiceRef: editForm.invoiceRef,
        status: editForm.status,
        date: editForm.date,
        notes: editForm.notes,
      });
      await loadAllData();
      setEditingPayment(null);
    } catch (err) {
      console.warn('Could not update payment in backend:', err.message);
      alert(`Could not update payment: ${err.message}`);
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      return;
    }
    try {
      await paymentApi.delete(id);
      await loadAllData();
    } catch (err) {
      console.warn('Could not delete payment in backend:', err.message);
      alert(`Could not delete payment: ${err.message}`);
    }
  };

  const handleExportCSV = () => {
    const listToExport = activeList;
    if (!listToExport || listToExport.length === 0) {
      alert(`No ${activeTab === 'received' ? 'received client payments' : 'outgoing payments'} to export.`);
      return;
    }

    let headers = [];
    let rows = [];

    if (activeTab === 'received') {
      headers = ['#', 'Receipt No.', 'Date', 'Client Name', 'Site Name', 'Site Code', 'Milestone / Invoice Ref', 'Payment Mode', 'Amount (₹)', 'Status', 'Notes'];
      rows = listToExport.map((p, idx) => [
        idx + 1,
        `"${p.displayId || p.id}"`,
        `"${p.date}"`,
        `"${(p.clientName || '').replace(/"/g, '""')}"`,
        `"${(p.siteName || '').replace(/"/g, '""')}"`,
        `"${p.siteCode || ''}"`,
        `"${(p.invoiceRef || '').replace(/"/g, '""')}"`,
        `"${p.paymentMode || ''}"`,
        p.amount || 0,
        `"${p.status || ''}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
      ]);
    } else {
      headers = ['#', 'Voucher No.', 'Date', 'Paid To / Beneficiary', 'Category', 'Site Name', 'Site Code', 'Bill / Expense Ref', 'Payment Mode', 'Amount (₹)', 'Status', 'Notes'];
      rows = listToExport.map((p, idx) => [
        idx + 1,
        `"${p.displayId || p.id}"`,
        `"${p.date}"`,
        `"${(p.beneficiary || '').replace(/"/g, '""')}"`,
        `"${p.category || ''}"`,
        `"${(p.siteName || '').replace(/"/g, '""')}"`,
        `"${p.siteCode || ''}"`,
        `"${(p.billRef || '').replace(/"/g, '""')}"`,
        `"${p.paymentMode || ''}"`,
        p.amount || 0,
        `"${p.status || ''}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(',')).join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeTab}_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReceiptUpload = (e, type) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'received') setReceivedReceiptPreview(reader.result);
        else setOutgoingReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-7 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                Payments Management
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200 rounded-full uppercase">
                Dual Cash Flow
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track client inflows (received) and vendor outflows (expenses) with live database synchronization.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenReceivedModal}
            className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowDownLeft size={16} />
            <span>+ Receive Client Payment</span>
          </button>

          <button
            onClick={() => setIsOutgoingModalOpen(true)}
            className="flex items-center gap-2 bg-[#0072ff] hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowUpRight size={16} />
            <span>+ Pay Supplier / Vendor</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow (Client Received) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Client Inflow (Money Received)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            ₹ {totalReceived.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="font-bold text-emerald-800">{receivedPayments.length} receipts</span>
            <span>across construction sites</span>
          </div>

          {/* Dynamic Payment Progress Bar (Client Received vs Total Contract Budget) */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-600">Payment Progress</span>
              <span className={`font-black ${paymentProgressColor.text}`}>
                {paymentProgressPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${paymentProgressColor.bar}`}
                style={{ width: `${paymentProgressPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
              <span>Received: ₹{totalReceived.toLocaleString('en-IN')}</span>
              <span>Budget: ₹{totalContractBudget.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Total Outflow (Paid to Suppliers) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Supplier Outflow (Money Paid)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹ {totalOutgoing.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="font-bold text-slate-800">{outgoingPayments.length} payouts</span>
            <span>materials, labour & rentals</span>
          </div>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Net Operating Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${netBalance >= 0 ? 'text-indigo-900' : 'text-rose-600'}`}>
            ₹ {netBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <span className={netBalance >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
              {netBalance >= 0 ? 'Positive cash flow' : 'Deficit / Needs capital'}
            </span>
            <span>retained in treasury</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Two-Tab Switcher: Received vs Outgoing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          {/* Tab 1: Received Payments */}
          <button
            onClick={() => setActiveTab('received')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'received'
                ? 'bg-[#008744] text-white shadow-md shadow-emerald-800/25'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ArrowDownLeft size={16} />
            <span>1. Received Payments (Client → Company)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'received' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {receivedPayments.length}
            </span>
          </button>

          {/* Tab 2: Outgoing Payments */}
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-[#0072ff] text-white shadow-md shadow-blue-500/25'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ArrowUpRight size={16} />
            <span>2. Outgoing Payments (Company → Supplier)</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'outgoing' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {outgoingPayments.length}
            </span>
          </button>
        </div>

        {/* Active Tab Explanation Pill */}
        <div className="text-[11px] font-semibold text-slate-500">
          {activeTab === 'received'
            ? 'Payments received from clients against their sites or milestone invoices'
            : 'Payments made to material suppliers, contractors and rental providers'}
        </div>
      </div>

      {/* 4. Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder={
              activeTab === 'received'
                ? 'Search client name, site, receipt ID, reference...'
                : 'Search supplier/vendor, category, bill ref, payment ID...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Site Filter */}
          <div className="relative">
            <select
              value={selectedSiteFilter}
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="All Sites">All Sites</option>
              {sitesList.map((s) => (
                <option key={s._id || s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Payment Mode Filter */}
          <div className="relative">
            <select
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="All Modes">All Modes</option>
              <option value="Bank">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Cleared">Cleared / Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Custom Date Inputs if CUSTOM selected */}
          {selectedDateFilter === 'CUSTOM' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. Payments Data Tables */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-xs overflow-hidden">
        {activeTab === 'received' ? (
          /* Table: Received Payments */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Receipt No.</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Site / Project</th>
                  <th className="py-3.5 px-4">Invoice / Milestone Ref</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Received Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      <Clock size={24} className="mx-auto mb-2 text-slate-300 animate-spin" />
                      <div className="font-semibold text-slate-600">Loading payment transactions...</div>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      <ArrowDownLeft size={28} className="mx-auto mb-2 text-slate-300" />
                      <div className="font-bold text-slate-600">No client payments match your filters.</div>
                      <div className="text-xs text-slate-400 mt-1">Click "+ Receive Client Payment" above to record an inflow.</div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item, idx) => (
                    <tr key={item._id || item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.displayId || item.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {item.clientName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.siteName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {item.invoiceRef}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                        {item.paymentMode}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-black text-sm text-emerald-700">
                          ₹ {item.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View */}
                          <button
                            title="View Receipt Details"
                            onClick={() => setViewingPayment(item)}
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          {/* Edit */}
                          <button
                            title="Edit Payment"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          {/* Delete */}
                          <button
                            title="Delete Payment Record"
                            onClick={() => handleDeletePayment(item._id || item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Table: Outgoing Payments */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100/90">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Voucher No.</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Paid To / Beneficiary</th>
                  <th className="py-3.5 px-4">Expense Category</th>
                  <th className="py-3.5 px-4">Site / Project</th>
                  <th className="py-3.5 px-4">Bill / Ref</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-400">
                      <Clock size={24} className="mx-auto mb-2 text-slate-300 animate-spin" />
                      <div className="font-semibold text-slate-600">Loading payment transactions...</div>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-12 text-center text-slate-400">
                      <ArrowUpRight size={28} className="mx-auto mb-2 text-slate-300" />
                      <div className="font-bold text-slate-600">No outgoing payments match your filters.</div>
                      <div className="text-xs text-slate-400 mt-1">Click "+ Pay Supplier / Vendor" above to record a disbursement.</div>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item, idx) => (
                    <tr key={item._id || item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {item.displayId || item.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {item.beneficiary}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {item.siteName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.billRef}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold whitespace-nowrap">
                        {item.paymentMode}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="font-black text-sm text-slate-950">
                          ₹ {item.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-300">
                          <CheckCircle2 size={12} className="text-blue-600" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View */}
                          <button
                            title="View Voucher Details"
                            onClick={() => setViewingPayment(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                          {/* Edit */}
                          <button
                            title="Edit Payment"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          {/* Delete */}
                          <button
                            title="Delete Payment Record"
                            onClick={() => handleDeletePayment(item._id || item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{activeList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, activeList.length)}</strong> of{' '}
            <strong className="text-slate-800">{activeList.length}</strong> payments
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft size={13} />
              <span>Prev</span>
            </button>
            <span className="font-extrabold text-slate-700 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal 1: Record Received Client Payment */}
      <AnimatePresence>
        {isReceivedModalOpen && (
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Record Received Payment</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Money received from client against a construction site.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReceivedModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveReceived} className="px-6 py-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Construction Site <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        required
                        value={receivedForm.siteName}
                        onChange={(e) => handleReceivedSiteChange(e.target.value)}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                      >
                        <option value="">-- Select Construction Site --</option>
                        {sitesList.map((s) => (
                          <option key={s._id || s.id} value={`${s.name} (${s.code})`}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Client Name <span className="text-rose-500">*</span>
                      </label>
                      {receivedForm.clientName && receivedForm.siteName && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Auto-filled (Editable)
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Select site or enter client name"
                      value={receivedForm.clientName}
                      onChange={(e) => setReceivedForm({ ...receivedForm, clientName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Receipt Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={receivedForm.date}
                      onChange={(e) => setReceivedForm({ ...receivedForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Received Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 50000"
                      value={receivedForm.amount}
                      onChange={(e) => setReceivedForm({ ...receivedForm, amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Payment Mode <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={receivedForm.paymentMode}
                        onChange={(e) => setReceivedForm({ ...receivedForm, paymentMode: e.target.value })}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs cursor-pointer"
                      >
                        <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                        <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
                        <option value="UPI (GPay)">UPI (GPay)</option>
                        <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Invoice / Milestone Ref <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-008 / Slab casting"
                      value={receivedForm.invoiceRef}
                      onChange={(e) => setReceivedForm({ ...receivedForm, invoiceRef: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Reference / UTR No. <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-98218731 / Cheque #1029"
                    value={receivedForm.referenceNo}
                    onChange={(e) => setReceivedForm({ ...receivedForm, referenceNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                {/* Receipt Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Receipt Photo / Screenshot <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      ref={receivedFileRef}
                      onChange={(e) => handleReceiptUpload(e, 'received')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => receivedFileRef.current && receivedFileRef.current.click()}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>{receivedReceiptPreview ? 'Change Photo' : 'Upload Receipt Photo'}</span>
                    </button>
                    {receivedReceiptPreview && (
                      <button
                        type="button"
                        onClick={() => setReceivedReceiptPreview(null)}
                        className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {receivedReceiptPreview && (
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                      <img src={receivedReceiptPreview} alt="Receipt preview" className="max-h-24 rounded-lg object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter additional remarks or payment details..."
                    value={receivedForm.notes}
                    onChange={(e) => setReceivedForm({ ...receivedForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReceivedModalOpen(false)}
                    className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
                  >
                    <ArrowDownLeft size={15} />
                    <span>Save Received Payment</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 2: Record Outgoing Vendor Payment */}
      <AnimatePresence>
        {isOutgoingModalOpen && (
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center shadow-xs shrink-0">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Record Outgoing Payment</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Money paid to material supplier, labour or equipment rental.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOutgoingModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveOutgoing} className="px-6 py-5 space-y-4 text-xs">
                {/* Link to Pending Bill / Expense */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Receipt size={14} className="text-blue-600" />
                      <span>Link to Pending Bill / Expense (Optional)</span>
                    </label>
                    {pendingExpenses.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/80">
                        {pendingExpenses.length} Pending
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={selectedPendingExpenseId}
                      onChange={(e) => handleSelectPendingExpense(e.target.value)}
                      className="w-full appearance-none pl-3.5 pr-8 py-2 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer shadow-2xs"
                    >
                      <option value="">-- Direct Payment (Not linked to any expense) --</option>
                      {pendingExpenses.map((exp) => {
                        const expSite = exp.siteName || exp.site?.name || 'Site';
                        const expSupplier = exp.supplierName && exp.supplierName !== '-' ? exp.supplierName : exp.description;
                        const expPending = exp.pendingAmount !== undefined && exp.pendingAmount > 0 ? exp.pendingAmount : exp.amount;
                        return (
                          <option key={exp._id || exp.id} value={exp._id || exp.id}>
                            {expSite} • {expSupplier} • ₹{Number(expPending || 0).toLocaleString('en-IN')} ({exp.category})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                  {selectedPendingExpenseId && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>Linked to pending expense. Submitting will update the expense as Paid!</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Paid To / Beneficiary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SM Traders / Murugan Labour Group"
                    value={outgoingForm.beneficiary}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, beneficiary: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={outgoingForm.category}
                        onChange={(e) => setOutgoingForm({ ...outgoingForm, category: e.target.value })}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                      >
                        <option value="Materials">Materials Purchase</option>
                        <option value="Labour Wages">Labour Wages</option>
                        <option value="Vehicle Rental">Vehicle Rental</option>
                        <option value="Machinery Rental">Machinery Rental</option>
                        <option value="Contractor">Sub-Contractor</option>
                        <option value="Other">Other Expenses</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Construction Site <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={outgoingForm.siteName}
                        onChange={(e) => setOutgoingForm({ ...outgoingForm, siteName: e.target.value })}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
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
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Paid Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 25000"
                      value={outgoingForm.amount}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Payment Mode <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={outgoingForm.paymentMode}
                        onChange={(e) => setOutgoingForm({ ...outgoingForm, paymentMode: e.target.value })}
                        className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs cursor-pointer"
                      >
                        <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                        <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
                        <option value="UPI (GPay)">UPI (GPay)</option>
                        <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Bill / Voucher / DC Reference <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-SM-8841 / Trip sheet"
                      value={outgoingForm.billRef}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, billRef: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Reference / UTR No. <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR-2026110821"
                      value={outgoingForm.referenceNo}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, referenceNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Voucher Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Receipt / Voucher Screenshot <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      ref={outgoingFileRef}
                      onChange={(e) => handleReceiptUpload(e, 'outgoing')}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => outgoingFileRef.current && outgoingFileRef.current.click()}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>{outgoingReceiptPreview ? 'Change Photo' : 'Upload Voucher Photo'}</span>
                    </button>
                    {outgoingReceiptPreview && (
                      <button
                        type="button"
                        onClick={() => setOutgoingReceiptPreview(null)}
                        className="text-rose-600 hover:text-rose-700 font-bold text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {outgoingReceiptPreview && (
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                      <img src={outgoingReceiptPreview} alt="Voucher preview" className="max-h-24 rounded-lg object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Notes <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter additional remarks or payment details..."
                    value={outgoingForm.notes}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOutgoingModalOpen(false)}
                    className="px-5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0072ff] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <ArrowUpRight size={15} />
                    <span>Save Outgoing Payment</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 3: View Payment Details Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b border-slate-100 ${
              viewingPayment.flowType === 'RECEIVED' ? 'bg-emerald-50/50' : 'bg-blue-50/50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  viewingPayment.flowType === 'RECEIVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {viewingPayment.flowType === 'RECEIVED' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {viewingPayment.flowType === 'RECEIVED' ? 'Client Receipt Details' : 'Payment Voucher Details'}
                  </h3>
                  <p className="text-xs text-slate-500">Ref: {viewingPayment.displayId || viewingPayment.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingPayment(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Amount Hero Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {viewingPayment.flowType === 'RECEIVED' ? 'Received Amount' : 'Disbursed Amount'}
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    ₹ {viewingPayment.amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    viewingPayment.status === 'Cleared' || viewingPayment.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {viewingPayment.status}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">{viewingPayment.paymentMode}</div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">
                    {viewingPayment.flowType === 'RECEIVED' ? 'Client Name' : 'Paid To / Beneficiary'}
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {viewingPayment.clientName || viewingPayment.beneficiary || viewingPayment.partyName}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Transaction Date</span>
                  <div className="font-bold text-slate-900 mt-0.5">{viewingPayment.date}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Construction Site</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {viewingPayment.siteName} {viewingPayment.siteCode ? `(${viewingPayment.siteCode})` : ''}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">
                    {viewingPayment.flowType === 'RECEIVED' ? 'Milestone / Invoice Ref' : 'Bill / Expense Ref'}
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {viewingPayment.invoiceRef || viewingPayment.billRef || '-'}
                  </div>
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Reference / UTR / Cheque Number</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{viewingPayment.referenceNo || '-'}</div>
                </div>
              </div>

              {/* Notes */}
              {viewingPayment.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-slate-700">
                  <strong className="text-amber-900">Notes:</strong> {viewingPayment.notes}
                </div>
              )}

              {/* Receipt screenshot preview */}
              {viewingPayment.receiptUrl && (
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-medium">Receipt Photo / Voucher Document:</span>
                  <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center justify-center">
                    <img
                      src={viewingPayment.receiptUrl}
                      alt="Receipt Preview"
                      className="max-h-48 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit {editingPayment.flowType === 'RECEIVED' ? 'Receipt' : 'Payment Voucher'}
                  </h3>
                  <p className="text-xs text-slate-500">{editingPayment.siteName}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPayment(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {editingPayment.flowType === 'RECEIVED' ? 'Client Name *' : 'Paid To / Beneficiary *'}
                </label>
                <input
                  type="text"
                  required
                  value={editForm.partyName}
                  onChange={(e) => setEditForm({ ...editForm, partyName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                />
              </div>

              {editingPayment.flowType === 'OUTGOING' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  >
                    <option value="Materials">Materials</option>
                    <option value="Labour Wages">Labour Wages</option>
                    <option value="Vehicle Rental">Vehicle Rental</option>
                    <option value="Machinery Rental">Machinery Rental</option>
                    <option value="Contractor">Sub-Contractor</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={editForm.paymentMode}
                    onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  >
                    <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                    <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
                    <option value="UPI (GPay)">UPI (GPay)</option>
                    <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  >
                    <option value="Cleared">Cleared</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ref / UTR Number</label>
                  <input
                    type="text"
                    value={editForm.referenceNo}
                    onChange={(e) => setEditForm({ ...editForm, referenceNo: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bill / Milestone Ref</label>
                  <input
                    type="text"
                    value={editForm.invoiceRef}
                    onChange={(e) => setEditForm({ ...editForm, invoiceRef: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
