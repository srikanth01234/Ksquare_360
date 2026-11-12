const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/master/clients
// @access  Public
exports.getClients = async (req, res, next) => {
  try {
    const { search, status, type } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client by ID
// @route   GET /api/master/clients/:id
// @access  Public
exports.getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new client
// @route   POST /api/master/clients
// @access  Public
exports.createClient = async (req, res, next) => {
  try {
    const {
      name,
      type = 'Individual',
      phone,
      email,
      address1,
      address2,
      city,
      state = 'Tamil Nadu',
      pincode,
      gst,
      remarks,
      status = 'Active',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Client name is required',
      });
    }

    const client = await Client.create({
      name: name.trim(),
      type,
      phone: phone || '',
      email: email || '',
      address1: address1 || '',
      address2: address2 || '',
      city: city || '',
      state: state || 'Tamil Nadu',
      pincode: pincode || '',
      gst: gst || '',
      remarks: remarks || '',
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/master/clients/:id
// @access  Public
exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete client
// @route   DELETE /api/master/clients/:id
// @access  Public
exports.deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

