const GodownStock = require('../models/GodownStock');
const StockMovement = require('../models/StockMovement');
const MaterialMaster = require('../models/MaterialMaster');
const Site = require('../models/Site');

// @desc    Get live Godown inventory stock with financial valuation & low-stock alerts
// @route   GET /api/godown/stocks
// @access  Public
exports.getGodownStocks = async (req, res, next) => {
  try {
    const { category, search, lowStockOnly } = req.query;

    const stocks = await GodownStock.find()
      .populate('material')
      .sort({ updatedAt: -1 });

    let filtered = stocks.filter((s) => s.material !== null);

    if (category && category !== 'All Categories') {
      filtered = filtered.filter((s) => s.material.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.material.name.toLowerCase().includes(q) ||
          s.material.code.toLowerCase().includes(q) ||
          s.material.category.toLowerCase().includes(q)
      );
    }

    if (lowStockOnly === 'true') {
      filtered = filtered.filter((s) => s.currentStock <= s.reorderLevel);
    }

    // Compute key analytics
    let totalInventoryValue = 0;
    let lowStockCount = 0;

    const formattedList = filtered.map((s) => {
      const isLowStock = s.currentStock <= s.reorderLevel;
      if (isLowStock) lowStockCount++;

      const itemVal = s.currentStock * (s.material.defaultPrice || 0);
      totalInventoryValue += itemVal;

      return {
        stockId: s._id,
        materialId: s.material._id,
        code: s.material.code,
        name: s.material.name,
        category: s.material.category,
        unit: s.material.unit,
        defaultPrice: s.material.defaultPrice,
        status: s.material.status,
        imageUrl: s.material.imageUrl,
        currentStock: s.currentStock,
        reorderLevel: s.reorderLevel,
        isLowStock,
        totalValue: Math.round(itemVal),
        lastUpdated: s.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalItems: formattedList.length,
        totalInventoryValue: Math.round(totalInventoryValue),
        lowStockCount,
      },
      data: formattedList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record Stock Inward (Stock Received into Godown)
// @route   POST /api/godown/inward
// @access  Public
exports.recordStockInward = async (req, res, next) => {
  try {
    const { materialId, quantity, unit, unitPrice, supplierName, notes, date } = req.body;

    if (!materialId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid materialId and quantity greater than 0',
      });
    }

    const material = await MaterialMaster.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (material.status === 'Inactive') {
      return res.status(400).json({
        success: false,
        message: `Material ${material.name} is Inactive. Activate it before adding new stock.`,
      });
    }

    const inwardQty = parseFloat(quantity);
    const pricePerUnit = unitPrice !== undefined ? parseFloat(unitPrice) : material.defaultPrice;
    const totalAmount = inwardQty * pricePerUnit;

    // 1. Update or create GodownStock
    let stock = await GodownStock.findOne({ material: material._id });
    if (!stock) {
      stock = new GodownStock({
        material: material._id,
        currentStock: 0,
        reorderLevel: 10,
      });
    }

    stock.currentStock += inwardQty;
    stock.lastUpdated = new Date();
    await stock.save();

    // 2. Record StockMovement audit entry
    const movement = await StockMovement.create({
      movementType: 'INWARD',
      material: material._id,
      quantity: inwardQty,
      unit: unit || material.unit,
      unitPrice: pricePerUnit,
      totalAmount,
      supplierName: supplierName || 'Direct Vendor',
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Successfully received ${inwardQty} ${material.unit} of ${material.name} into godown`,
      data: {
        currentStock: stock.currentStock,
        movement,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Issue Stock to Construction Site (Stock Outward with balance sufficiency check)
// @route   POST /api/godown/outward
// @access  Public
exports.recordStockOutward = async (req, res, next) => {
  try {
    const { materialId, siteId, quantity, receivedBy, notes, date } = req.body;

    if (!materialId || !siteId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide materialId, siteId, and valid quantity greater than 0',
      });
    }

    const material = await MaterialMaster.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Construction site not found' });
    }

    const outwardQty = parseFloat(quantity);

    // 1. Stock check: ensure sufficient stock exists
    let stock = await GodownStock.findOne({ material: material._id });
    if (!stock || stock.currentStock < outwardQty) {
      const available = stock ? stock.currentStock : 0;
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${material.name}. Requested: ${outwardQty} ${material.unit}, but only ${available} ${material.unit} available in godown.`,
      });
    }

    // 2. Decrement stock
    stock.currentStock -= outwardQty;
    stock.lastUpdated = new Date();
    await stock.save();

    // 3. Record Outward Movement with Site reference
    const movement = await StockMovement.create({
      movementType: 'OUTWARD',
      material: material._id,
      site: site._id,
      siteName: `${site.name} (${site.code})`,
      quantity: outwardQty,
      unit: material.unit,
      unitPrice: material.defaultPrice,
      totalAmount: outwardQty * material.defaultPrice,
      receivedBy: receivedBy || 'Site Supervisor',
      notes: notes || `Dispatched to site ${site.name}`,
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Successfully issued ${outwardQty} ${material.unit} of ${material.name} to ${site.name}`,
      data: {
        remainingStock: stock.currentStock,
        movement,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Movements audit history (Inward & Outward logs)
// @route   GET /api/godown/movements
// @access  Public
exports.getStockMovements = async (req, res, next) => {
  try {
    const { type, materialId, siteId, limit = 50 } = req.query;
    const filter = {};

    if (type && type !== 'All') {
      filter.movementType = type.toUpperCase();
    }

    if (materialId) {
      filter.material = materialId;
    }

    if (siteId) {
      filter.site = siteId;
    }

    const movements = await StockMovement.find(filter)
      .populate('material', 'name code unit category defaultPrice imageUrl')
      .populate('site', 'name code location client')
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

