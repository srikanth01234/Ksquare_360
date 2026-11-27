const Payment = require('../models/Payment');
const Site = require('../models/Site');
const Expense = require('../models/Expense');
const {
  recalculateExpensePaymentState,
  mapPaymentCategoryToExpenseCategory,
} = require('../utils/expenseSync');

// @desc    Get all pending expenses that require outgoing payments
// @route   GET /api/payments/pending-expenses
// @access  Public
exports.getPendingExpenses = async (req, res, next) => {
  try {
    const { siteId } = req.query;
    const filter = {
      paymentStatus: { $in: ['Pending', 'Partial'] },
    };
    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }
    const pendingExpenses = await Expense.find(filter)
      .populate('site', 'name code location')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingExpenses.length,
      data: pendingExpenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Client Received or Outgoing Vendor payouts)
// @route   GET /api/payments
// @access  Public
exports.getPayments = async (req, res, next) => {
  try {
    const { flowType, siteId, status, search, paymentMode, startDate, endDate, limit = 100 } = req.query;
    const filter = {};

    if (flowType && flowType !== 'All') {
      filter.flowType = flowType.toUpperCase();
    }

    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }

    if (status && status !== 'All Status' && status !== 'All') {
      filter.status = status;
    }

    if (paymentMode && paymentMode !== 'All Modes' && paymentMode !== 'All') {
      filter.paymentMode = paymentMode;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { partyName: { $regex: search, $options: 'i' } },
        { referenceNo: { $regex: search, $options: 'i' } },
        { invoiceRef: { $regex: search, $options: 'i' } },
        { siteName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate('site', 'name code location client')
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial cash flow overview metrics (Received, Outgoing, Net Balance)
// @route   GET /api/payments/summary
// @access  Public
exports.getPaymentSummary = async (req, res, next) => {
  try {
    const { siteId } = req.query;
    const filter = {};

    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }

    const allPayments = await Payment.find(filter);

    let totalReceived = 0;
    let totalOutgoing = 0;
    let pendingReceived = 0;
    let pendingOutgoing = 0;

    allPayments.forEach((p) => {
      const amt = p.amount || 0;
      if (p.flowType === 'RECEIVED') {
        if (p.status === 'Cleared' || p.status === 'Paid') {
          totalReceived += amt;
        } else {
          pendingReceived += amt;
        }
      } else if (p.flowType === 'OUTGOING') {
        if (p.status === 'Cleared' || p.status === 'Paid') {
          totalOutgoing += amt;
        } else {
          pendingOutgoing += amt;
        }
      }
    });

    const netBalance = totalReceived - totalOutgoing;

    res.status(200).json({
      success: true,
      data: {
        totalReceived: Math.round(totalReceived),
        totalOutgoing: Math.round(totalOutgoing),
        netBalance: Math.round(netBalance),
        pendingReceived: Math.round(pendingReceived),
        pendingOutgoing: Math.round(pendingOutgoing),
        totalTransactions: allPayments.length,
        isPositiveBalance: netBalance >= 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record new payment (Received from Client or Outgoing to Vendor/Labour)
// @route   POST /api/payments
// @access  Public
exports.createPayment = async (req, res, next) => {
  try {
    const {
      flowType,
      siteId,
      partyName,
      category,
      amount,
      paymentMode,
      referenceNo,
      invoiceRef,
      status,
      date,
      notes,
    } = req.body;

    if (!flowType || !partyName || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide flowType (RECEIVED/OUTGOING), partyName, and amount',
      });
    }

    let siteDoc = null;
    let siteName = req.body.siteName || '';
    let siteCode = req.body.siteCode || '';

    const targetSiteId = siteId || req.body.site;
    if (targetSiteId) {
      siteDoc = await Site.findById(targetSiteId).catch(() => null);
    }
    if (!siteDoc && (siteCode || siteName)) {
      const cleanName = String(siteName || '').split(' (')[0].trim();
      const extractedCode = siteCode || (String(siteName || '').match(/\(([^)]+)\)/)?.[1] || '').trim();
      if (extractedCode) {
        siteDoc = await Site.findOne({ code: extractedCode.toUpperCase() }).catch(() => null);
      }
      if (!siteDoc && cleanName) {
        siteDoc = await Site.findOne({ name: cleanName }).catch(() => null);
      }
    }
    if (siteDoc) {
      siteName = siteDoc.name;
      siteCode = siteDoc.code;
    }

    let receiptUrl = '';
    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
    } else if (req.body.receiptUrl) {
      receiptUrl = req.body.receiptUrl;
    }

    const targetExpenseId = req.body.expenseId || req.body.expense;
    let expenseDoc = null;
    if (targetExpenseId) {
      expenseDoc = await Expense.findById(targetExpenseId).catch(() => null);
      if (expenseDoc && flowType.toUpperCase() === 'OUTGOING') {
        const payAmt = parseFloat(amount) || 0;
        const outstanding = expenseDoc.pendingAmount !== undefined
          ? expenseDoc.pendingAmount
          : Math.max(0, (expenseDoc.amount || 0) - (expenseDoc.paidAmount || 0));

        if (payAmt <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Payment amount must be greater than 0.',
          });
        }
        if (payAmt > outstanding) {
          return res.status(400).json({
            success: false,
            message: `Payment amount (₹${payAmt}) cannot exceed remaining outstanding amount (₹${outstanding}).`,
          });
        }
      }
    }

    const payment = await Payment.create({
      flowType: flowType.toUpperCase(),
      site: siteDoc ? siteDoc._id : null,
      siteName,
      siteCode,
      expense: expenseDoc ? expenseDoc._id : null,
      partyName,
      category: category || (flowType.toUpperCase() === 'RECEIVED' ? 'Client Payment' : 'Vendor Payment'),
      amount: parseFloat(amount) || 0,
      paymentMode: paymentMode || 'Bank Transfer (NEFT)',
      referenceNo: referenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceRef: invoiceRef || (expenseDoc ? expenseDoc.invoiceBillNo || expenseDoc.description : ''),
      status: status || 'Cleared',
      date: date ? new Date(date) : new Date(),
      receiptUrl,
      notes: notes || '',
    });

    // Sync with Site Expenses:
    // 1. If linked to an existing Expense and flow is OUTGOING, recalculate its paid/pending/status
    if (expenseDoc && flowType.toUpperCase() === 'OUTGOING') {
      if (!expenseDoc.referenceNo) {
        expenseDoc.referenceNo = payment.referenceNo;
      }
      if (!expenseDoc.paymentMode) {
        expenseDoc.paymentMode = payment.paymentMode;
      }
      await expenseDoc.save();
      await recalculateExpensePaymentState(expenseDoc._id);
    } else if (
      !expenseDoc &&
      flowType.toUpperCase() === 'OUTGOING' &&
      siteDoc &&
      req.body.recordAsSiteExpense !== false &&
      req.body.recordAsSiteExpense !== 'false'
    ) {
      // 2. Direct outgoing payment for a site: auto-create matching Paid Site Expense so Site Expenses stays in sync
      const paidAmt = parseFloat(amount) || 0;
      const expCat = mapPaymentCategoryToExpenseCategory(category);
      const createdExp = await Expense.create({
        site: siteDoc._id,
        siteName: siteDoc.name,
        siteCode: siteDoc.code,
        category: expCat,
        subCategory: expCat,
        expenseType: 'NORMAL',
        isAdditionalWork: false,
        billableToClient: false,
        description: invoiceRef || notes || `${category || expCat} Payment (${partyName})`,
        supplierName: partyName || '-',
        amount: paidAmt,
        calculatedAmount: paidAmt,
        paymentStatus: 'Paid',
        paidAmount: paidAmt,
        pendingAmount: 0,
        paymentMode: payment.paymentMode,
        referenceNo: payment.referenceNo,
        invoiceBillNo: invoiceRef || '',
        receiptUrl,
        date: date ? new Date(date) : new Date(),
        notes: notes || 'Recorded via Payments Management',
      });
      payment.expense = createdExp._id;
      await payment.save();
    }

    res.status(201).json({
      success: true,
      message: `${flowType === 'RECEIVED' ? 'Client receipt' : 'Outgoing disbursement'} recorded successfully`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status (e.g. Cheque cleared)
// @route   PUT /api/payments/:id
// @access  Public
exports.updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const {
      status,
      referenceNo,
      paymentMode,
      notes,
      amount,
      partyName,
      category,
      invoiceRef,
      date,
      receiptUrl,
    } = req.body;

    const newAmount = amount !== undefined ? parseFloat(amount) : payment.amount;
    if (payment.expense && payment.flowType === 'OUTGOING' && amount !== undefined) {
      if (isNaN(newAmount) || newAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0.' });
      }
      const linkedExpense = await Expense.findById(payment.expense);
      if (linkedExpense) {
        const otherPayments = await Payment.find({
          expense: linkedExpense._id,
          _id: { $ne: payment._id },
          flowType: 'OUTGOING',
          status: { $in: ['Cleared', 'Paid'] },
        });
        const otherSum = otherPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        if (otherSum + newAmount > linkedExpense.amount) {
          return res.status(400).json({
            success: false,
            message: `Updated payment amount (₹${newAmount}) plus other payments (₹${otherSum}) exceeds expense total (₹${linkedExpense.amount}).`,
          });
        }
      }
    }

    if (partyName) payment.partyName = partyName;
    if (category) payment.category = category;
    if (status) payment.status = status;
    if (referenceNo !== undefined) payment.referenceNo = referenceNo;
    if (paymentMode) payment.paymentMode = paymentMode;
    if (invoiceRef !== undefined) payment.invoiceRef = invoiceRef;
    if (date) payment.date = new Date(date);
    if (notes !== undefined) payment.notes = notes;
    if (amount !== undefined) payment.amount = newAmount;
    if (receiptUrl !== undefined) payment.receiptUrl = receiptUrl;

    if (req.file) {
      payment.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    await payment.save();

    if (payment.expense && payment.flowType === 'OUTGOING') {
      await recalculateExpensePaymentState(payment.expense);
    }

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Public
exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const linkedExpenseId = payment.expense;
    const isOutgoing = payment.flowType === 'OUTGOING';

    await Payment.findByIdAndDelete(req.params.id);

    if (linkedExpenseId && isOutgoing) {
      await recalculateExpensePaymentState(linkedExpenseId);
    }

    res.status(200).json({
      success: true,
      message: 'Payment record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

