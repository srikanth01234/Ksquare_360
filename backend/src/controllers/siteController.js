const Site = require('../models/Site');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const DailyUpdate = require('../models/DailyUpdate');
const { generateSiteCode } = require('../utils/codeGenerator');

/**
 * Helper to compute unified financial metrics for a site
 */
async function computeSiteFinancials(siteId, projectBudget = 0) {
  // 1. Aggregate Site Expenses by Category
  const expenses = await Expense.find({ site: siteId });

  let materialsExpense = 0;
  let labourExpense = 0;
  let rentalExpense = 0;
  let additionalWorkExpense = 0;
  let otherExpense = 0;

  expenses.forEach((exp) => {
    const amt = exp.amount || 0;
    const cat = exp.category || 'Other';

    if (cat === 'Materials') {
      materialsExpense += amt;
    } else if (cat === 'Labour') {
      labourExpense += amt;
    } else if (cat === 'Rental' || cat === 'Vehicle Rent' || cat === 'Rent') {
      rentalExpense += amt;
    } else if (cat === 'Additional Work') {
      additionalWorkExpense += amt;
    } else {
      otherExpense += amt;
    }
  });

  const totalExpenses = materialsExpense + labourExpense + rentalExpense + additionalWorkExpense + otherExpense;

  // 2. Aggregate Client Payments (FlowType = RECEIVED)
  const clientPayments = await Payment.find({
    site: siteId,
    flowType: 'RECEIVED',
    status: { $in: ['Cleared', 'Paid'] },
  });

  const clientPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // 3. Excess Amount (Client Paid - Total Expenses Spent)
  const excessAmount = clientPaid - totalExpenses;

  // 4. Client Pending Contract Balance
  const clientPending = Math.max(0, projectBudget - clientPaid);

  // 5. Percentages for visual meters
  const cashSpentPct = clientPaid > 0 ? Math.min(100, Math.round((totalExpenses / clientPaid) * 100)) : 0;
  const excessPct = clientPaid > 0 ? Math.max(0, 100 - cashSpentPct) : 0;
  const budgetSpentPct = projectBudget > 0 ? Math.min(100, Math.round((totalExpenses / projectBudget) * 100)) : 0;

  return {
    materialsExpense,
    labourExpense,
    rentalExpense,
    additionalWorkExpense,
    otherExpense,
    totalExpenses,
    clientPaid,
    excessAmount,
    clientPending,
    projectBudget,
    cashSpentPct,
    excessPct,
    budgetSpentPct,
    isSurplus: excessAmount >= 0,
  };
}

