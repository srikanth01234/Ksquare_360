import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Building2,
  User,
  Plus,
  Search,
  Filter,
  Edit2,
  MoreHorizontal,
  ChevronRight,
  Crown,
  HardHat,
  Wallet,
  CheckCircle2,
  UserCheck,
  UserX,
} from 'lucide-react';
import AddUserModal from '../components/AddUserModal';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('User Management');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  const settingsMenu = [
    { id: 'User Management', label: 'User Management', icon: Users },
    { id: 'Roles & Permissions', label: 'Roles & Permissions', icon: Shield },
    { id: 'Company Details', label: 'Company Details', icon: Building2 },
    { id: 'My Profile', label: 'My Profile', icon: User },
  ];

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin',
      email: 'admin@kbuild360.com',
      initial: 'A',
      avatarBg: 'bg-emerald-700 text-white',
      role: 'Admin',
      roleBadge: 'bg-purple-50 text-purple-700 border-purple-200/80',
      roleIcon: Crown,
      site: 'All Sites',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Manoj Kumar',
      email: 'manoj@kbuild360.com',
      initial: 'M',
      avatarBg: 'bg-sky-500 text-white',
      role: 'Manager',
      roleBadge: 'bg-blue-50 text-blue-700 border-blue-200/80',
      roleIcon: User,
      site: 'Green Villa',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Sathish',
      email: 'sathish@kbuild360.com',
      initial: 'S',
      avatarBg: 'bg-amber-500 text-white',
      role: 'Site Staff',
      roleBadge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      roleIcon: HardHat,
      site: 'RK Residence',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Priya',
      email: 'priya@kbuild360.com',
      initial: 'P',
      avatarBg: 'bg-purple-500 text-white',
      role: 'Accounts',
      roleBadge: 'bg-purple-50 text-purple-700 border-purple-200/80',
      roleIcon: Wallet,
      site: 'All Sites',
      status: 'Active',
    },
    {
      id: 5,
      name: 'Ramesh',
      email: 'ramesh@kbuild360.com',
      initial: 'R',
      avatarBg: 'bg-rose-400 text-white',
      role: 'Site Staff',
      roleBadge: 'bg-amber-50 text-amber-800 border-amber-200/80',
      roleIcon: HardHat,
      site: 'Metro Apartment',
      status: 'Inactive',
    },
  ]);

  const handleAddUser = (newUser) => {
    const formatted = {
      ...newUser,
      id: Date.now(),
      avatarBg: 'bg-emerald-600 text-white',
      roleBadge:
        newUser.role === 'Admin'
          ? 'bg-purple-50 text-purple-700 border-purple-200/80'
          : newUser.role === 'Manager'
          ? 'bg-blue-50 text-blue-700 border-blue-200/80'
          : newUser.role === 'Accounts'
          ? 'bg-purple-50 text-purple-700 border-purple-200/80'
          : 'bg-amber-50 text-amber-800 border-amber-200/80',
      roleIcon:
        newUser.role === 'Admin'
          ? Crown
          : newUser.role === 'Manager'
          ? User
          : newUser.role === 'Accounts'
          ? Wallet
          : HardHat,
    };
    setUsers([...users, formatted]);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      selectedRole === 'All Roles' || u.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const activeCount = users.filter((u) => u.status === 'Active').length;
  const inactiveCount = users.filter((u) => u.status === 'Inactive').length;

  return (
    <div className="p-5 md:p-8 space-y-6 w-full bg-[#f8fafc] min-h-[calc(100vh-4rem)]">
      {/* 1. Header Banner */}
      <div className="relative bg-white rounded-3xl border border-slate-100 p-6 md:p-7 shadow-sm overflow-hidden flex items-center justify-between">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <SettingsIcon size={26} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
              Settings
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              User Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Add, edit and manage system users and their access.
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
            <line x1="140" y1="10" x2="100" y2="20" stroke="#10b981" strokeWidth="1" />
            <line x1="140" y1="10" x2="200" y2="20" stroke="#10b981" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* 2. Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Settings Navigation Menu (3.5 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-1.5">
          {settingsMenu.map((item) => {
            const ItemIcon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#dcfce7] text-[#064e3b] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ItemIcon size={17} className={isActive ? 'text-[#064e3b]' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className={isActive ? 'text-[#064e3b]' : 'text-slate-400'} />
              </button>
            );
          })}
        </div>

        {/* Right Column: User Management Content (8.5 cols) */}
        <div className="lg:col-span-9 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
          {/* Header Row: Title & Add User Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Users ({users.length})
            </h2>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-800/25 transition-all cursor-pointer"
            >
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>

          {/* 3 Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Users */}
            <div className="bg-[#edf9f3] rounded-2xl p-4 border border-emerald-100/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">
                  {users.length}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Total Users</div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-[#edf9f3] rounded-2xl p-4 border border-emerald-100/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck size={20} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">
                  {activeCount}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Active</div>
              </div>
            </div>

            {/* Inactive Users */}
            <div className="bg-[#fff7ee] rounded-2xl p-4 border border-amber-100/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <UserX size={20} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 leading-none">
                  {inactiveCount}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Inactive</div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
              >
                <option value="All Roles">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Site Staff">Site Staff</option>
                <option value="Accounts">Accounts</option>
              </select>
              <ChevronRight size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const RoleIcon = user.roleIcon || User;
                return (
                  <div
                    key={user.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    {/* User Profile Avatar & Name */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${user.avatarBg}`}
                      >
                        {user.initial}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="min-w-[110px]">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${user.roleBadge}`}
                      >
                        <RoleIcon size={12} />
                        <span>{user.role}</span>
                      </span>
                    </div>

                    {/* Assigned Site */}
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 min-w-[130px]">
                      <Building2 size={14} className="text-slate-400" />
                      <span>{user.site}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="min-w-[90px]">
                      {user.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        title="Edit User"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        title="More Options"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />
    </div>
  );
}

