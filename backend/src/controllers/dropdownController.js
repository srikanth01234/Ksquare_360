const DropdownConfig = require('../models/DropdownConfig');
const DEFAULT_DROPDOWNS = require('../utils/defaultDropdowns');

/**
 * Ensure all built-in default dropdowns exist in MongoDB (idempotent seed)
 */
async function ensureDefaultsSeeded() {
  const existing = await DropdownConfig.find({}, 'key');
  const existingKeys = new Set(existing.map((d) => d.key));
  const missing = DEFAULT_DROPDOWNS.filter((d) => !existingKeys.has(d.key));
  if (missing.length > 0) {
    await DropdownConfig.insertMany(
      missing.map((d) => ({ ...d, isCustom: false })),
      { ordered: false }
    ).catch(() => {});
  }
}

// @desc    Get all dynamic dropdown configurations
// @route   GET /api/settings/dropdowns
// @access  Public
exports.getAllDropdowns = async (req, res, next) => {
  try {
    await ensureDefaultsSeeded();
    const { module: moduleFilter } = req.query;
    const filter = {};
    if (moduleFilter) {
      filter.module = moduleFilter;
    }

    const configs = await DropdownConfig.find(filter).sort({ module: 1, subGroup: 1, label: 1 });
    res.status(200).json({
      success: true,
      count: configs.length,
      data: configs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update options/label for a dropdown config by key
// @route   PUT /api/settings/dropdowns/:key
// @access  Public
exports.updateDropdown = async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const { options, label } = req.body;

    const config = await DropdownConfig.findOne({ key });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Dropdown configuration not found' });
    }

    if (Array.isArray(options)) {
      const cleaned = [];
      const seen = new Set();
      options.forEach((opt) => {
        const val = String(opt || '').trim();
        if (val && !seen.has(val.toLowerCase())) {
          seen.add(val.toLowerCase());
          cleaned.push(val);
        }
      });
      config.options = cleaned;
    }

    if (label && String(label).trim()) {
      config.label = String(label).trim();
    }

    await config.save();

    res.status(200).json({
      success: true,
      message: `Updated "${config.label}" successfully`,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new custom dropdown field inside a module
// @route   POST /api/settings/dropdowns
// @access  Public
exports.createDropdown = async (req, res, next) => {
  try {
    const { module: moduleName, label, subGroup, options } = req.body;
    if (!moduleName || !label) {
      return res.status(400).json({
        success: false,
        message: 'Module and dropdown label are required',
      });
    }

    const slug = `${moduleName}.${label}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const key = `custom.${slug}_${Date.now().toString().slice(-4)}`;

    const cleanedOptions = Array.isArray(options)
      ? options.map((o) => String(o || '').trim()).filter(Boolean)
      : [];

    const created = await DropdownConfig.create({
      key,
      module: moduleName.trim(),
      label: label.trim(),
      subGroup: (subGroup || 'Custom').trim(),
      options: cleanedOptions,
      isCustom: true,
    });

    res.status(201).json({
      success: true,
      message: `Created custom dropdown "${created.label}"`,
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a custom dropdown field
// @route   DELETE /api/settings/dropdowns/:key
// @access  Public
exports.deleteDropdown = async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const config = await DropdownConfig.findOne({ key });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Dropdown not found' });
    }
    if (!config.isCustom) {
      return res.status(400).json({
        success: false,
        message: 'Built-in dropdown lists cannot be deleted; you can edit or clear their options instead.',
      });
    }

    await DropdownConfig.deleteOne({ key });

    res.status(200).json({
      success: true,
      message: `Deleted custom dropdown "${config.label}"`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset a built-in dropdown to its default options
// @route   POST /api/settings/dropdowns/:key/reset
// @access  Public
exports.resetDropdown = async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const def = DEFAULT_DROPDOWNS.find((d) => d.key === key);
    if (!def) {
      return res.status(404).json({ success: false, message: 'No default template for this dropdown' });
    }

    const updated = await DropdownConfig.findOneAndUpdate(
      { key },
      { options: def.options, label: def.label },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Reset "${def.label}" to default options`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
