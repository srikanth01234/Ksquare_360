const mongoose = require('mongoose');

const expenseItemSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialMaster',
    default: null,
  },
  materialName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

const expenseSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
    },
    siteName: {
      type: String,
      default: '',
    },
    siteCode: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Materials', 'Labour', 'Rental', 'Vehicle Rent', 'Additional Work', 'Other'],
      required: true,
      default: 'Materials',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    supplierName: {
      type: String,
      trim: true,
      default: '-',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Partial'],
      default: 'Paid',
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      default: 'Bank Transfer (NEFT)',
    },
    referenceNo: {
      type: String,
      default: '',
    },
    invoiceBillNo: {
      type: String,
      default: '',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    items: [expenseItemSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);

