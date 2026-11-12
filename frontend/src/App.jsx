import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './utils/animations';
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
import Godown from './pages/Godown';
import Payments from './pages/Payments';
import { INITIAL_MATERIALS } from './constants/materialsData';

export default function App() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSiteExpense, setSelectedSiteExpense] = useState(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Global shared materials catalog (syncs real-time between Master Data and Godown Stock)
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);

  // Global shared expenses state
  const [expenses, setExpenses] = useState([]);

  const handleAddExpense = (newExp) => {
    const formatted = {
      ...newExp,
      id: String(expenses.length + 1).padStart(2, '0'),
      categoryColor:
        newExp.category === 'Materials'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
          : newExp.category === 'Labour'
          ? 'bg-sky-50 text-sky-700 border-sky-200/80'
          : newExp.category === 'Additional Work'
          ? 'bg-purple-50 text-purple-700 border-purple-200/80'
          : newExp.category === 'Vehicle Rent'
          ? 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
          : newExp.category === 'Rent'
          ? 'bg-amber-50 text-amber-800 border-amber-200/80'
          : 'bg-slate-100 text-slate-700 border-slate-200',
    };
    setExpenses([formatted, ...expenses]);
  };

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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#f8fafc]">
        {/* Top Header */}
        <Header
          title={
            selectedSite
              ? selectedSite.name
              : selectedSiteExpense
              ? `${selectedSiteExpense.siteName} Expenses`
              : activeNav === 'Sites'
              ? 'Sites Management'
              : activeNav === 'Godown'
              ? 'Godown Management'
              : activeNav === 'Labour'
              ? 'Labour Management'
              : activeNav === 'Site Expenses'
              ? 'Site Expenses'
              : activeNav === 'Payments'
              ? 'Payments Management'
              : activeNav === 'Daily Updates'
              ? 'Daily Updates'
              : activeNav === 'Billing & Invoices'
              ? isCreatingInvoice
                ? 'Create Invoice'
                : 'Billing & Invoices'
              : activeNav === 'Completed Sites' || activeNav === 'Reports'
              ? 'Completed Sites'
              : activeNav === 'Master Data'
              ? 'Master Data'
              : activeNav === 'Settings'
              ? 'User Management'
              : activeNav
          }
          onBack={
            selectedSite
              ? () => setSelectedSite(null)
              : selectedSiteExpense
              ? () => setSelectedSiteExpense(null)
              : isCreatingInvoice
              ? () => setIsCreatingInvoice(false)
              : null
          }
        />

        {/* 3. Page Content */}
        <main className="flex-1 w-full flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={
                selectedSite
                  ? `site-details-${selectedSite._id || selectedSite.code || selectedSite.name}`
                  : selectedSiteExpense
                  ? `expense-details-${selectedSiteExpense.code || selectedSiteExpense.name}`
                  : isCreatingInvoice
                  ? 'create-invoice'
                  : activeNav
              }
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-1 flex flex-col"
            >
              {activeNav === 'Dashboard' && (
                <Dashboard
                  onNavigate={(nav, site) => {
                    setActiveNav(nav);
                    if (site) setSelectedSite(site);
                  }}
                />
              )}

              {activeNav === 'Sites' && !selectedSite && (
                <Sites onSelectSite={(site) => setSelectedSite(site)} />
              )}

              {activeNav === 'Sites' && selectedSite && (
                <SiteDetails
                  site={selectedSite}
                  onBack={() => setSelectedSite(null)}
                />
              )}

              {activeNav === 'Godown' && (
                <Godown materials={materials} setMaterials={setMaterials} />
              )}

              {activeNav === 'Labour' && <Labour />}

              {activeNav === 'Site Expenses' && !selectedSiteExpense && (
                <SiteExpenses
                  sharedExpenses={expenses}
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

              {activeNav === 'Payments' && <Payments />}

              {activeNav === 'Daily Updates' && (
                <DailyUpdates onExpenseAdded={handleAddExpense} />
              )}

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

              {(activeNav === 'Completed Sites' || activeNav === 'Reports') && <Reports />}

              {activeNav === 'Master Data' && (
                <MasterData materials={materials} setMaterials={setMaterials} />
              )}

              {activeNav === 'Settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
