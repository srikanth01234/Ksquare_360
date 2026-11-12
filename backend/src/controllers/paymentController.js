const Payment = require('../models/Payment');
const Site = require('../models/Site');
const Expense = require('../models/Expense');

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
      if (siteDoc) {
        siteName = siteDoc.name;
        siteCode = siteDoc.code;
      }
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

    // If linked to an Expense and flow is OUTGOING, update the Expense's paid/pending status
    if (expenseDoc && flowType.toUpperCase() === 'OUTGOING') {
      const paidAmt = parseFloat(amount) || 0;
      expenseDoc.paidAmount = (expenseDoc.paidAmount || 0) + paidAmt;
      expenseDoc.pendingAmount = Math.max(0, (expenseDoc.amount || 0) - expenseDoc.paidAmount);
      if (expenseDoc.pendingAmount <= 0) {
        expenseDoc.paymentStatus = 'Paid';
      } else {
        expenseDoc.paymentStatus = 'Partial';
      }
      if (!expenseDoc.referenceNo) {
        expenseDoc.referenceNo = payment.referenceNo;
      }
      if (!expenseDoc.paymentMode) {
        expenseDoc.paymentMode = payment.paymentMode;
      }
      await expenseDoc.save();
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

    const { status, referenceNo, paymentMode, notes, amount } = req.body;

    if (status) payment.status = status;
    if (referenceNo) payment.referenceNo = referenceNo;
    if (paymentMode) payment.paymentMode = paymentMode;
    if (notes !== undefined) payment.notes = notes;
    if (amount !== undefined) payment.amount = parseFloat(amount);

    if (req.file) {
      payment.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    await payment.save();

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

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

