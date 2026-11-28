const DailyUpdate = require('../models/DailyUpdate');
const transactionalWrite = require('../utils/transactionalWrite');
const { isAdditionalWork, money, getClearedExpensePayments, sumPayments, recalculateExpensePaymentState } = require('../utils/expenseSync');
const Expense = require('../models/Expense');
const Site = require('../models/Site');
const Payment = require('../models/Payment');

// @desc    Get all expenses with comprehensive filters
// @route   GET /api/expenses
// @access  Public
exports.getExpenses = async (req, res, next) => {
  try {
    const { siteId, category, expenseType, isAdditionalWork, paymentStatus, search, startDate, endDate, limit = 100 } = req.query;
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const pageSize = page ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : parseInt(limit);
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

    const query = Expense.find(filter)
      .populate('site', 'name code location client')
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .limit(pageSize);
    if (page) query.skip((page - 1) * pageSize);
    const expenses = await query;
    const totalCount = page ? await Expense.countDocuments(filter) : undefined;

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalCount,
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
      if (isAdditionalWork(exp)) additionalWorkExpenses += amt;
      else if (cat === 'Materials') materialExpenses += amt;
      else if (cat === 'Labour') labourExpenses += amt;
      else if (cat === 'Rental' || cat === 'Vehicle Rent' || cat === 'Rent') rentalExpenses += amt;
    });

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: money(totalExpenses),
        paidAmount: money(paidAmount),
        pendingAmount: money(pendingAmount),
        additionalWorkExpenses: money(additionalWorkExpenses),
        materialExpenses: money(materialExpenses),
        labourExpenses: money(labourExpenses),
        rentalExpenses: money(rentalExpenses),
        normalContractExpenses: money(totalExpenses - additionalWorkExpenses),
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
exports.createExpense = transactionalWrite(async (req, res, next) => {
  try {
    let {
      siteId,
      category,
      description,
      supplierName,
      amount,
      paymentStatus = 'Paid',
      paidAmount,
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

    const submissionKey = typeof req.body.submissionKey === 'string' ? req.body.submissionKey.trim() : '';
    if (submissionKey) {
      const existing = await Expense.findOne({ site: site._id, submissionKey });
      if (existing) return res.status(200).json({ success: true, data: existing });
    }
    const billingNum = req.body.billingAmount !== undefined && req.body.billingAmount !== null && req.body.billingAmount !== ''
      ? parseFloat(req.body.billingAmount)
      : null;
    const calcNum = req.body.calculatedAmount !== undefined && req.body.calculatedAmount !== null && req.body.calculatedAmount !== ''
      ? parseFloat(req.body.calculatedAmount)
      : (parseFloat(amount) || 0);
    const isAddl = isAdditionalWork(req.body);
    const totalAmt = money(billingNum > 0 ? billingNum : Number(amount));
    if (totalAmt <= 0 || !Number.isFinite(totalAmt) || !['Paid', 'Pending', 'Partial'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Provide a positive expense amount and a valid payment status.' });
    }

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
      finalPaid = money(paidAmount);
      if (finalPaid <= 0 || finalPaid >= totalAmt) {
        return res.status(400).json({
          success: false,
          message: `Partial paid amount must be greater than 0 and less than total billing amount (₹${totalAmt}).`,
        });
      }
      finalPending = money(totalAmt - finalPaid);
    }

    // Parse & normalize multi-item breakdown if passed
    let parsedItems = [];
    if (items) {
      let rawItems = [];
      if (typeof items === 'string') {
        try {
          rawItems = JSON.parse(items);
        } catch (e) {
          rawItems = [];
        }
      } else if (Array.isArray(items)) {
        rawItems = items;
      }

      parsedItems = rawItems
        .filter((it) => it && typeof it === 'object')
        .map((it) => {
          const qty = Number(it.quantity ?? it.weight ?? it.length ?? 1) || 1;
          const amt = Number(it.amount ?? 0) || 0;
          const rt = Number(it.rate ?? (qty > 0 ? amt / qty : 0)) || 0;
          return {
            material: it.material && /^[0-9a-fA-F]{24}$/.test(String(it.material)) ? it.material : null,
            materialName: String(
              it.materialName ||
                it.material ||
                it.materialType ||
                it.steelType ||
                it.ringType ||
                it.sandType ||
                it.name ||
                'Material'
            ).trim(),
            quantity: qty,
            unit: String(it.unit || (it.weight ? 'Kg' : 'Units')).trim(),
            rate: rt,
            amount: amt,
          };
        });
    }

    // Receipt URL if file uploaded
    let receiptUrl = '';
    if (req.file) {
      receiptUrl = `/uploads/receipts/${req.file.filename}`;
    } else if (req.body.receiptUrl) {
      receiptUrl = req.body.receiptUrl;
    }

    const finalExpenseType = isAddl ? 'ADDITIONAL_WORK' : 'NORMAL';
    const billingApproval = req.body.billableToClient ?? req.body.additionalWorkClientApproved ?? isAddl;
    const finalBillable = billingApproval === true || billingApproval === 'true';

    const newExpense = await Expense.create({
      site: site._id,
      submissionKey: submissionKey || undefined,
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

    if (req.body.logDailyActivity === true) {
      await DailyUpdate.create({
        site: site._id,
        siteName: site.name,
        siteCode: site.code,
        expense: newExpense._id,
        title: `${category} Expense: ${description}`,
        description: `${description} (₹${totalAmt.toLocaleString('en-IN')})`,
        workPhase: category,
        workersCount: category === 'Labour' ? Number(req.body.quantity) || 0 : 0,
        date: newExpense.date,
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
});

// @desc    Update expense (e.g. mark pending bill as paid)
// @route   PUT /api/expenses/:id
// @access  Public
exports.updateExpense = transactionalWrite(async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    const {
      description,
      supplierName,
      amount,
      paymentStatus,
      paidAmount,
      paymentMode,
      referenceNo,
      notes,
      date,
    } = req.body;

    const clearedTotal = sumPayments(await getClearedExpensePayments(expense._id));
    const nextAmount = amount === undefined ? expense.amount : money(amount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Provide a positive expense amount.' });
    }

    const currentPaid = Math.max(clearedTotal, money(expense.paidAmount));
    const statusChanged = paymentStatus && paymentStatus !== expense.paymentStatus;
    const desiredPaid = paymentStatus === 'Paid'
      ? nextAmount
      : paymentStatus === 'Pending' ? 0 : paidAmount === undefined ? currentPaid : money(paidAmount);
    if (nextAmount < currentPaid || (statusChanged && desiredPaid < currentPaid) ||
        (paidAmount !== undefined && desiredPaid < currentPaid)) {
      return res.status(400).json({
        success: false,
        message: 'Adjust the linked payment in Payments before reducing the recorded paid amount or expense total.',
      });
    }
    if (!Number.isFinite(desiredPaid) || desiredPaid > nextAmount || (paymentStatus === 'Partial' && (desiredPaid <= 0 || desiredPaid >= nextAmount))) {
      return res.status(400).json({ success: false, message: 'Enter a valid paid amount for this expense.' });
    }

    if (description) expense.description = description;
    if (supplierName !== undefined) expense.supplierName = supplierName;
    expense.amount = nextAmount;
    if (paymentMode !== undefined) expense.paymentMode = paymentMode;
    if (referenceNo) expense.referenceNo = referenceNo;
    if (notes !== undefined) expense.notes = notes;
    if (date) expense.date = new Date(date);

    if (req.file) {
      expense.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    }

    const delta = money(desiredPaid - currentPaid);
    if (delta > 0) {
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

    await expense.save();
    // Retain older payment balances if there is missing historical ledger data.
    let updated = expense;
    if (currentPaid === clearedTotal) {
      updated = await recalculateExpensePaymentState(expense._id);
    } else {
      expense.paidAmount = desiredPaid;
      expense.pendingAmount = money(nextAmount - desiredPaid);
      expense.paymentStatus = desiredPaid === 0 ? 'Pending' : expense.pendingAmount === 0 ? 'Paid' : 'Partial';
      expense.increment();
      await expense.save();
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Public
exports.deleteExpense = transactionalWrite(async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    // Clean up any OUTGOING payment records linked to this deleted expense
    await Payment.deleteMany({ expense: expense._id });
    await DailyUpdate.deleteMany({ expense: expense._id });
    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

