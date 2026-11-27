const mongoose = require('mongoose');

const labourSchema = new mongoose.Schema(
  {
    engagementType: {
      type: String,
      enum: ['Daily Wage', 'Labour Contract'],
      default: 'Daily Wage',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    workerType: {
      type: String,
      required: true, // Mason, Helper, Bar Bender, etc. or Contract Work Type
      trim: true,
    },
    contractWorkType: {
      type: String,
      trim: true,
      default: '',
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
      default: 800,
      min: 0,
    },
    overtimeRate: {
      type: Number,
      default: 100,
      min: 0,
    },
    totalAreaSqft: {
      type: Number,
      default: 0,
      min: 0,
    },
    ratePerSqft: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalContractAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    contractStartDate: {
      type: Date,
      default: null,
    },
    expectedCompletionDate: {
      type: Date,
      default: null,
    },
    scopeNotes: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
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

