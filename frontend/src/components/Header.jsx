import React from 'react';
import { Menu, ChevronDown, ArrowLeft } from 'lucide-react';

export default function Header({ title = 'Dashboard', onBack = null }) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Back button or Hamburger & Title */}
      <div className="flex items-center gap-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        ) : (
          <button className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <Menu size={22} />
          </button>
        )}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      {/* Right: Admin Profile */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-[#0072ff] text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-blue-600/30">
            A
          </div>
          <span className="text-sm font-semibold text-slate-800">Admin</span>
          <ChevronDown size={15} className="text-slate-500" />
        </div>
      </div>
    </header>
  );
}
