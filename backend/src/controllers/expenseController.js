const Expense = require('../models/Expense');
const Site = require('../models/Site');

// @desc    Get all expenses with comprehensive filters
// @route   GET /api/expenses
// @access  Public
exports.getExpenses = async (req, res, next) => {
  try {
    const { siteId, category, paymentStatus, search, startDate, endDate, limit = 100 } = req.query;
    const filter = {};

    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
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
      paidAmount += exp.paidAmount || (exp.paymentStatus === 'Paid' ? amt : 0);
      pendingAmount += exp.pendingAmount || (exp.paymentStatus === 'Pending' ? amt : 0);

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

    const totalAmt = parseFloat(amount) || 0;
    let finalPaid = 0;
    let finalPending = 0;

    if (paymentStatus === 'Paid') {
      finalPaid = totalAmt;
      finalPending = 0;
    } else if (paymentStatus === 'Pending') {
      finalPaid = 0;
      finalPending = totalAmt;
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

    const newExpense = await Expense.create({
      site: site._id,
      siteName: site.name,
      siteCode: site.code,
      category,
      description,
      supplierName: supplierName || '-',
      amount: totalAmt,
      paymentStatus,
      paidAmount: finalPaid,
      pendingAmount: finalPending,
      paymentMode: paymentMode || 'Bank Transfer (NEFT)',
      referenceNo: referenceNo || `EXP-${Date.now().toString().slice(-6)}`,
      invoiceBillNo: invoiceBillNo || '',
      receiptUrl,
      date: date ? new Date(date) : new Date(),
      items: parsedItems,
      notes: notes || '',
    });

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

    if (category) expense.category = category;
    if (description) expense.description = description;
    if (supplierName !== undefined) expense.supplierName = supplierName;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (paymentMode) expense.paymentMode = paymentMode;
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
      } else {
        if (paidAmount !== undefined) expense.paidAmount = parseFloat(paidAmount);
        if (pendingAmount !== undefined) expense.pendingAmount = parseFloat(pendingAmount);
      }
    }

    if (req.file) {
      expense.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    await expense.save();

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

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

