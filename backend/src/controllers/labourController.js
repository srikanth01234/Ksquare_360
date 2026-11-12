const Labour = require('../models/Labour');
const LabourAttendance = require('../models/LabourAttendance');
const Site = require('../models/Site');

// @desc    Get all workers with filters
// @route   GET /api/labour
// @access  Public
exports.getLabourers = async (req, res, next) => {
  try {
    const { workerType, status, siteId, search } = req.query;
    const filter = {};

    if (workerType && workerType !== 'All') {
      filter.workerType = workerType;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (siteId && siteId !== 'All') {
      filter.currentSite = siteId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { workerType: { $regex: search, $options: 'i' } },
        { aadhaarNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const workers = await Labour.find(filter)
      .populate('currentSite', 'name code location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker details with recent attendance history
// @route   GET /api/labour/:id
// @access  Public
exports.getLabourById = async (req, res, next) => {
  try {
    const worker = await Labour.findById(req.params.id).populate('currentSite');
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const recentAttendance = await LabourAttendance.find({ labour: worker._id })
      .populate('site', 'name code')
      .sort({ date: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        ...worker.toObject(),
        recentAttendance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new worker (KYC: Aadhaar, PAN, Photo, Wage rates)
// @route   POST /api/labour
// @access  Public
exports.createLabour = async (req, res, next) => {
  try {
    const {
      name,
      workerType,
      phone,
      address,
      aadhaarNumber,
      panNumber,
      dailyWage,
      overtimeRate,
      status,
      currentSite,
    } = req.body;

    if (!name || !workerType || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide worker name, workerType, and phone number',
      });
    }

    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/receipts/${req.file.filename}`;
    } else if (req.body.photoUrl) {
      photoUrl = req.body.photoUrl;
    }

    const worker = await Labour.create({
      name,
      workerType,
      phone,
      address: address || '',
      aadhaarNumber: aadhaarNumber || '',
      panNumber: panNumber || '',
      photoUrl,
      dailyWage: parseFloat(dailyWage) || 800,
      overtimeRate: parseFloat(overtimeRate) || 100,
      status: status || 'Active',
      currentSite: currentSite || null,
    });

    res.status(201).json({
      success: true,
      message: `Worker ${worker.name} registered successfully`,
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker profile, wage rates, or site assignment
// @route   PUT /api/labour/:id
// @access  Public
exports.updateLabour = async (req, res, next) => {
  try {
    const worker = await Labour.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const {
      name,
      workerType,
      phone,
      address,
      aadhaarNumber,
      panNumber,
      dailyWage,
      overtimeRate,
      status,
      currentSite,
    } = req.body;

    if (name) worker.name = name;
    if (workerType) worker.workerType = workerType;
    if (phone) worker.phone = phone;
    if (address !== undefined) worker.address = address;
    if (aadhaarNumber !== undefined) worker.aadhaarNumber = aadhaarNumber;
    if (panNumber !== undefined) worker.panNumber = panNumber;
    if (dailyWage !== undefined) worker.dailyWage = parseFloat(dailyWage);
    if (overtimeRate !== undefined) worker.overtimeRate = parseFloat(overtimeRate);
    if (status) worker.status = status;
    if (currentSite !== undefined) worker.currentSite = currentSite || null;

    if (req.file) {
      worker.photoUrl = `/uploads/receipts/${req.file.filename}`;
    }

    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker details updated successfully',
      data: worker,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record daily site attendance with wage calculation (Daily wage + Overtime)
// @route   POST /api/labour/attendance
// @access  Public
exports.recordAttendance = async (req, res, next) => {
  try {
    const { siteId, date, records } = req.body;

    if (!siteId || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide siteId and an array of attendance records',
      });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Construction site not found' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    const createdLogs = [];

    for (const item of records) {
      const worker = await Labour.findById(item.labourId);
      if (!worker) continue;

      const workerStatus = item.status || 'Present';
      const otHours = parseFloat(item.overtimeHours) || 0;
      const baseDaily = worker.dailyWage || 0;
      const otRate = worker.overtimeRate || 0;

      let earnedWage = 0;
      if (workerStatus === 'Present') {
        earnedWage = baseDaily + otHours * otRate;
      } else if (workerStatus === 'Half Day') {
        earnedWage = baseDaily / 2 + otHours * otRate;
      } else if (workerStatus === 'Overtime Only') {
        earnedWage = otHours * otRate;
      } else {
        earnedWage = 0;
      }

      const log = await LabourAttendance.create({
        labour: worker._id,
        workerName: worker.name,
        workerType: worker.workerType,
        site: site._id,
        siteName: site.name,
        date: attendanceDate,
        status: workerStatus,
        dailyWage: baseDaily,
        overtimeHours: otHours,
        overtimeRate: otRate,
        totalWageEarned: Math.round(earnedWage),
        notes: item.notes || '',
      });

      createdLogs.push(log);
    }

    res.status(201).json({
      success: true,
      message: `Recorded attendance for ${createdLogs.length} workers on ${site.name}`,
      data: createdLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wage summary report by site and date range
// @route   GET /api/labour/wages-summary
// @access  Public
exports.getWageSummary = async (req, res, next) => {
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

    const records = await LabourAttendance.find(filter)
      .populate('labour', 'name workerType phone')
      .populate('site', 'name code')
      .sort({ date: -1 });

    let totalWages = 0;
    let totalPresentDays = 0;
    let totalOvertimeHours = 0;

    records.forEach((r) => {
      totalWages += r.totalWageEarned || 0;
      totalOvertimeHours += r.overtimeHours || 0;
      if (r.status === 'Present') totalPresentDays += 1;
      else if (r.status === 'Half Day') totalPresentDays += 0.5;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRecords: records.length,
        totalWages: Math.round(totalWages),
        totalPresentDays,
        totalOvertimeHours,
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete labour record
// @route   DELETE /api/labour/:id
// @access  Public
exports.deleteLabour = async (req, res, next) => {
  try {
    const worker = await Labour.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    await Labour.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Worker deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};


