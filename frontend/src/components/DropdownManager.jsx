import React, { useState, useMemo } from 'react';
import {
  Warehouse,
  Wallet,
  HardHat,
  Building2,
  CreditCard,
  CalendarDays,
  Layers,
  FileSpreadsheet,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RotateCcw,
  Search,
  ChevronRight,
  ListFilter,
} from 'lucide-react';
import { DROPDOWN_MODULES, useDropdowns } from '../context/DropdownContext';

const MODULE_ICONS = {
  'Godown Stock': Warehouse,
  'Site Expenses': Wallet,
  Labour: HardHat,
  'Sites & Projects': Building2,
  Payments: CreditCard,
  'Daily Updates': CalendarDays,
  'Master Data': Layers,
  'Billing & Invoices': FileSpreadsheet,
};

const COLOR_STYLES = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
};

export default function DropdownManager() {
  const {
    dropdowns,
    loading,
    updateDropdownOptions,
    createCustomDropdown,
    deleteCustomDropdown,
    resetDropdownOptions,
  } = useDropdowns();

  const [selectedModule, setSelectedModule] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubGroup, setSelectedSubGroup] = useState('All');

  // Inline option add/edit states keyed by dropdown.key
  const [newOptionInputs, setNewOptionInputs] = useState({});
  const [editingOption, setEditingOption] = useState(null); // { key, index, value }
  const [savingKey, setSavingKey] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Create new custom dropdown modal/form state
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldSubGroup, setNewFieldSubGroup] = useState('Custom');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const showToast = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const moduleDropdowns = useMemo(() => {
    if (!selectedModule) return [];
    return dropdowns.filter((d) => d.module === selectedModule.id);
  }, [dropdowns, selectedModule]);

  const subGroups = useMemo(() => {
    const groups = Array.from(
      new Set(moduleDropdowns.map((d) => d.subGroup).filter(Boolean))
    );
    return groups.length > 1 ? ['All', ...groups] : [];
  }, [moduleDropdowns]);

  const filteredDropdowns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return moduleDropdowns.filter((d) => {
      const matchGroup =
        selectedSubGroup === 'All' || d.subGroup === selectedSubGroup;
      const matchSearch =
        !q ||
        d.label.toLowerCase().includes(q) ||
        (d.subGroup || '').toLowerCase().includes(q) ||
        d.options.some((o) => o.toLowerCase().includes(q));
      return matchGroup && matchSearch;
    });
  }, [moduleDropdowns, selectedSubGroup, searchQuery]);

  const handleAddOption = async (config) => {
    const raw = (newOptionInputs[config.key] || '').trim();
    if (!raw) return;
    if (config.options.some((o) => o.toLowerCase() === raw.toLowerCase())) {
      showToast(`"${raw}" already exists in ${config.label}`, 'error');
      return;
    }
    try {
      setSavingKey(config.key);
      await updateDropdownOptions(config.key, [...config.options, raw]);
      setNewOptionInputs((prev) => ({ ...prev, [config.key]: '' }));
      showToast(`Added "${raw}" to ${config.label}`);
    } catch (err) {
      showToast(err.message || 'Failed to add option', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleDeleteOption = async (config, index) => {
    const target = config.options[index];
    const next = config.options.filter((_, idx) => idx !== index);
    try {
      setSavingKey(config.key);
      await updateDropdownOptions(config.key, next);
      showToast(`Removed "${target}" from ${config.label}`);
    } catch (err) {
      showToast(err.message || 'Failed to delete option', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveEditedOption = async (config) => {
    if (!editingOption) return;
    const trimmed = editingOption.value.trim();
    if (!trimmed) return;
    const next = config.options.map((opt, idx) =>
      idx === editingOption.index ? trimmed : opt
    );
    try {
      setSavingKey(config.key);
      await updateDropdownOptions(config.key, next);
      setEditingOption(null);
      showToast(`Updated option in ${config.label}`);
    } catch (err) {
      showToast(err.message || 'Failed to update option', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleReset = async (config) => {
    if (!window.confirm(`Reset "${config.label}" back to default options?`)) return;
    try {
      setSavingKey(config.key);
      await resetDropdownOptions(config.key);
      showToast(`Reset "${config.label}" to defaults`);
    } catch (err) {
      showToast(err.message || 'Failed to reset dropdown', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  const handleCreateCustomField = async (e) => {
    e.preventDefault();
    if (!newFieldLabel.trim() || !selectedModule) return;
    const parsedOptions = newFieldOptions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await createCustomDropdown({
        module: selectedModule.id,
        label: newFieldLabel.trim(),
        subGroup: newFieldSubGroup.trim() || 'Custom',
        options: parsedOptions,
      });
      setNewFieldLabel('');
      setNewFieldSubGroup('Custom');
      setNewFieldOptions('');
      setIsCreatingField(false);
      showToast('Created new custom dropdown list');
    } catch (err) {
      showToast(err.message || 'Failed to create dropdown', 'error');
    }
  };

  const handleDeleteCustomField = async (config) => {
    if (!window.confirm(`Delete custom dropdown "${config.label}"?`)) return;
    try {
      await deleteCustomDropdown(config.key);
      showToast(`Deleted "${config.label}"`);
    } catch (err) {
      showToast(err.message || 'Failed to delete custom dropdown', 'error');
    }
  };

  return (
    <div className="space-y-5">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold border shadow-sm flex items-center justify-between ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* VIEW 1: 8-CARD MODULE GRID */}
      {!selectedModule ? (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                <ListFilter size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Manage Module Dropdowns (8 Modules)
                </h2>
                <p className="text-xs text-slate-500">
                  Click any module card below to view, add, edit, or delete its dropdown options.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 self-start sm:self-auto">
              {dropdowns.length} Dropdown Lists
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {DROPDOWN_MODULES.map((mod) => {
              const Icon = MODULE_ICONS[mod.id] || Layers;
              const modLists = dropdowns.filter((d) => d.module === mod.id);
              const totalOptions = modLists.reduce(
                (sum, d) => sum + (d.options?.length || 0),
                0
              );
              const colorCls = COLOR_STYLES[mod.color] || COLOR_STYLES.emerald;

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setSelectedModule(mod);
                    setSelectedSubGroup('All');
                    setSearchQuery('');
                    setIsCreatingField(false);
                  }}
                  className="group bg-white hover:bg-slate-50/70 rounded-3xl border border-slate-200/80 hover:border-emerald-300 p-5 text-left shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${colorCls}`}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-colors">
                      <ChevronRight size={15} />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-600">
                      {loading ? '...' : `${modLists.length} Dropdowns`}
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {loading ? '...' : `${totalOptions} Options`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: SELECTED MODULE DROPDOWN EDITOR */
        <div className="space-y-5">
          {/* Top Bar */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedModule(null)}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer transition-colors"
                title="Back to 8 Modules"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Module Dropdowns
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {selectedModule.title} ({moduleDropdowns.length})
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-56 sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search dropdown or option..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsCreatingField((prev) => !prev)}
                className="flex items-center gap-1.5 bg-[#008744] hover:bg-[#00743a] text-white rounded-xl px-4 py-2 text-xs font-bold shadow-sm cursor-pointer transition-colors"
              >
                <Plus size={14} />
                <span>New Dropdown</span>
              </button>
            </div>
          </div>

          {/* Create New Custom Dropdown Form */}
          {isCreatingField && (
            <form
              onSubmit={handleCreateCustomField}
              className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                  Create New Dropdown in {selectedModule.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingField(false)}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Dropdown Name (e.g. Fuel Type)"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Group (e.g. Vehicle, Steel)"
                  value={newFieldSubGroup}
                  onChange={(e) => setNewFieldSubGroup(e.target.value)}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Initial options (comma-separated)"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingField(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008744] text-white text-xs font-bold cursor-pointer"
                >
                  Create Dropdown
                </button>
              </div>
            </form>
          )}

          {/* Sub-group filter pills (e.g. Cement, Steel, Bricks in Godown Stock) */}
          {subGroups.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {subGroups.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedSubGroup(grp)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSubGroup === grp
                      ? 'bg-[#008744] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>
          )}

          {/* Dropdown Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDropdowns.map((config) => (
              <div
                key={config.key}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {config.label}
                        </h3>
                        {config.isCustom && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {config.subGroup || selectedModule.title} • {config.options.length} options
                      </span>
                    </div>

                    {config.isCustom ? (
                      <button
                        onClick={() => handleDeleteCustomField(config)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                        title="Delete custom dropdown"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReset(config)}
                        disabled={savingKey === config.key}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
                        title="Reset to default options"
                      >
                        <RotateCcw size={11} />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  {/* Options Chips */}
                  <div className="flex flex-wrap gap-2">
                    {config.options.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">
                        No options yet. Add one below.
                      </span>
                    ) : (
                      config.options.map((opt, idx) => {
                        const isEditing =
                          editingOption &&
                          editingOption.key === config.key &&
                          editingOption.index === idx;

                        if (isEditing) {
                          return (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded-xl px-2 py-1"
                            >
                              <input
                                type="text"
                                value={editingOption.value}
                                onChange={(e) =>
                                  setEditingOption({
                                    ...editingOption,
                                    value: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveEditedOption(config);
                                  }
                                  if (e.key === 'Escape') setEditingOption(null);
                                }}
                                className="w-32 px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-emerald-300 rounded-lg focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveEditedOption(config)}
                                className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                onClick={() => setEditingOption(null)}
                                className="p-1 rounded bg-slate-200 text-slate-600 cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={`${opt}-${idx}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 group"
                          >
                            <span>{opt}</span>
                            <button
                              onClick={() =>
                                setEditingOption({
                                  key: config.key,
                                  index: idx,
                                  value: opt,
                                })
                              }
                              className="text-slate-400 hover:text-blue-600 cursor-pointer"
                              title="Edit option"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteOption(config, idx)}
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Delete option"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Add New Option Input */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type new option and press Add..."
                    value={newOptionInputs[config.key] || ''}
                    onChange={(e) =>
                      setNewOptionInputs((prev) => ({
                        ...prev,
                        [config.key]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption(config);
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={savingKey === config.key}
                    onClick={() => handleAddOption(config)}
                    className="px-3.5 py-2 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
