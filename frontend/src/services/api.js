/**
 * K Square Construction Management System - Centralized API Service Layer
 * Connects React 19 Frontend with Node.js / Express / MongoDB Atlas Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal request helper with error handling & JSON formatting
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(result.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.data = result;
      throw error;
    }

    return result;
  } catch (error) {
    console.warn(`[API] Request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Build URL search query string
 */
function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const str = query.toString();
  return str ? `?${str}` : '';
}

// 1. Master Materials API
export const materialApi = {
  getAll: (params) => request(`/master/materials${buildQuery(params)}`),
  getById: (id) => request(`/master/materials/${id}`),
  create: (data) => request('/master/materials', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/master/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/master/materials/${id}`, { method: 'DELETE' }),
};

// 1b. Master Clients API
export const clientApi = {
  getAll: (params) => request(`/master/clients${buildQuery(params)}`),
  getById: (id) => request(`/master/clients/${id}`),
  create: (data) => request('/master/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/master/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/master/clients/${id}`, { method: 'DELETE' }),
};

// 1c. Master Employees API
export const employeeApi = {
  getAll: (params) => request(`/master/employees${buildQuery(params)}`),
  getById: (id) => request(`/master/employees/${id}`),
  create: (data) => request('/master/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/master/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/master/employees/${id}`, { method: 'DELETE' }),
};

// 2. Godown Inventory API
export const godownApi = {
  getStocks: (params) => request(`/godown/stocks${buildQuery(params)}`),
  recordInward: (data) => request('/godown/inward', { method: 'POST', body: JSON.stringify(data) }),
  recordOutward: (data) => request('/godown/outward', { method: 'POST', body: JSON.stringify(data) }),
  getMovements: (params) => request(`/godown/movements${buildQuery(params)}`),
};

// 3. Construction Sites API & Financial Cash Flow
export const siteApi = {
  getAll: (params) => request(`/sites${buildQuery(params)}`),
  getById: (id) => request(`/sites/${id}`),
  create: (data) => request('/sites', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/sites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/sites/${id}`, { method: 'DELETE' }),
};

// 4. Site Expenses API
export const expenseApi = {
  getAll: (params) => request(`/expenses${buildQuery(params)}`),
  getSummary: (siteId) => request(`/expenses/summary${buildQuery({ siteId })}`),
  getById: (id) => request(`/expenses/${id}`),
  create: (data) => {
    const isFormData = data instanceof FormData;
    return request('/expenses', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  update: (id, data) => {
    const isFormData = data instanceof FormData;
    return request(`/expenses/${id}`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  delete: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
};

// 5. Payments Ledger API (Client Received vs Outgoing Disbursements)
export const paymentApi = {
  getAll: (params) => request(`/payments${buildQuery(params)}`),
  getSummary: (siteId) => request(`/payments/summary${buildQuery({ siteId })}`),
  getPendingExpenses: (params) => request(`/payments/pending-expenses${buildQuery(params)}`),
  create: (data) => {
    const isFormData = data instanceof FormData;
    return request('/payments', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  update: (id, data) => request(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/payments/${id}`, { method: 'DELETE' }),
};

// 6. Labour Management & Payroll API
export const labourApi = {
  getAll: (params) => request(`/labour${buildQuery(params)}`),
  getById: (id) => request(`/labour/${id}`),
  create: (data) => {
    const isFormData = data instanceof FormData;
    return request('/labour', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  update: (id, data) => {
    const isFormData = data instanceof FormData;
    return request(`/labour/${id}`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  recordAttendance: (data) => request('/labour/attendance', { method: 'POST', body: JSON.stringify(data) }),
  getWagesSummary: (params) => request(`/labour/wages-summary${buildQuery(params)}`),
  delete: (id) => request(`/labour/${id}`, { method: 'DELETE' }),
};

// 7. Daily Updates API
export const dailyUpdateApi = {
  getSitesOverview: () => request('/daily-updates/sites-overview'),
  getAll: (params) => request(`/daily-updates${buildQuery(params)}`),
  create: (data) => {
    const isFormData = data instanceof FormData;
    return request('/daily-updates', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  },
  delete: (id) => request(`/daily-updates/${id}`, { method: 'DELETE' }),
};

// 8. Billing & Invoices API
export const invoiceApi = {
  getAll: (params) => request(`/invoices${buildQuery(params)}`),
  getSummary: (siteId) => request(`/invoices/summary${buildQuery({ siteId })}`),
  getById: (id) => request(`/invoices/${id}`),
  create: (data) => request('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),
};

// 9. Reports & Analytics API
export const reportApi = {
  getSiteExpenses: (params) => request(`/reports/site-expenses${buildQuery(params)}`),
  getMaterialConsumption: (params) => request(`/reports/material-consumption${buildQuery(params)}`),
  getFinancialOverview: () => request('/reports/financial-overview'),
};

export default {
  material: materialApi,
  client: clientApi,
  employee: employeeApi,
  godown: godownApi,
  site: siteApi,
  expense: expenseApi,
  payment: paymentApi,
  labour: labourApi,
  dailyUpdate: dailyUpdateApi,
  invoice: invoiceApi,
  report: reportApi,
};

