const getSiteProgress = require('../utils/siteProgress');
const DailyUpdate = require('../models/DailyUpdate');
const Site = require('../models/Site');

// @desc    Get sites overview for Daily Updates cards
// @route   GET /api/daily-updates/sites-overview
// @access  Public
exports.getSitesOverview = async (req, res, next) => {
  try {
    const sites = await Site.find().sort({ createdAt: -1 });

    const enriched = await Promise.all(
      sites.map(async (s) => {
        const latest = await DailyUpdate.findOne({ site: s._id }).sort({ date: -1, createdAt: -1, _id: -1 });
        const count = await DailyUpdate.countDocuments({ site: s._id });

        return {
          _id: s._id,
          name: s.name,
          code: s.code,
          status: s.status,
          progress: await getSiteProgress(s),
          client: s.client,
          location: s.location,
          photoUrl: s.photoUrl,
          totalUpdatesCount: count,
          lastUpdated: latest ? latest.date : s.startDate,
          latestPhase: latest ? latest.workPhase : 'Site Mobilization',
          latestWorkersCount: latest ? latest.workersCount : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily updates for a specific site
// @route   GET /api/daily-updates
// @access  Public
exports.getDailyUpdates = async (req, res, next) => {
  try {
    const { siteId, workPhase, limit = 50 } = req.query;
    const page = Math.max(0, parseInt(req.query.page, 10) || 0);
    const pageSize = page ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : parseInt(limit);
    const filter = {};

    if (siteId) {
      filter.site = siteId;
    }

    if (workPhase && workPhase !== 'All') {
      filter.workPhase = workPhase;
    }

    const query = DailyUpdate.find(filter)
      .populate('site', 'name code location client')
      .sort({ date: -1, createdAt: -1, _id: -1 })
      .limit(pageSize);
    if (page) query.skip((page - 1) * pageSize);
    const updates = await query;
    const totalCount = page ? await DailyUpdate.countDocuments(filter) : undefined;

    res.status(200).json({
      success: true,
      count: updates.length,
      totalCount,
      data: updates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record new daily progress update with photo attachments
// @route   POST /api/daily-updates
// @access  Public
exports.createDailyUpdate = async (req, res, next) => {
  try {
    const {
      siteId, title, description, workPhase, workersCount, weather, supervisorName, date, notes, materialsUsed,
    } = req.body;
    const inputProgress = req.body.progress;
    const progress = inputProgress == null || inputProgress === '' ? undefined : Number(inputProgress);
    if (progress !== undefined && (!Number.isFinite(progress) || progress < 0 || progress > 100)) {
      return res.status(400).json({ success: false, message: 'Progress must be between 0 and 100.' });
    }

    if (!siteId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide siteId, title, and description for the daily update',
      });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Construction site not found' });
    }

    // Process uploaded photo attachments
    const photos = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        photos.push(`/uploads/receipts/${file.filename}`);
      });
    } else if (req.body.photos) {
      if (Array.isArray(req.body.photos)) {
        photos.push(...req.body.photos);
      } else if (typeof req.body.photos === 'string') {
        photos.push(req.body.photos);
      }
    }

    const updateDoc = await DailyUpdate.create({
      site: site._id,
      siteName: site.name,
      siteCode: site.code,
      date: date ? new Date(date) : new Date(),
      title,
      description,
      workPhase: workPhase || 'General Construction',
      materialsUsed,
      progress,
      status: progress === undefined ? undefined : progress === 100 ? 'Completed' : 'In Progress',
      workersCount: parseInt(workersCount) || 0,
      weather: weather || 'Sunny',
      photos,
      supervisorName: supervisorName || 'Site Engineer',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: `Daily update recorded for ${site.name}`,
      data: updateDoc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete daily update
// @route   DELETE /api/daily-updates/:id
// @access  Public
exports.deleteDailyUpdate = async (req, res, next) => {
  try {
    const update = await DailyUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ success: false, message: 'Daily update not found' });
    }

    await DailyUpdate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Daily update deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

