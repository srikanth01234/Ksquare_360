const Invoice = require('../models/Invoice');
const Site = require('../models/Site');

// @desc    Get all client invoices with filters
// @route   GET /api/invoices
// @access  Public
exports.getInvoices = async (req, res, next) => {
  try {
    const { siteId, status, search, limit = 50 } = req.query;
    const filter = {};

    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }

    if (status && status !== 'All Status' && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { siteName: { $regex: search, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(filter)
      .populate('site', 'name code location client')
      .sort({ issueDate: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get summary metrics for Billing & Invoices page
// @route   GET /api/invoices/summary
// @access  Public
exports.getInvoiceSummary = async (req, res, next) => {
  try {
    const { siteId } = req.query;
    const filter = {};
    if (siteId && siteId !== 'All Sites') {
      filter.site = siteId;
    }

    const invoices = await Invoice.find(filter);

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let overdueCount = 0;

    const now = new Date();

    invoices.forEach((inv) => {
      totalInvoiced += inv.totalAmount || 0;
      totalPaid += inv.paidAmount || 0;
      totalOutstanding += inv.balanceDue || (inv.totalAmount - inv.paidAmount);

      if (inv.status === 'Overdue' || (inv.status !== 'Paid' && inv.dueDate && new Date(inv.dueDate) < now)) {
        overdueCount++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalInvoiced: Math.round(totalInvoiced),
        totalPaid: Math.round(totalPaid),
        totalOutstanding: Math.round(totalOutstanding),
        overdueCount,
        invoiceCount: invoices.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new client GST invoice
// @route   POST /api/invoices
// @access  Public
exports.createInvoice = async (req, res, next) => {
  try {
    let {
      invoiceNumber,
      siteId,
      clientName,
      clientAddress,
      clientPhone,
      clientGstin,
      issueDate,
      dueDate,
      items = [],
      cgstRate = 9,
      sgstRate = 9,
      status = 'Sent',
      paidAmount = 0,
      notes,
      terms,
    } = req.body;

    if (!siteId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide siteId and at least one invoice line item',
      });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Construction site not found' });
    }

    // Auto-generate invoice number if missing
    if (!invoiceNumber) {
      const count = await Invoice.countDocuments();
      const year = new Date().getFullYear();
      invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, '0')}`;
    }

    // Calculate subtotal
    let subtotal = 0;
    const computedItems = items.map((it) => {
      const q = parseFloat(it.quantity) || 1;
      const r = parseFloat(it.rate) || 0;
      const amt = q * r;
      subtotal += amt;
      return {
        description: it.description,
        quantity: q,
        unit: it.unit || 'Lot',
        rate: r,
        amount: amt,
      };
    });

    // Compute GST
    const cgstAmt = Math.round(subtotal * (parseFloat(cgstRate) / 100));
    const sgstAmt = Math.round(subtotal * (parseFloat(sgstRate) / 100));
    const totalAmount = subtotal + cgstAmt + sgstAmt;
    const initialPaid = parseFloat(paidAmount) || 0;
    const balanceDue = Math.max(0, totalAmount - initialPaid);

    const invoice = await Invoice.create({
      invoiceNumber: invoiceNumber.toUpperCase(),
      site: site._id,
      siteName: site.name,
      siteCode: site.code,
      clientName: clientName || site.client,
      clientAddress: clientAddress || site.location,
      clientPhone: clientPhone || site.contact,
      clientGstin: clientGstin || '',
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      items: computedItems,
      subtotal,
      cgstRate: parseFloat(cgstRate),
      cgstAmount: cgstAmt,
      sgstRate: parseFloat(sgstRate),
      sgstAmount: sgstAmt,
      totalAmount,
      status: initialPaid >= totalAmount ? 'Paid' : status,
      paidAmount: initialPaid,
      balanceDue,
      notes: notes || 'Thank you for your business.',
      terms: terms || 'Payment due within 15 days.',
    });

    res.status(201).json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} created successfully`,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Public
exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('site');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice (e.g. record payment against invoice)
// @route   PUT /api/invoices/:id
// @access  Public
exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const { status, paidAmount, notes, dueDate } = req.body;

    if (status) invoice.status = status;
    if (notes) invoice.notes = notes;
    if (dueDate) invoice.dueDate = new Date(dueDate);

    if (paidAmount !== undefined) {
      invoice.paidAmount = parseFloat(paidAmount);
      invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
      if (invoice.balanceDue === 0) {
        invoice.status = 'Paid';
      }
    }

    await invoice.save();

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Public
exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await Invoice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

