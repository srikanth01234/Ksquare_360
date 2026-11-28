import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dropdownApi } from '../services/api';

export const DROPDOWN_MODULES = [
  {
    id: 'Godown Stock',
    title: 'Godown Stock',
    description: 'Material types, sizes, brands & measurement units',
    color: 'emerald',
  },
  {
    id: 'Site Expenses',
    title: 'Site Expenses',
    description: 'Vehicle types, rental equipment, categories & units',
    color: 'blue',
  },
  {
    id: 'Labour',
    title: 'Labour',
    description: 'Daily wage trades & square-foot contract work types',
    color: 'amber',
  },
  {
    id: 'Sites & Projects',
    title: 'Sites & Projects',
    description: 'Project cities, states & site statuses',
    color: 'indigo',
  },
  {
    id: 'Payments',
    title: 'Payments',
    description: 'Payment modes & outgoing payment categories',
    color: 'rose',
  },
  {
    id: 'Daily Updates',
    title: 'Daily Updates',
    description: 'Work phases / activities & material usage units',
    color: 'teal',
  },
  {
    id: 'Master Data',
    title: 'Master Data',
    description: 'Material categories, units, designations & departments',
    color: 'purple',
  },
  {
    id: 'Billing & Invoices',
    title: 'Billing & Invoices',
    description: 'Invoice line item units & payment terms',
    color: 'sky',
  },
];

const DropdownContext = createContext(null);

export function DropdownProvider({ children }) {
  const [dropdowns, setDropdowns] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshDropdowns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dropdownApi.getAll();
      const list = res?.data || res || [];
      if (Array.isArray(list)) {
        setDropdowns(list);
      }
    } catch (err) {
      console.warn('Could not load dynamic dropdowns:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDropdowns();
  }, [refreshDropdowns]);

  const dropdownMap = useMemo(() => {
    const map = {};
    dropdowns.forEach((d) => {
      map[d.key] = d;
    });
    return map;
  }, [dropdowns]);

  const getOptions = useCallback(
    (key, fallback = []) => {
      const entry = dropdownMap[key];
      if (entry && Array.isArray(entry.options)) {
        return entry.options;
      }
      return fallback;
    },
    [dropdownMap]
  );

  const getModuleDropdowns = useCallback(
    (moduleId) => dropdowns.filter((d) => d.module === moduleId),
    [dropdowns]
  );

  const updateDropdownOptions = useCallback(async (key, options, label) => {
    const res = await dropdownApi.update(key, { options, label });
    const updated = res?.data;
    if (updated) {
      setDropdowns((prev) => prev.map((d) => (d.key === key ? updated : d)));
    }
    return updated;
  }, []);

  const createCustomDropdown = useCallback(async (payload) => {
    const res = await dropdownApi.create(payload);
    const created = res?.data;
    if (created) {
      setDropdowns((prev) => [...prev, created]);
    }
    return created;
  }, []);

  const deleteCustomDropdown = useCallback(async (key) => {
    await dropdownApi.delete(key);
    setDropdowns((prev) => prev.filter((d) => d.key !== key));
  }, []);

  const resetDropdownOptions = useCallback(async (key) => {
    const res = await dropdownApi.reset(key);
    const updated = res?.data;
    if (updated) {
      setDropdowns((prev) => prev.map((d) => (d.key === key ? updated : d)));
    }
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      dropdowns,
      dropdownMap,
      loading,
      refreshDropdowns,
      getOptions,
      getModuleDropdowns,
      updateDropdownOptions,
      createCustomDropdown,
      deleteCustomDropdown,
      resetDropdownOptions,
    }),
    [
      dropdowns,
      dropdownMap,
      loading,
      refreshDropdowns,
      getOptions,
      getModuleDropdowns,
      updateDropdownOptions,
      createCustomDropdown,
      deleteCustomDropdown,
      resetDropdownOptions,
    ]
  );

  return <DropdownContext.Provider value={value}>{children}</DropdownContext.Provider>;
}

export function useDropdowns() {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    return {
      dropdowns: [],
      dropdownMap: {},
      loading: false,
      refreshDropdowns: async () => {},
      getOptions: (_key, fallback = []) => fallback,
      getModuleDropdowns: () => [],
      updateDropdownOptions: async () => null,
      createCustomDropdown: async () => null,
      deleteCustomDropdown: async () => {},
      resetDropdownOptions: async () => null,
    };
  }
  return ctx;
}