// @desc    Get all sites with calculated financial stats
// @route   GET /api/sites
// @access  Public
exports.getSites = async (req, res, next) => {
  try {
    const { status, city, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (city && city !== 'All Cities') {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
      ];
    }

    const sites = await Site.find(filter).sort({ createdAt: -1 });

    // Compute financial summaries for each site card
    const enrichedSites = await Promise.all(
      sites.map(async (s) => {
        const financials = await computeSiteFinancials(s._id, s.projectBudget);
        return {
          ...s.toObject(),
          financials,
        };
      })
    );

    // High-level portfolio aggregates
    let portfolioBudget = 0;
    let portfolioSpent = 0;
    let portfolioReceived = 0;
    let portfolioExcess = 0;

    enrichedSites.forEach((s) => {
      portfolioBudget += s.financials.projectBudget;
      portfolioSpent += s.financials.totalExpenses;
      portfolioReceived += s.financials.clientPaid;
      portfolioExcess += s.financials.excessAmount;
    });

    res.status(200).json({
      success: true,
      count: enrichedSites.length,
      portfolioStats: {
        totalSites: enrichedSites.length,
        portfolioBudget,
        portfolioSpent,
        portfolioReceived,
        portfolioExcess,
      },
      data: enrichedSites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single site with full detail & unified cash flow figures
// @route   GET /api/sites/:id
// @access  Public
exports.getSiteById = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    const financials = await computeSiteFinancials(site._id, site.projectBudget);

    // Fetch recent 5 expenses for the site
    const recentExpenses = await Expense.find({ site: site._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Fetch recent client payments
    const recentPayments = await Payment.find({ site: site._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // Fetch recent daily updates/activities
    const recentUpdates = await DailyUpdate.find({ site: site._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    const recentActivities = recentUpdates.map((u) => ({
      id: u._id,
      title: `${u.workPhase || 'Update'}: ${u.title || u.description}`,
      time: u.date ? new Date(u.date).toLocaleDateString('en-IN') : 'Recent',
      color: 'bg-emerald-500',
    }));

    res.status(200).json({
      success: true,
      data: {
        ...site.toObject(),
        financials,
        recentExpenses,
        recentPayments,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new site (auto-generates standard code format CHN-11-2026-NB-01)
// @route   POST /api/sites
// @access  Public
exports.createSite = async (req, res, next) => {
  try {
    const { name, client, contact, location, city, type, projectBudget, startDate, expectedDate, photoUrl } = req.body;

    if (!name || !client) {
      return res.status(400).json({
        success: false,
        message: 'Site name and client name are required',
      });
    }

    const siteCity = city || (location ? location.split(',')[0].trim() : 'Chennai');
    const siteType = type || 'New Building';

    // Auto-generate code using standard format: [CITY]-[MM]-[YYYY]-[CATEGORY]-[RUNNING_NO]
    let code = req.body.code;
    if (!code) {
      code = await generateSiteCode(siteCity, siteType, startDate || new Date());
    }

    // Double check unique code
    const existing = await Site.findOne({ code });
    if (existing) {
      code = await generateSiteCode(siteCity, siteType, new Date());
    }

    const newSite = await Site.create({
      name,
      code,
      type: siteType,
      category: siteType.toLowerCase().includes('reno') ? 'RE' : 'NB',
      status: req.body.status || 'Active',
      client,
      contact: contact || '',
      location: location || `${siteCity}, TN`,
      city: siteCity,
      startDate: startDate ? new Date(startDate) : new Date(),
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      projectBudget: parseFloat(projectBudget) || 0,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    });

    const financials = await computeSiteFinancials(newSite._id, newSite.projectBudget);

    res.status(201).json({
      success: true,
      message: `Site ${newSite.name} created successfully with code ${newSite.code}`,
      data: {
        ...newSite.toObject(),
        financials,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update site details or status (Active, Completed, On Hold)
// @route   PUT /api/sites/:id
// @access  Public
exports.updateSite = async (req, res, next) => {
  try {
    const { name, client, contact, location, city, type, status, projectBudget, startDate, expectedDate, photoUrl } = req.body;

    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    if (name) site.name = name;
    if (client) site.client = client;
    if (contact !== undefined) site.contact = contact;
    if (location !== undefined) site.location = location;
    if (city !== undefined) site.city = city;
    if (type !== undefined) site.type = type;
    if (status !== undefined) site.status = status;
    if (projectBudget !== undefined) site.projectBudget = parseFloat(projectBudget) || 0;
    if (startDate) site.startDate = new Date(startDate);
    if (expectedDate) site.expectedDate = new Date(expectedDate);
    if (photoUrl !== undefined) site.photoUrl = photoUrl;

    await site.save();

    const financials = await computeSiteFinancials(site._id, site.projectBudget);

    res.status(200).json({
      success: true,
      message: 'Site details updated successfully',
      data: {
        ...site.toObject(),
        financials,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete site
// @route   DELETE /api/sites/:id
// @access  Public
exports.deleteSite = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    // Check if expenses exist for this site
    const expCount = await Expense.countDocuments({ site: site._id });
    if (expCount > 0) {
      site.status = 'Completed';
      await site.save();
      return res.status(200).json({
        success: true,
        message: 'Site has recorded expenses; marked as Completed to preserve audit records',
        data: site,
      });
    }

    await Site.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Site deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

