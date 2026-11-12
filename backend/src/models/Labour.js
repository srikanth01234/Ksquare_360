const mongoose = require('mongoose');

const labourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workerType: {
      type: String,
      required: true, // Mason, Helper, Bar Bender, Carpenter, Electrician, Plumber, Painter
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    aadhaarNumber: {
      type: String,
      default: '',
      trim: true,
    },
    panNumber: {
      type: String,
      default: '',
      trim: true,
    },
    photoUrl: {
      type: String,
      default: '',
    },
    dailyWage: {
      type: Number,
      required: true,
      default: 800,
      min: 0,
    },
    overtimeRate: {
      type: Number,
      default: 100,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    currentSite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Labour', labourSchema);

