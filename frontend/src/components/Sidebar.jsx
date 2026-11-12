import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Warehouse,
  HardHat,
  Wallet,
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Settings,
  Headphones,
  LogOut,
  CreditCard,
} from 'lucide-react';

export default function Sidebar({
  activeNav = 'Dashboard',
  setActiveNav = () => {},
}) {
  // Navigation Modules Grouped in Pairs based on client handwritten blueprint
  const menuGroups = [
    {
      groupKey: 'grp-1',
      items: [
        { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'Godown', label: 'Godown Stock', icon: Warehouse },
      ],
    },
    {
      groupKey: 'grp-2',
      items: [
        { id: 'Sites', label: 'Sites', icon: Building2 },
        { id: 'Daily Updates', label: 'Daily Updates', icon: CalendarDays },
      ],
    },
    {
      groupKey: 'grp-3',
      items: [
        { id: 'Site Expenses', label: 'Site Expenses', icon: Wallet },
        { id: 'Payments', label: 'Payments', icon: CreditCard },
      ],
    },
    {
      groupKey: 'grp-4',
      items: [
        { id: 'Master Data', label: 'Master Data', icon: Layers },
        { id: 'Labour', label: 'Labour', icon: HardHat },
      ],
    },
    {
      groupKey: 'grp-5',
      items: [
        { id: 'Billing & Invoices', label: 'Billing & Invoices', icon: FileSpreadsheet },
        { id: 'Completed Sites', label: 'Completed Sites', icon: CheckCircle2 },
      ],
    },
  ];

  return (
    <aside className="w-[260px] min-h-screen bg-[#030f27] text-white flex flex-col flex-shrink-0 relative overflow-hidden select-none shadow-2xl">
      {/* 1. Top Accent SVG Banner (Directly from Invoice) */}
      <div className="w-full h-[18px] flex-shrink-0 relative z-10 leading-none overflow-hidden bg-white">
        <svg
          className="w-full h-full block"
          viewBox="0 0 1000 70"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Red Shape */}
          <polygon points="0,0 160,0 240,40 500,40 540,60 200,60 120,20 0,20" fill="#D90429" />
          {/* Three Red Slashes */}
          <polygon points="510,40 530,40 570,60 550,60" fill="#D90429" />
          <polygon points="540,40 560,40 600,60 580,60" fill="#D90429" />
          <polygon points="570,40 590,40 630,60 610,60" fill="#D90429" />
          {/* Main Blue Banner */}
          <polygon points="160,0 240,40 820,40 900,0" fill="#0066FF" />
          {/* Right Red Block */}
          <rect x="920" y="0" width="80" height="20" fill="#D90429" />
        </svg>
      </div>

      {/* 2. White Brand Header (Large Logo + Royal Blue Title) */}
      <div className="h-[96px] bg-white flex items-center px-4 gap-3.5 flex-shrink-0 relative z-20 border-b-0">
        <img
          src="/logo.png"
          alt="K Square Logo"
          className="h-[68px] w-auto max-w-[72px] object-contain flex-shrink-0 drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]"
        />
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-[1.3rem] font-[800] tracking-[0.8px] leading-[1.15] text-[#0A53BE]">
            K SQUARE
          </span>
          <span className="text-[0.64rem] font-[700] text-[#334155] uppercase tracking-[0.6px] leading-[1.25] mt-1">
            Material
            <br />
            Management System
          </span>
        </div>
      </div>

      {/* 3. Ultra-Smooth Gradient Fade-Out (White to Dark Navy) */}
      <div
        className="w-full h-[48px] flex-shrink-0 relative z-10 pointer-events-none -mb-[18px]"
        style={{
          background:
            'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.90) 12%, rgba(255, 255, 255, 0.72) 25%, rgba(255, 255, 255, 0.50) 40%, rgba(255, 255, 255, 0.30) 55%, rgba(255, 255, 255, 0.15) 70%, rgba(255, 255, 255, 0.06) 84%, rgba(255, 255, 255, 0.01) 94%, rgba(3, 15, 39, 0) 100%)',
        }}
      />

      {/* Brand Logo Watermark in Sidebar Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <img
          src="/logo.png"
          alt=""
          className="w-64 h-64 object-contain opacity-[0.11] filter contrast-125 brightness-125"
        />
      </div>

      {/* Navigation Items (Grouped in Pairs matching handwritten specification) */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-2 py-2.5 z-10 scrollbar-none">
        {menuGroups.map((group) => (
          <div
            key={group.groupKey}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1 shadow-xs transition-colors"
          >
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm transition-colors text-left cursor-pointer overflow-hidden ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute inset-0 bg-[#0066FF] rounded-xl shadow-lg shadow-blue-600/30 z-0"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <div className="relative z-10 transition-transform duration-150">
                      <Icon
                        size={17}
                        className={isActive ? 'text-white' : 'text-blue-300'}
                      />
                    </div>
                    <span className="truncate relative z-10">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section: Settings Link, Support Card & Logout */}
      <div className="z-10 px-3 pt-1 pb-2 space-y-2 flex-shrink-0">
        {/* Settings Button */}
        <button
          onClick={() => setActiveNav('Settings')}
          className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
            activeNav === 'Settings'
              ? 'bg-[#0066FF] text-white font-bold'
              : 'text-slate-300 hover:bg-white/10 hover:text-white font-semibold'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings size={15} className={activeNav === 'Settings' ? 'text-white' : 'text-blue-300'} />
            <span>Settings</span>
          </div>
          <span className="text-[10px] text-blue-200 font-normal">v2.0</span>
        </button>

        {/* Need Help Support Card */}
        <div className="bg-[#071739] border border-blue-900/50 rounded-2xl p-2.5 shadow-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0066FF] flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/30">
            <Headphones size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white leading-tight">Need Help?</div>
            <div className="text-[10px] text-blue-200/80 font-medium">Contact Support</div>
            <a
              href="tel:+918838885379"
              className="text-xs font-black text-white hover:text-blue-300 transition-colors tracking-tight block mt-0.5"
            >
              +91 88388 85379
            </a>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) {
              window.location.reload();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs transition-all cursor-pointer"
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>

      {/* 4. Bottom Accent SVG Banner (Directly from Invoice) */}
      <div className="w-full h-[18px] flex-shrink-0 relative z-10 leading-none overflow-hidden mt-auto">
        <svg
          className="w-full h-full block"
          viewBox="0 0 1000 70"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Blue Base Strip */}
          <polygon points="0,56 100,56 172,20 820,20 892,56 1000,56 1000,60 0,60" fill="#0066FF" />
          {/* Three Red Slashes */}
          <polygon points="530,0 550,0 590,20 570,20" fill="#D90429" />
          <polygon points="560,0 580,0 620,20 600,20" fill="#D90429" />
          <polygon points="590,0 610,0 650,20 630,20" fill="#D90429" />
          {/* Right Red Wedge Block */}
          <polygon points="620,0 800,0 880,40 960,40 960,60 900,60 820,20 660,20" fill="#D90429" />
        </svg>
      </div>
    </aside>
  );
}
