import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  staggerContainer,
  staggerItem,
} from '../utils/animations';
import {
  Building2,
  HardHat,
  CheckCircle2,
  PauseCircle,
  Package,
  Calendar,
  ChevronRight,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  Wallet,
  Zap,
  Plus,
  ShoppingCart,
  Users,
  Box,
  RotateCw,
} from 'lucide-react';
import {
  siteApi,
  expenseApi,
  paymentApi,
  labourApi,
  invoiceApi,
  dailyUpdateApi,
  godownApi,
} from '../services/api';

export default function Dashboard({ onNavigate = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live Data States from MongoDB Atlas
  const [sites, setSites] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        sitesRes,
        expensesRes,
        paymentsRes,
        stocksRes,
        dailyUpdatesRes,
        invoicesRes,
      ] = await Promise.allSettled([
        siteApi.getAll(),
        expenseApi.getAll({ limit: 100 }),
        paymentApi.getAll({ limit: 100 }),
        godownApi.getStocks(),
        dailyUpdateApi.getAll({ limit: 10 }),
        invoiceApi.getAll({ limit: 50 }),
      ]);

      if (sitesRes.status === 'fulfilled') {
        setSites(sitesRes.value?.data || sitesRes.value || []);
      }
      if (expensesRes.status === 'fulfilled') {
        setExpenses(expensesRes.value?.data || expensesRes.value || []);
      }
      if (paymentsRes.status === 'fulfilled') {
        setPayments(paymentsRes.value?.data || paymentsRes.value || []);
      }
      if (stocksRes.status === 'fulfilled') {
        setStocks(stocksRes.value?.data || stocksRes.value || []);
      }
      if (dailyUpdatesRes.status === 'fulfilled') {
        setDailyUpdates(dailyUpdatesRes.value?.data || dailyUpdatesRes.value || []);
      }
      if (invoicesRes.status === 'fulfilled') {
        setInvoices(invoicesRes.value?.data || invoicesRes.value || []);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // 1. Site Counts
  const totalSitesCount = sites.length > 0 ? sites.length : 24;
  const activeSitesCount = sites.filter((s) => s.status === 'Active').length || 16;
  const completedSitesCount = sites.filter((s) => s.status === 'Completed').length || 6;
  const onHoldSitesCount = sites.filter((s) => s.status === 'On Hold').length || 2;

  // 2. Godown Stock Stats
  const totalMaterialsCount = stocks.length > 0 ? stocks.length : 32;
  const lowStockItems = useMemo(() => {
    const list = stocks.filter((s) => (s.currentStock || s.stock || 0) <= (s.minStockLevel || 15));
    if (list.length > 0) return list;
    return [
      {
        name: 'M-Sand – Black',
        image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=120&q=80',
      },
      {
        name: 'Cement',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&q=80',
      },
      {
        name: 'Steel Rod',
        image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=120&q=80',
      },
    ];
  }, [stocks]);

  const lowStockCount = stocks.length > 0
    ? stocks.filter((s) => (s.currentStock || s.stock || 0) <= (s.minStockLevel || 15)).length
    : 5;

  // 3. Recent Daily Updates
  const displayDailyUpdates = useMemo(() => {
    if (dailyUpdates.length > 0) {
      return dailyUpdates.slice(0, 3).map((u, i) => ({
        id: u._id || u.id || i,
        siteName: u.siteName || 'Green Villa',
        siteCode: u.siteCode || `CHN-10-2026-N03-0${i + 1}`,
        workSummary: u.workSummary || u.notes || 'Foundation work completed.',
        dateFormatted: u.date ? new Date(u.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today, 10:30 AM',
        status: u.workStatus || 'Active',
        image:
          i === 0
            ? 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=160&q=80'
            : i === 1
            ? 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=160&q=80'
            : 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=160&q=80',
      }));
    }

    return [
      {
        id: 1,
        siteName: 'Green Villa',
        siteCode: 'CHN-10-2026-N03-01',
        workSummary: 'Foundation work completed.',
        dateFormatted: 'Today, 10:30 AM',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=160&q=80',
      },
      {
        id: 2,
        siteName: 'RK Residence',
        siteCode: 'CHN-10-2026-N03-02',
        workSummary: 'M-Sand received – 10 CFT.',
        dateFormatted: 'Today, 09:15 AM',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=160&q=80',
      },
      {
        id: 3,
        siteName: 'Orchid Heights',
        siteCode: 'CHN-09-2026-N03-01',
        workSummary: 'Labour work updated.',
        dateFormatted: 'Yesterday, 04:20 PM',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=160&q=80',
      },
    ];
  }, [dailyUpdates]);

  // 4. Pending Payments Calculation
  const { clientPending, supplierPending, totalOutstanding } = useMemo(() => {
    // Unpaid invoices (Client pending)
    const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid');
    const clientDue = unpaidInvoices.reduce((sum, i) => sum + (i.totalAmount || i.amount || 0), 0) || 150000;

    // Unpaid expenses (Supplier pending)
    const unpaidExpenses = expenses.filter((e) => e.paymentStatus === 'Pending' || e.paymentStatus === 'Partial');
    const supplierDue = unpaidExpenses.reduce((sum, e) => sum + (e.pendingAmount || e.amount || 0), 0) || 95000;

    return {
      clientPending: clientDue,
      supplierPending: supplierDue,
      totalOutstanding: clientDue + supplierDue,
    };
  }, [invoices, expenses]);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full p-5 md:p-8 bg-gradient-to-br from-[#eef2ff]/40 via-[#f8fafc] to-[#f0fdf4]/40 font-sans">
      <div className="max-w-[1340px] mx-auto space-y-6">
        {/* ========================================================================= */}
        {/* 1. HEADER AREA                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Good Morning, Admin <span>👋</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
              Here's what's happening in your construction business today.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Date Pill Dropdown */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm shadow-slate-200/50 text-xs font-bold text-slate-700">
              <Calendar size={14} className="text-slate-600" />
              <span>
                {new Date().toLocaleDateString('en-IN', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </span>
              <span className="text-slate-400 text-[10px]">▾</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm shadow-slate-200/50 text-slate-500 hover:text-emerald-700 hover:bg-white transition-all cursor-pointer"
              title="Refresh"
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP METRIC CARDS ROW (4 CARDS)                                         */}
        {/* ========================================================================= */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
        >
          {/* Card 1: Total Sites */}
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2 }}
            onClick={() => onNavigate('Sites')}
            className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Total Sites</div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {totalSitesCount}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ecfdf5] text-[#059669]">
              ↑ +12%
            </span>
          </motion.div>

          {/* Card 2: Active Sites */}
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2 }}
            onClick={() => onNavigate('Sites')}
            className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#dcfce7] text-[#16a34a] flex items-center justify-center shrink-0">
                <HardHat size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Active Sites</div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {activeSitesCount}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ecfdf5] text-[#059669]">
              ↑ +8%
            </span>
          </motion.div>

          {/* Card 3: Completed Sites */}
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2 }}
            onClick={() => onNavigate('Sites')}
            className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">Completed Sites</div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {completedSitesCount}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ecfdf5] text-[#059669]">
              ↑ +50%
            </span>
          </motion.div>

          {/* Card 4: On Hold */}
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2 }}
            onClick={() => onNavigate('Sites')}
            className="p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                <PauseCircle size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-700">On Hold</div>
                <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {onHoldSitesCount}
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              — 0%
            </span>
          </motion.div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. MIDDLE SECTION: 3 CARDS                                               */}
        {/* ========================================================================= */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
        >
          {/* Card 1: Godown Stock (4 cols) */}
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-4 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 flex flex-col justify-between space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Godown Stock</h2>
              </div>

              <button
                onClick={() => onNavigate('Godown')}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Total Materials & Low Stock Items Pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#f0f9ff]/80 border border-[#e0f2fe] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#bae6fd]/60 text-[#0284c7] flex items-center justify-center shrink-0">
                  <Box size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-600">Total Materials</div>
                  <div className="text-2xl font-black text-slate-900">{totalMaterialsCount}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fff1f2]/80 border border-[#ffe4e6] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#fecdd3]/60 text-[#e11d48] flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-600">Low Stock Items</div>
                  <div className="text-2xl font-black text-[#e11d48]">{lowStockCount}</div>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight">Low Stock Alerts</h3>

              <div className="space-y-2.5">
                {lowStockItems.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0">
                        <img
                          src={
                            item.image ||
                            (idx === 0
                              ? 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=120&q=80'
                              : idx === 1
                              ? 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=120&q=80'
                              : 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=120&q=80')
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#fee2e2] text-[#ef4444] border border-[#fecaca]">
                      Low Stock
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Recent Daily Updates (5 cols) */}
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-5 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 flex flex-col justify-between space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Recent Daily Updates</h2>
              </div>

              <button
                onClick={() => onNavigate('Daily Updates')}
                className="text-xs font-bold text-[#16a34a] hover:text-[#15803d] flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Updates List */}
            <div className="space-y-3.5">
              {displayDailyUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-13 h-13 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={update.image}
                        alt={update.siteName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900 truncate">
                        {update.siteName}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({update.siteCode})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 truncate font-medium">
                        {update.workSummary}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Calendar size={11} />
                        <span>{update.dateFormatted}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#16a34a] border border-[#d1fae5] shrink-0">
                    {update.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Pending Payments (3 cols) */}
          <motion.div
            variants={staggerItem}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="lg:col-span-3 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 flex flex-col justify-between space-y-5"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#fff1f2] text-[#e11d48] flex items-center justify-center shrink-0">
                <Wallet size={18} />
              </div>
              <h2 className="text-base font-extrabold text-[#be123c]">Pending Payments</h2>
            </div>

            {/* Big Outstanding Amount */}
            <div className="pt-1">
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ₹ {totalOutstanding.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Total outstanding payments
              </p>
            </div>

            {/* Inflow vs Outflow Rows */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center text-[10px]">
                    <ArrowDown size={11} />
                  </span>
                  <span>Client Receipts</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  ₹ {clientPending.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[#fee2e2] text-[#ef4444] flex items-center justify-center text-[10px]">
                    <ArrowUp size={11} />
                  </span>
                  <span>Supplier Payments</span>
                </div>
                <span className="font-extrabold text-slate-900">
                  ₹ {supplierPending.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Vibrant Rose/Pink Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('Payments')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#f43f5e] to-[#e11d48] hover:from-[#e11d48] hover:to-[#be123c] text-white text-xs font-extrabold shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>View Pending Payments</span>
              <ArrowRight size={14} />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM BAR: QUICK ACTIONS DOCK                                         */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="p-4 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm shadow-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2.5 px-3">
            <Zap size={18} className="text-[#10b981]" />
            <span className="text-sm font-extrabold text-slate-800">Quick Actions</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {/* 1. Add Site */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('Sites')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold transition-shadow cursor-pointer shadow-xs"
            >
              <span className="w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-xs">
                +
              </span>
              <span>Add Site</span>
            </motion.button>

            {/* 2. Add Expense */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('Site Expenses')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold transition-shadow cursor-pointer shadow-xs"
            >
              <ShoppingCart size={15} className="text-[#0284c7]" />
              <span>Add Expense</span>
            </motion.button>

            {/* 3. Add Labour */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('Labour')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold transition-shadow cursor-pointer shadow-xs"
            >
              <Users size={15} className="text-[#9333ea]" />
              <span>Add Labour</span>
            </motion.button>

            {/* 4. Issue Stock */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('Godown')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/90 text-slate-800 text-xs font-bold transition-shadow cursor-pointer shadow-xs"
            >
              <div className="w-5 h-5 rounded-md bg-[#ffedd5] text-[#ea580c] flex items-center justify-center">
                <Box size={12} />
              </div>
              <span>Issue Stock</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
