const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/master/employees
// @access  Public
exports.getEmployees = async (req, res, next) => {
  try {
    const { search, status, department } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { empId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/master/employees/:id
// @access  Public
exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/master/employees
// @access  Public
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      empId,
      name,
      phone,
      email,
      designation = 'Site Engineer',
      department = 'Civil',
      joiningDate,
      salary = 0,
      assignedSite = 'All Sites',
      employmentType = 'Permanent',
      status = 'Active',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Employee name is required',
      });
    }

    // Auto-generate employee ID if not provided
    let finalEmpId = empId;
    if (!finalEmpId || !finalEmpId.trim()) {
      const count = await Employee.countDocuments();
      finalEmpId = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    // Check duplicate empId
    const existing = await Employee.findOne({ empId: finalEmpId });
    if (existing) {
      finalEmpId = `EMP-${Date.now().toString().slice(-4)}`;
    }

    const employee = await Employee.create({
      empId: finalEmpId,
      name: name.trim(),
      phone: phone || '',
      email: email || '',
      designation,
      department,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      salary: parseFloat(salary) || 0,
      assignedSite,
      employmentType,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/master/employees/:id
// @access  Public
exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/master/employees/:id
// @access  Public
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

