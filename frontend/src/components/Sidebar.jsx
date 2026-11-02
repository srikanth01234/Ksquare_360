import React from 'react';
import {
  LayoutDashboard,
  Building2,
  HardHat,
  Wallet,
  CalendarDays,
  FileSpreadsheet,
  BarChart3,
  Settings,
  Layers,
} from 'lucide-react';

export default function Sidebar({
  activeNav = 'Dashboard',
  setActiveNav = () => {},
}) {
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Sites', label: 'Sites', icon: Building2 },
    { id: 'Labour', label: 'Labour', icon: HardHat },
    { id: 'Site Expenses', label: 'Site Expenses', icon: Wallet },
    { id: 'Daily Updates', label: 'Daily Updates', icon: CalendarDays },
    { id: 'Billing & Invoices', label: 'Billing & Invoices', icon: FileSpreadsheet },
    { id: 'Reports', label: 'Reports', icon: BarChart3 },
    { id: 'Master Data', label: 'Master Data', icon: Layers },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-[#061536] via-[#081e4d] to-[#040e24] text-white flex flex-col justify-between relative overflow-hidden select-none shrink-0 shadow-2xl">
      {/* Top Branding & Menu */}
      <div className="z-10 flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-blue-900/40">
          <div className="w-11 h-11 rounded-xl bg-black/40 border border-blue-500/30 p-1 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 backdrop-blur-xs">
            <img
              src="/logo.png"
              alt="K Square Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,114,255,0.6)]"
            />
          </div>
          <div>
            <div className="font-extrabold tracking-wider text-base text-white leading-tight flex items-center gap-1">
              <span>K</span>
              <span className="text-[#38bdf8]">SQUARE</span>
            </div>
            <div className="text-[10px] text-blue-200/70 font-medium tracking-tight">
              Construction Management System
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#0072ff] text-white shadow-lg shadow-blue-600/40 font-bold translate-x-1'
                    : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  size={18}
                  className={isActive ? 'text-white' : 'text-blue-300/80'}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings at Bottom */}
      <div className="z-10 px-3 pb-6">
        <button
          onClick={() => setActiveNav('Settings')}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 text-left cursor-pointer ${
            activeNav === 'Settings'
              ? 'bg-[#0072ff] text-white shadow-lg shadow-blue-600/40 font-bold translate-x-1'
              : 'text-blue-100/70 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings
            size={18}
            className={activeNav === 'Settings' ? 'text-white' : 'text-blue-300/80'}
          />
          <span>Settings</span>
        </button>
      </div>

      {/* Real Construction Background Image at the Bottom of Sidebar */}
      <div
        className="absolute inset-x-0 bottom-0 h-80 pointer-events-none select-none overflow-hidden z-0"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, transparent 20%, black 70%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, transparent 20%, black 70%, black 100%)',
        }}
      >
        {/* Real Construction Site Photography with Cranes and Skyscraper Frame */}
        <img
          src="/construction-crane.jpg"
          alt=""
          className="w-full h-full object-cover object-bottom filter contrast-125 saturate-150 opacity-20 mix-blend-luminosity"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Ambient Neon Blue Construction Glow at the Bottom */}
        <div className="absolute -bottom-8 left-0 right-0 h-28 bg-[#0072ff]/25 blur-xl pointer-events-none" />

        {/* Subtle Glowing Blue Wave Line Overlay */}
        <svg
          viewBox="0 0 256 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 left-0 right-0 w-full opacity-40"
        >
          <path
            d="M0 35C45 20 110 50 165 30C210 15 235 25 256 32V60H0V35Z"
            fill="url(#blueWaveGlow)"
          />
          <defs>
            <linearGradient id="blueWaveGlow" x1="0" y1="20" x2="256" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0072ff" stopOpacity="0.8" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </aside>
  );
}
