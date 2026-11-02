import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import SiteDetails from './pages/SiteDetails';
import Labour from './pages/Labour';
import SiteExpenses from './pages/SiteExpenses';
import SiteExpenseDetails from './pages/SiteExpenseDetails';
import DailyUpdates from './pages/DailyUpdates';
import BillingInvoices from './pages/BillingInvoices';
import CreateInvoice from './pages/CreateInvoice';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MasterData from './pages/MasterData';

export default function App() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSiteExpense, setSelectedSiteExpense] = useState(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const handleNavChange = (nav) => {
    setActiveNav(nav);
    if (nav !== 'Sites') {
      setSelectedSite(null);
    }
    if (nav !== 'Site Expenses') {
      setSelectedSiteExpense(null);
    }
    if (nav !== 'Billing & Invoices') {
      setIsCreatingInvoice(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      {/* 1. Sidebar */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={handleNavChange}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header
          title={
            selectedSite
              ? selectedSite.name
              : selectedSiteExpense
              ? `${selectedSiteExpense.siteName} Expenses`
              : activeNav === 'Sites'
              ? 'Sites Management'
              : activeNav === 'Labour'
              ? 'Labour Management'
              : activeNav === 'Site Expenses'
              ? 'Site Expenses'
              : activeNav === 'Daily Updates'
              ? 'Daily Updates'
              : activeNav === 'Billing & Invoices'
              ? isCreatingInvoice
                ? 'Create Invoice'
                : 'Billing & Invoices'
              : activeNav === 'Reports'
              ? 'Site Reports'
              : activeNav === 'Master Data'
              ? 'Master Data'
              : activeNav === 'Settings'
              ? 'User Management'
              : activeNav
          }
        />

        {/* 3. Page Content */}
        <main className="flex-1">
          {activeNav === 'Dashboard' && <Dashboard />}

          {activeNav === 'Sites' && !selectedSite && (
            <Sites onSelectSite={(site) => setSelectedSite(site)} />
          )}

          {activeNav === 'Sites' && selectedSite && (
            <SiteDetails
              site={selectedSite}
              onBack={() => setSelectedSite(null)}
            />
          )}

          {activeNav === 'Labour' && <Labour />}

          {activeNav === 'Site Expenses' && !selectedSiteExpense && (
            <SiteExpenses
              onSelectSiteExpense={(exp) =>
                setSelectedSiteExpense({
                  name: exp.siteName,
                  code: exp.siteCode,
                  location: 'Chennai, TN',
                  client: 'Arun Kumar',
                  startDate: '12 Jan 2026',
                  status: 'Active',
                })
              }
            />
          )}

          {activeNav === 'Site Expenses' && selectedSiteExpense && (
            <SiteExpenseDetails
              site={selectedSiteExpense}
              onBack={() => setSelectedSiteExpense(null)}
            />
          )}

          {activeNav === 'Daily Updates' && <DailyUpdates />}

          {activeNav === 'Billing & Invoices' && !isCreatingInvoice && (
            <BillingInvoices
              onCreateInvoiceClick={() => setIsCreatingInvoice(true)}
            />
          )}

          {activeNav === 'Billing & Invoices' && isCreatingInvoice && (
            <CreateInvoice
              onBack={() => setIsCreatingInvoice(false)}
              onInvoiceCreated={() => setIsCreatingInvoice(false)}
            />
          )}

          {activeNav === 'Reports' && <Reports />}

          {activeNav === 'Master Data' && <MasterData />}

          {activeNav === 'Settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}
