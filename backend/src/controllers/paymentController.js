const { isObjectIdOrHexString } = require('mongoose');
const transactionalWrite = require('../utils/transactionalWrite');
const Payment = require('../models/Payment');
const Site = require('../models/Site');
const Expense = require('../models/Expense');
const {
  CLEARED_PAYMENT_STATUSES,
  getClearedExpensePayments,
  sumPayments,
  money,
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
      .sort({ date: -1, createdAt: -1, _id: -1 });

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
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const pageSize = page ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : parseInt(limit);
    const filter = {};

    if (flowType && flowType !== 'All') {
      filter.flowType = flow;
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

    const query = Payment.find(filter)
      .populate('site', 'name code location client')
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .limit(pageSize);
    if (page) query.skip((page - 1) * pageSize);
    const payments = await query;
    const totalCount = page ? await Payment.countDocuments(filter) : undefined;

    res.status(200).json({
      success: true,
      count: payments.length,
      totalCount,
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
        if (CLEARED_PAYMENT_STATUSES.includes(p.status)) {
          totalReceived += amt;
        } else {
          pendingReceived += amt;
        }
      } else if (p.flowType === 'OUTGOING') {
        if (CLEARED_PAYMENT_STATUSES.includes(p.status)) {
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
        totalReceived: money(totalReceived),
        totalOutgoing: money(totalOutgoing),
        netBalance: money(netBalance),
        pendingReceived: money(pendingReceived),
        pendingOutgoing: money(pendingOutgoing),
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
exports.createPayment = transactionalWrite(async (req, res, next) => {
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

    const flow = typeof flowType === 'string' ? flowType.toUpperCase() : '';
    const paymentAmount = money(amount);
    const paymentStatus = status || 'Cleared';
    if (!['RECEIVED', 'OUTGOING'].includes(flow) || !partyName || paymentAmount <= 0 || !Number.isFinite(paymentAmount)) {
      return res.status(400).json({
        success: false,
        message: 'Provide a payment type, party name, and positive amount.',
      });
    }

    let siteDoc = null;
    let siteName = req.body.siteName || '';
    let siteCode = req.body.siteCode || '';

    const targetSiteId = siteId || req.body.site;
    if (targetSiteId) {
      if (!isObjectIdOrHexString(targetSiteId)) {
        return res.status(400).json({ success: false, message: 'Select a valid construction site.' });
      }
      siteDoc = await Site.findById(targetSiteId);
      if (!siteDoc) return res.status(404).json({ success: false, message: 'Site not found.' });
    }
    if (!siteDoc && (siteCode || siteName)) {
      const cleanName = String(siteName || '').split(' (')[0].trim();
      const extractedCode = siteCode || (String(siteName || '').match(/\(([^)]+)\)/)?.[1] || '').trim();
      if (extractedCode) {
        siteDoc = await Site.findOne({ code: extractedCode.toUpperCase() });
      }
      if (!siteDoc && cleanName) {
        siteDoc = await Site.findOne({ name: cleanName });
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
    let historicalPaid = 0;
    if (targetExpenseId) {
      if (flow !== 'OUTGOING' || !isObjectIdOrHexString(targetExpenseId)) {
        return res.status(400).json({ success: false, message: 'Only outgoing payments can settle a valid expense.' });
      }
      expenseDoc = await Expense.findById(targetExpenseId);
      if (!expenseDoc) return res.status(404).json({ success: false, message: 'Expense not found.' });
      if (siteDoc && String(siteDoc._id) !== String(expenseDoc.site)) {
        return res.status(400).json({ success: false, message: 'This expense belongs to a different site.' });
      }
      if (!siteDoc) siteDoc = await Site.findById(expenseDoc.site);
      if (!siteDoc) return res.status(404).json({ success: false, message: 'The expense site no longer exists.' });
      siteName = siteDoc.name;
      siteCode = siteDoc.code;

      const clearedTotal = sumPayments(await getClearedExpensePayments(expenseDoc._id));
      historicalPaid = Math.max(0, money(expenseDoc.paidAmount - clearedTotal));
      const outstanding = money(expenseDoc.amount - clearedTotal - historicalPaid);
      if (paymentAmount > outstanding) {
        return res.status(400).json({ success: false, message: 'Payment amount exceeds the expense balance.' });
      }
    }

    const payment = await Payment.create({
      flowType: flow,
      site: siteDoc ? siteDoc._id : null,
      siteName,
      siteCode,
      expense: expenseDoc ? expenseDoc._id : null,
      partyName,
      category: category || (flow === 'RECEIVED' ? 'Client Payment' : 'Vendor Payment'),
      amount: paymentAmount,
      paymentMode: paymentMode || 'Bank Transfer (NEFT)',
      referenceNo: referenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceRef: invoiceRef || (expenseDoc ? expenseDoc.invoiceBillNo || expenseDoc.description : ''),
      status: paymentStatus,
      date: date ? new Date(date) : new Date(),
      receiptUrl,
      notes: notes || '',
    });

    // Sync with Site Expenses:
    // 1. If linked to an existing Expense and flow is OUTGOING, recalculate its paid/pending/status
    if (expenseDoc && flow === 'OUTGOING') {
      await recalculateExpensePaymentState(expenseDoc._id, historicalPaid);
    } else if (
      !expenseDoc &&
      flow === 'OUTGOING' &&
      siteDoc &&
      req.body.recordAsSiteExpense !== false &&
      req.body.recordAsSiteExpense !== 'false'
    ) {
      // 2. Direct outgoing payments can create a matching site expense.
      const cleared = CLEARED_PAYMENT_STATUSES.includes(paymentStatus);
      const expCat = mapPaymentCategoryToExpenseCategory(category);
      const createdExp = await Expense.create({
        site: siteDoc._id,
        siteName: siteDoc.name,
        siteCode: siteDoc.code,
        category: expCat,
        subCategory: expCat,
        expenseType: expCat === 'Additional Work' ? 'ADDITIONAL_WORK' : 'NORMAL',
        isAdditionalWork: expCat === 'Additional Work',
        billableToClient: false,
        description: invoiceRef || notes || `${category || expCat} Payment (${partyName})`,
        supplierName: partyName || '-',
        amount: paymentAmount,
        calculatedAmount: paymentAmount,
        paymentStatus: cleared ? 'Paid' : 'Pending',
        paidAmount: cleared ? paymentAmount : 0,
        pendingAmount: cleared ? 0 : paymentAmount,
        paymentMode: cleared ? payment.paymentMode : '',
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
      message: `${flow === 'RECEIVED' ? 'Client receipt' : 'Outgoing disbursement'} recorded successfully`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update payment status (e.g. Cheque cleared)
// @route   PUT /api/payments/:id
// @access  Public
exports.updatePayment = transactionalWrite(async (req, res, next) => {
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

    const newAmount = amount === undefined ? payment.amount : money(amount);
    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than 0.' });
    }

    let historicalPaid = 0;
    if (payment.expense && payment.flowType === 'OUTGOING') {
      const linkedExpense = await Expense.findById(payment.expense);
      if (!linkedExpense) {
        return res.status(404).json({ success: false, message: 'The linked expense no longer exists.' });
      }
      if (String(payment.site) !== String(linkedExpense.site)) {
        return res.status(400).json({ success: false, message: 'The payment and its linked expense belong to different sites.' });
      }
      const otherTotal = sumPayments(await getClearedExpensePayments(linkedExpense._id, payment._id));
      const previousClearedAmount = CLEARED_PAYMENT_STATUSES.includes(payment.status) ? payment.amount : 0;
      historicalPaid = Math.max(0, money(linkedExpense.paidAmount - otherTotal - previousClearedAmount));
      if (CLEARED_PAYMENT_STATUSES.includes(status || payment.status) &&
          money(otherTotal + historicalPaid + newAmount) > money(linkedExpense.amount)) {
        return res.status(400).json({ success: false, message: 'This payment would exceed the expense total.' });
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
      await recalculateExpensePaymentState(payment.expense, historicalPaid);
    }

    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Public
exports.deletePayment = transactionalWrite(async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const linkedExpenseId = payment.expense;
    const isOutgoing = payment.flowType === 'OUTGOING';

    let historicalPaid = 0;
    if (linkedExpenseId && isOutgoing) {
      const expense = await Expense.findById(linkedExpenseId);
      if (expense) {
        const clearedTotal = sumPayments(await getClearedExpensePayments(linkedExpenseId));
        historicalPaid = Math.max(0, money(expense.paidAmount - clearedTotal));
      }
    }
    await Payment.findByIdAndDelete(req.params.id);

    if (linkedExpenseId && isOutgoing) {
      await recalculateExpensePaymentState(linkedExpenseId, historicalPaid);
    }

    res.status(200).json({
      success: true,
      message: 'Payment record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

