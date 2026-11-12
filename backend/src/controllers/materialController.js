const MaterialMaster = require('../models/MaterialMaster');
const GodownStock = require('../models/GodownStock');
const StockMovement = require('../models/StockMovement');

// @desc    Get all materials (with optional filters)
// @route   GET /api/master/materials
// @access  Public
exports.getMaterials = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (category && category !== 'All Categories') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await MaterialMaster.find(filter).sort({ createdAt: -1 });

    // Attach current stock from GodownStock for easy frontend display
    const materialIds = materials.map((m) => m._id);
    const stocks = await GodownStock.find({ material: { $in: materialIds } });
    const stockMap = {};
    stocks.forEach((s) => {
      stockMap[s.material.toString()] = {
        currentStock: s.currentStock,
        reorderLevel: s.reorderLevel,
      };
    });

    const enriched = materials.map((m) => {
      const stockInfo = stockMap[m._id.toString()] || { currentStock: 0, reorderLevel: 10 };
      return {
        ...m.toObject(),
        currentStock: stockInfo.currentStock,
        reorderLevel: stockInfo.reorderLevel,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material by ID
// @route   GET /api/master/materials/:id
// @access  Public
exports.getMaterialById = async (req, res, next) => {
  try {
    const material = await MaterialMaster.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const stock = await GodownStock.findOne({ material: material._id });

    res.status(200).json({
      success: true,
      data: {
        ...material.toObject(),
        currentStock: stock ? stock.currentStock : 0,
        reorderLevel: stock ? stock.reorderLevel : 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new material
// @route   POST /api/master/materials
// @access  Public
exports.createMaterial = async (req, res, next) => {
  try {
    const { name, category, unit, defaultPrice, status, imageUrl, initialStock, reorderLevel } = req.body;

    if (!name || !category || !unit || defaultPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide material name, category, unit, and defaultPrice',
      });
    }

    // Auto-generate unique code if not passed
    let code = req.body.code;
    if (!code) {
      const count = await MaterialMaster.countDocuments();
      code = `MAT-${String(count + 1).padStart(3, '0')}`;
    }

    const existingCode = await MaterialMaster.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: `Material with code ${code} already exists`,
      });
    }

    const material = await MaterialMaster.create({
      code: code.toUpperCase(),
      name,
      category,
      unit,
      defaultPrice: parseFloat(defaultPrice) || 0,
      status: status || 'Active',
      imageUrl: imageUrl || '',
    });

    // Automatically initialize Godown stock entry
    const stockQty = parseFloat(initialStock) || 0;
    const stock = await GodownStock.create({
      material: material._id,
      currentStock: stockQty,
      reorderLevel: parseFloat(reorderLevel) || 10,
    });

    // If initial stock was given, record movement log
    if (stockQty > 0) {
      await StockMovement.create({
        movementType: 'INWARD',
        material: material._id,
        quantity: stockQty,
        unit: material.unit,
        unitPrice: material.defaultPrice,
        totalAmount: stockQty * material.defaultPrice,
        supplierName: 'Initial Setup',
        notes: 'Initial inventory baseline',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Material and godown inventory created successfully',
      data: {
        ...material.toObject(),
        currentStock: stock.currentStock,
        reorderLevel: stock.reorderLevel,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update material details (Editable price and Active/Inactive status)
// @route   PUT /api/master/materials/:id
// @access  Public
exports.updateMaterial = async (req, res, next) => {
  try {
    const { name, category, unit, defaultPrice, status, imageUrl, reorderLevel } = req.body;

    const material = await MaterialMaster.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (name) material.name = name;
    if (category) material.category = category;
    if (unit) material.unit = unit;
    if (defaultPrice !== undefined) material.defaultPrice = parseFloat(defaultPrice);
    if (status) material.status = status;
    if (imageUrl !== undefined) material.imageUrl = imageUrl;

    await material.save();

    // If reorder level provided, update godown stock settings
    if (reorderLevel !== undefined) {
      await GodownStock.findOneAndUpdate(
        { material: material._id },
        { reorderLevel: parseFloat(reorderLevel) }
      );
    }

    const stock = await GodownStock.findOne({ material: material._id });

    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: {
        ...material.toObject(),
        currentStock: stock ? stock.currentStock : 0,
        reorderLevel: stock ? stock.reorderLevel : 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material (or deactivate if movements exist)
// @route   DELETE /api/master/materials/:id
// @access  Public
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await MaterialMaster.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Check if material has historical stock movements
    const movementCount = await StockMovement.countDocuments({ material: material._id });
    if (movementCount > 0) {
      // Deactivate instead of deleting to preserve historical integrity
      material.status = 'Inactive';
      await material.save();
      return res.status(200).json({
        success: true,
        message: 'Material has historical records; status set to Inactive to preserve audit history',
        data: material,
      });
    }

    await GodownStock.findOneAndDelete({ material: material._id });
    await MaterialMaster.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Material and stock entry permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};

