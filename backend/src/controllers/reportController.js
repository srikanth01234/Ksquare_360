const Expense = require('../models/Expense');
const StockMovement = require('../models/StockMovement');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Site = require('../models/Site');
const MaterialMaster = require('../models/MaterialMaster');

// @desc    Get site-wise expenditure breakdown report
// @route   GET /api/reports/site-expenses
// @access  Public
exports.getSiteExpenseReport = async (req, res, next) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    const filter = {};

    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).populate('site', 'name code location client');

    const siteMap = {};

    expenses.forEach((e) => {
      const sId = e.site ? e.site._id.toString() : 'Unknown';
      const sName = e.siteName || (e.site ? e.site.name : 'Unknown');
      const sCode = e.siteCode || (e.site ? e.site.code : '-');

      if (!siteMap[sId]) {
        siteMap[sId] = {
          siteId: sId,
          siteName: sName,
          siteCode: sCode,
          materials: 0,
          labour: 0,
          rental: 0,
          additionalWork: 0,
          other: 0,
          total: 0,
          count: 0,
        };
      }

      const amt = e.amount || 0;
      siteMap[sId].total += amt;
      siteMap[sId].count += 1;

      const cat = e.category;
      if (cat === 'Materials') siteMap[sId].materials += amt;
      else if (cat === 'Labour') siteMap[sId].labour += amt;
      else if (cat === 'Rental' || cat === 'Vehicle Rent' || cat === 'Rent') siteMap[sId].rental += amt;
      else if (cat === 'Additional Work') siteMap[sId].additionalWork += amt;
      else siteMap[sId].other += amt;
    });

    res.status(200).json({
      success: true,
      data: Object.values(siteMap),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get material consumption report (Inward vs Outward to sites)
// @route   GET /api/reports/material-consumption
// @access  Public
exports.getMaterialConsumptionReport = async (req, res, next) => {
  try {
    const movements = await StockMovement.find().populate('material');

    const materialMap = {};

    movements.forEach((m) => {
      if (!m.material) return;
      const mId = m.material._id.toString();

      if (!materialMap[mId]) {
        materialMap[mId] = {
          materialId: mId,
          code: m.material.code,
          name: m.material.name,
          unit: m.material.unit,
          totalInwardQty: 0,
          totalOutwardQty: 0,
          totalInwardCost: 0,
          totalOutwardValue: 0,
        };
      }

      if (m.movementType === 'INWARD') {
        materialMap[mId].totalInwardQty += m.quantity;
        materialMap[mId].totalInwardCost += m.totalAmount || 0;
      } else if (m.movementType === 'OUTWARD') {
        materialMap[mId].totalOutwardQty += m.quantity;
        materialMap[mId].totalOutwardValue += m.totalAmount || 0;
      }
    });

    res.status(200).json({
      success: true,
      data: Object.values(materialMap),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall company financial health overview
// @route   GET /api/reports/financial-overview
// @access  Public
exports.getFinancialOverviewReport = async (req, res, next) => {
  try {
    const [invoices, payments, expenses, sites] = await Promise.all([
      Invoice.find(),
      Payment.find(),
      Expense.find(),
      Site.find(),
    ]);

    let totalInvoiced = 0;
    let totalClientReceived = 0;
    let totalVendorDisbursed = 0;
    let totalExpensesIncurred = 0;
    let totalProjectBudgets = 0;

    invoices.forEach((i) => (totalInvoiced += i.totalAmount || 0));
    payments.forEach((p) => {
      if (p.flowType === 'RECEIVED' && (p.status === 'Cleared' || p.status === 'Paid')) {
        totalClientReceived += p.amount || 0;
      } else if (p.flowType === 'OUTGOING' && (p.status === 'Cleared' || p.status === 'Paid')) {
        totalVendorDisbursed += p.amount || 0;
      }
    });
    expenses.forEach((e) => (totalExpensesIncurred += e.amount || 0));
    sites.forEach((s) => (totalProjectBudgets += s.projectBudget || 0));

    const netCashInHand = totalClientReceived - totalVendorDisbursed;
    const clientReceivableBalance = Math.max(0, totalProjectBudgets - totalClientReceived);

    res.status(200).json({
      success: true,
      data: {
        totalProjectBudgets: Math.round(totalProjectBudgets),
        totalInvoiced: Math.round(totalInvoiced),
        totalClientReceived: Math.round(totalClientReceived),
        totalVendorDisbursed: Math.round(totalVendorDisbursed),
        totalExpensesIncurred: Math.round(totalExpensesIncurred),
        netCashInHand: Math.round(netCashInHand),
        clientReceivableBalance: Math.round(clientReceivableBalance),
        activeSitesCount: sites.filter((s) => s.status === 'Active').length,
      },
    });
  } catch (error) {
    next(error);
  }
};

