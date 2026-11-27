const Expense = require('../models/Expense');
const Site = require('../models/Site');
const Payment = require('../models/Payment');

// @desc    Get all expenses with comprehensive filters
// @route   GET /api/expenses
// @access  Public
exports.getExpenses = async (req, res, next) => {
  try {
    const { siteId, category, expenseType, isAdditionalWork, paymentStatus, search, startDate, endDate, limit = 100 } = req.query;
    const filter = {};

    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }

    if (expenseType) {
      filter.expenseType = expenseType;
    } else if (isAdditionalWork !== undefined) {
      filter.isAdditionalWork = isAdditionalWork === 'true' || isAdditionalWork === true;
    }

    if (category && category !== 'All Expenses' && category !== 'All Categories') {
      if (category === 'Other Expenses' || category === 'Other') {
        filter.category = 'Other';
      } else if (category === 'Rent' || category === 'Vehicle Rent') {
        filter.category = { $in: ['Rental', 'Vehicle Rent', 'Rent'] };
      } else {
        filter.category = category;
      }
    }

    if (paymentStatus && paymentStatus !== 'All Payment Status' && paymentStatus !== 'All') {
      filter.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { siteName: { $regex: search, $options: 'i' } },
        { referenceNo: { $regex: search, $options: 'i' } },
      ];
    }

    const expenses = await Expense.find(filter)
      .populate('site', 'name code location client')
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get financial summary metrics for top cards
// @route   GET /api/expenses/summary
// @access  Public
exports.getExpenseSummary = async (req, res, next) => {
  try {
    const { siteId } = req.query;
    const filter = {};

    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }

    const expenses = await Expense.find(filter);

    let totalExpenses = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let additionalWorkExpenses = 0;
    let materialExpenses = 0;
    let labourExpenses = 0;
    let rentalExpenses = 0;

    expenses.forEach((exp) => {
      const amt = exp.amount || 0;
      totalExpenses += amt;
      if (exp.paymentStatus === 'Paid') {
        paidAmount += exp.paidAmount !== undefined && exp.paidAmount > 0 ? exp.paidAmount : amt;
      } else if (exp.paymentStatus === 'Partial') {
        const paid = exp.paidAmount || 0;
        const pend = exp.pendingAmount !== undefined ? exp.pendingAmount : Math.max(0, amt - paid);
        paidAmount += paid;
        pendingAmount += pend;
      } else {
        pendingAmount += exp.pendingAmount !== undefined && exp.pendingAmount > 0 ? exp.pendingAmount : amt;
      }

      const cat = exp.category;
      if (cat === 'Materials') materialExpenses += amt;
      else if (cat === 'Labour') labourExpenses += amt;
      else if (cat === 'Rental' || cat === 'Vehicle Rent' || cat === 'Rent') rentalExpenses += amt;
      else if (cat === 'Additional Work') additionalWorkExpenses += amt;
    });

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: Math.round(totalExpenses),
        paidAmount: Math.round(paidAmount),
        pendingAmount: Math.round(pendingAmount),
        additionalWorkExpenses: Math.round(additionalWorkExpenses),
        materialExpenses: Math.round(materialExpenses),
        labourExpenses: Math.round(labourExpenses),
        rentalExpenses: Math.round(rentalExpenses),
        totalCount: expenses.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense with multi-item breakdown
// @route   GET /api/expenses/:id
// @access  Public
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('site');
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense (supports multi-item breakdown and receipt upload)
// @route   POST /api/expenses
// @access  Public
exports.createExpense = async (req, res, next) => {
  try {
    let {
      siteId,
      category,
      description,
      supplierName,
      amount,
      paymentStatus = 'Paid',
      paidAmount,
      pendingAmount,
      paymentMode,
      referenceNo,
      invoiceBillNo,
      date,
      items,
      notes,
    } = req.body;

    const targetSiteId = siteId || req.body.site;
    if (!targetSiteId || !category || !description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide siteId, category, description, and amount',
      });
    }

    const site = await Site.findById(targetSiteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    const billingNum = req.body.billingAmount !== undefined && req.body.billingAmount !== null && req.body.billingAmount !== ''
      ? parseFloat(req.body.billingAmount)
      : null;
    const calcNum = req.body.calculatedAmount !== undefined && req.body.calculatedAmount !== null && req.body.calculatedAmount !== ''
      ? parseFloat(req.body.calculatedAmount)
      : (parseFloat(amount) || 0);
    const totalAmt = billingNum !== null && billingNum > 0 ? billingNum : (parseFloat(amount) || 0);

    let finalPaid = 0;
    let finalPending = 0;
    let finalPaymentMode = paymentMode || 'Cash';

    if (paymentStatus === 'Paid') {
      finalPaid = totalAmt;
      finalPending = 0;
    } else if (paymentStatus === 'Pending') {
      finalPaid = 0;
      finalPending = totalAmt;
      finalPaymentMode = '';
    } else if (paymentStatus === 'Partial') {
      finalPaid = parseFloat(paidAmount) || 0;
      if (finalPaid <= 0 || finalPaid >= totalAmt) {
        return res.status(400).json({
          success: false,
          message: `Partial paid amount must be greater than 0 and less than total billing amount (₹${totalAmt}).`,
        });
      }
      finalPending = Math.max(0, totalAmt - finalPaid);
    } else {
      finalPaid = parseFloat(paidAmount) || 0;
      finalPending = parseFloat(pendingAmount) || Math.max(0, totalAmt - finalPaid);
    }

    // Parse multi-item breakdown if passed as JSON string
    let parsedItems = [];
    if (items) {
      if (typeof items === 'string') {
        try {
          parsedItems = JSON.parse(items);
        } catch (e) {
          parsedItems = [];
        }
      } else if (Array.isArray(items)) {
        parsedItems = items;
      }
    }

    // Receipt URL if file uploaded
    let receiptUrl = '';
    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
    } else if (req.body.receiptUrl) {
      receiptUrl = req.body.receiptUrl;
    }

    const isAddl = category === 'Additional Work' || req.body.isAdditionalWork === true || req.body.expenseType === 'ADDITIONAL_WORK';
    const finalExpenseType = isAddl ? 'ADDITIONAL_WORK' : 'NORMAL';
    const finalBillable = Boolean(req.body.billableToClient ?? req.body.additionalWorkClientApproved ?? isAddl);

    const newExpense = await Expense.create({
      site: site._id,
      siteName: site.name,
      siteCode: site.code,
      category,
      subCategory: req.body.subCategory || '',
      expenseType: finalExpenseType,
      isAdditionalWork: isAddl,
      billableToClient: finalBillable,
      description,
      supplierName: supplierName || '-',
      amount: totalAmt,
      calculatedAmount: calcNum,
      billingAmount: billingNum,
      labourDetails: req.body.labourDetails || null,
      paymentStatus,
      paidAmount: finalPaid,
      pendingAmount: finalPending,
      paymentMode: finalPaymentMode,
      referenceNo: referenceNo || `EXP-${Date.now().toString().slice(-6)}`,
      invoiceBillNo: invoiceBillNo || '',
      receiptUrl,
      date: date ? new Date(date) : new Date(),
      items: parsedItems,
      notes: notes || '',
    });

    // Synchronize initial payment (Paid or Partial) with Payments ledger
    if (finalPaid > 0) {
      await Payment.create({
        flowType: 'OUTGOING',
        site: site._id,
        siteName: site.name,
        siteCode: site.code,
        expense: newExpense._id,
        partyName: supplierName && supplierName !== '-' ? supplierName : description,
        category:
          category === 'Materials'
            ? 'Materials'
            : category === 'Labour'
            ? 'Labour Wages'
            : category === 'Rental' || category === 'Vehicle Rent'
            ? 'Machinery Rental'
            : 'Other',
        amount: finalPaid,
        paymentMode: finalPaymentMode || 'Cash',
        referenceNo: newExpense.referenceNo,
        invoiceRef: invoiceBillNo || description,
        status: 'Cleared',
        date: date ? new Date(date) : new Date(),
        notes: paymentStatus === 'Partial' ? `Initial partial payment for: ${description}` : `Full payment for: ${description}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: newExpense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense (e.g. mark pending bill as paid)
// @route   PUT /api/expenses/:id
// @access  Public
exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    const {
      category,
      description,
      supplierName,
      amount,
      paymentStatus,
      paidAmount,
      pendingAmount,
      paymentMode,
      referenceNo,
      notes,
    } = req.body;

    const prevPaid = Number(expense.paidAmount) || 0;

    if (category) expense.category = category;
    if (description) expense.description = description;
    if (supplierName !== undefined) expense.supplierName = supplierName;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (paymentMode !== undefined) expense.paymentMode = paymentMode;
    if (referenceNo) expense.referenceNo = referenceNo;
    if (notes !== undefined) expense.notes = notes;

    if (paymentStatus) {
      expense.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        expense.paidAmount = expense.amount;
        expense.pendingAmount = 0;
      } else if (paymentStatus === 'Pending') {
        expense.paidAmount = 0;
        expense.pendingAmount = expense.amount;
        expense.paymentMode = '';
      } else {
        if (paidAmount !== undefined) expense.paidAmount = parseFloat(paidAmount);
        if (pendingAmount !== undefined) {
          expense.pendingAmount = parseFloat(pendingAmount);
        } else {
          expense.pendingAmount = Math.max(0, expense.amount - (expense.paidAmount || 0));
        }
      }
    }

    if (req.file) {
      expense.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    await expense.save();

    // Synchronize Payments ledger when expense payment status/amount changes via Edit
    const newPaid = Number(expense.paidAmount) || 0;
    if (newPaid === 0) {
      await Payment.deleteMany({ expense: expense._id, flowType: 'OUTGOING' });
    } else if (newPaid > prevPaid) {
      const delta = newPaid - prevPaid;
      await Payment.create({
        flowType: 'OUTGOING',
        site: expense.site,
        siteName: expense.siteName,
        siteCode: expense.siteCode,
        expense: expense._id,
        partyName: expense.supplierName && expense.supplierName !== '-' ? expense.supplierName : expense.description,
        category:
          expense.category === 'Materials'
            ? 'Materials'
            : expense.category === 'Labour'
            ? 'Labour Wages'
            : expense.category === 'Rental' || expense.category === 'Vehicle Rent'
            ? 'Machinery Rental'
            : 'Other',
        amount: delta,
        paymentMode: expense.paymentMode || 'Cash',
        referenceNo: expense.referenceNo || `EXP-${Date.now().toString().slice(-6)}`,
        invoiceRef: expense.invoiceBillNo || expense.description,
        status: 'Cleared',
        date: new Date(),
        notes: `Updated expense payment for: ${expense.description}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Public
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Clean up any OUTGOING payment records linked to this deleted expense
    await Payment.deleteMany({ expense: expense._id });
    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

