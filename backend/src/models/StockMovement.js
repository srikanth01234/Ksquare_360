const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    movementType: {
      type: String,
      enum: ['INWARD', 'OUTWARD'],
      required: true,
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaterialMaster',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unit: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplierName: {
      type: String,
      trim: true,
      default: '',
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      default: null,
    },
    siteName: {
      type: String,
      default: '',
    },
    receivedBy: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);

