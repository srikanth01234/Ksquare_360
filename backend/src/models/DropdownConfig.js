const mongoose = require('mongoose');

const dropdownConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    subGroup: {
      type: String,
      default: '',
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DropdownConfig', dropdownConfigSchema);
